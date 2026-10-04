"""Version-coupled HA access, isolated from the pure analysis engine.

Reads the same loaded raw_config objects used by HA's automation/config and
script/config WebSocket commands. Dashboard loading delegates to Lovelace.
No filesystem parsing, service calls, template rendering or config writes.
"""

from typing import Any
from urllib.parse import quote

from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_component import DATA_INSTANCES
from homeassistant.helpers.template import Template

from .analysis.models import Source


def navigation_targets(
    hass: HomeAssistant, sources: tuple[Source, ...], entity_ids: set[str]
) -> dict[str, dict[str, str]]:
    """Build local editor links using HA IDs, never entity-name guesses or service calls."""
    registry = er.async_get(hass)
    source_by_id = {source.source_id: source for source in sources}
    result: dict[str, dict[str, str]] = {}
    for entity_id in entity_ids:
        source = source_by_id.get(entity_id)
        if source and source.source_type == "dashboard":
            path = entity_id.removeprefix("dashboard.")
            # Dashboard URL paths are encoded as one segment, not arbitrary URLs.
            result[entity_id] = {"kind": "dashboard", "path": f"/{quote(path, safe='')}"}
            continue
        state = hass.states.get(entity_id)
        entry = registry.async_get(entity_id)
        if state is None and entry is None:
            continue
        domain = entity_id.partition(".")[0]
        editor_id = None
        if domain in {"automation", "scene"} and state is not None:
            editor_id = state.attributes.get("id")
        elif domain == "script" and source and entry is not None:
            editor_id = entry.unique_id
        if (
            domain in {"automation", "script", "scene"}
            and isinstance(editor_id, (str, int))
            and str(editor_id)
        ):
            result[entity_id] = {
                "kind": domain,
                "path": f"/config/{domain}/edit/{quote(str(editor_id), safe='')}",
            }
            continue
        # YAML automations/scenes without IDs and ordinary entities open HA's
        # more-info dialog. Disabled/removed entities without states have no dialog.
        if state is not None:
            result[entity_id] = {"kind": "entity", "entity_id": entity_id}
    return result


def _normalize(value: Any, depth: int = 0) -> Any:
    if depth > 80:
        raise ValueError("Configuration nesting exceeds analysis limit")
    if isinstance(value, Template):
        value = value.template
    if isinstance(value, dict):
        return {str(k): _normalize(v, depth + 1) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_normalize(v, depth + 1) for v in value]
    if isinstance(value, str) and len(value) > 65_536:
        raise ValueError("Configuration string exceeds analysis limit")
    if value is None or isinstance(value, (str, bool, int, float)):
        return value
    # Durations and other HA value objects cannot be entity references.
    return None


async def collect_snapshot(
    hass: HomeAssistant,
) -> tuple[tuple[Source, ...], dict[str, str], tuple[str, ...]]:
    names = {
        entity.entity_id: entity.name or entity.original_name or entity.entity_id
        for entity in er.async_get(hass).entities.values()
    }
    names.update({state.entity_id: state.name for state in hass.states.async_all()})
    sources: list[Source] = []
    warnings: list[str] = []
    components = hass.data.get(DATA_INSTANCES, {})
    for domain in ("automation", "script"):
        component = components.get(domain)
        if component is None:
            continue
        for entity in list(component.entities):
            config = getattr(entity, "raw_config", None)
            if not isinstance(config, dict):
                warnings.append(f"Configuration unavailable for {entity.entity_id}.")
                continue
            if "use_blueprint" in config:
                warnings.append(f"{entity.entity_id}: blueprint body is not expanded; inputs only.")
            try:
                normalized = _normalize(config)
            except ValueError:
                warnings.append(
                    f"Configuration size limit reached for {entity.entity_id}; skipped."
                )
                continue
            sources.append(
                Source(
                    entity.entity_id,
                    domain,
                    names.get(entity.entity_id, entity.entity_id),
                    normalized,
                )
            )

    # HA exposes scene and legacy group membership in entity state attributes.
    for state in hass.states.async_all():
        if state.domain not in {"scene", "group"}:
            continue
        members = state.attributes.get("entity_id")
        if isinstance(members, (list, tuple, str)):
            try:
                members = _normalize(members)
            except ValueError:
                warnings.append(f"Membership size limit reached for {state.entity_id}; skipped.")
                continue
            sources.append(
                Source(state.entity_id, state.domain, state.name, {"entity_id": members})
            )

    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is not None:
        for path, dashboard in list(lovelace.dashboards.items()):
            source_id = f"dashboard.{path or 'lovelace'}"
            try:
                config = await dashboard.async_load(False)
                sources.append(
                    Source(source_id, "dashboard", path or "Overview", _normalize(config))
                )
            except Exception:  # A broken/auto-generated dashboard must not hide other sources.
                # Do not include exceptions: YAML errors can contain secrets or local paths.
                warnings.append(
                    f"{source_id}: configuration unavailable or generated automatically."
                )

    warnings.append(
        "Coverage excludes helper configuration without exposed membership, template "
        "integration definitions, external integrations and unexpanded "
        "device/area/floor/label targets."
    )
    return tuple(sources), names, tuple(warnings)
