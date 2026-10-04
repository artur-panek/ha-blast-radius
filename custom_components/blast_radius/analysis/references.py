"""Walk normalized configuration with explicit field semantics."""

import re
from typing import Any

from .models import Confidence, Reference, Resolution, Role, Scan, Selector, Source
from .templates import ENTITY_RE, inspect_template, is_template

MAX_NESTING = 80
MAX_REFERENCES = 50_000
_SKIP = {"alias", "description", "name", "icon", "unique_id", "id"}
_ENTITY_KEYS = {"entity_id", "entity", "entities", "entity_ids"}
_SCRIPT_SERVICES = {"turn_on", "turn_off", "toggle", "reload"}
_SELECTOR_KEYS = {"area_id", "device_id", "floor_id", "label_id"}
_DEVICE_POSITIONS = {
    "trigger",
    "triggers",
    "wait_for_trigger",
    "condition",
    "conditions",
    "if",
    "while",
    "until",
    "action",
    "actions",
    "sequence",
    "then",
    "else",
    "default",
    "parallel",
}
_NATIVE_NODE_PATH = re.compile(
    r"^(?:triggers?|conditions?|actions?|sequence)(?:\[\d+\])?"
    r"(?:\.(?:choose|conditions?|sequence|then|else|default|parallel|repeat|while|until|if|"
    r"wait_for_trigger)(?:\[\d+\])?)*$"
)


def scan_sources(sources: tuple[Source, ...], known_entities: set[str]) -> Scan:
    found: dict[Reference, None] = {}
    warnings: set[str] = set()
    located_by_source: dict[str, set[str]] = {}
    selectors_by_source: dict[str, set[tuple[str, str]]] = {}

    def emit(
        source: Source,
        target: str | None,
        path: str,
        confidence: Confidence,
        role: Role,
        reason: str = "",
        selector: Selector | None = None,
        resolution: Resolution | None = None,
    ) -> None:
        if len(found) >= MAX_REFERENCES:
            warnings.add("Reference limit reached; analysis is incomplete.")
            return
        found[
            Reference(
                source.source_id,
                source.source_type,
                target,
                path,
                confidence,
                role,
                reason,
                selector,
                resolution,
            )
        ] = None
        if target is not None:
            located_by_source.setdefault(source.source_id, set()).add(target)

    def emit_selector(
        source: Source,
        kind: str,
        value: str,
        path: str,
        role: Role,
        device_reference: bool = False,
    ) -> None:
        selectors_by_source.setdefault(source.source_id, set()).add((kind, value))
        # Registry presence confirms only the selector identity, not membership
        # or service-specific runtime eligibility. Never create entity edges here.
        # Do not serialize arbitrary data accidentally stored in selector fields.
        # A path, URL or other non-ID remains a generic unresolved reference.
        selector = (
            Selector(
                kind,
                value,
                (kind, value) in source.selector_registry
                if source.selector_registry is not None
                else None,
            )
            if re.fullmatch(r"[a-zA-Z0-9_-]{1,512}", value)
            else None
        )
        resolution = Resolution.DEVICE if device_reference else Resolution.SELECTOR
        reason = "Device identity reference" if device_reference else f"Unexpanded {kind} target"
        emit(
            source,
            None,
            path,
            Confidence.DYNAMIC,
            role,
            reason,
            selector,
            resolution if selector else Resolution.UNRESOLVED,
        )

    def walk(
        source: Source,
        value: Any,
        path: str,
        key: str,
        role: Role,
        depth: int,
        device_reference: bool = False,
        registry_entity: bool = False,
        event_filter: bool = False,
    ) -> None:
        if depth > MAX_NESTING:
            warnings.add(f"Nesting limit reached in {source.source_id}; analysis is incomplete.")
            return
        if len(found) >= MAX_REFERENCES:
            warnings.add("Reference limit reached; analysis is incomplete.")
            return
        if isinstance(value, dict):
            # Only HA device automation nodes accept entity registry IDs here.
            # An ID-looking value in service data, variables or a custom card
            # does not establish those semantics.
            native_source = (
                source.source_type in {"automation", "script"}
                and _NATIVE_NODE_PATH.fullmatch(path) is not None
            )
            device_node = (
                native_source
                and key in _DEVICE_POSITIONS
                and isinstance(value.get("device_id"), str)
                and isinstance(value.get("domain"), str)
                and isinstance(value.get("type"), str)
            )
            event_trigger = (
                native_source
                and key in {"trigger", "triggers", "wait_for_trigger"}
                and value.get("trigger", value.get("platform")) == "event"
            )
            if native_source and (
                isinstance(value.get("condition"), str)
                or (device_node and value.get("trigger", value.get("platform")) == "device")
            ):
                # A condition used as a sequence step still reads its entity.
                role = Role.READ
            for field, child in value.items():
                if not isinstance(field, str) or field in _SKIP:
                    continue
                child_path = f"{path}.{field}" if path else field
                next_role = role
                if field in {
                    "trigger",
                    "triggers",
                    "condition",
                    "conditions",
                    "if",
                    "while",
                    "until",
                    "wait_template",
                    "wait_for_trigger",
                    "variables",
                }:
                    next_role = Role.READ
                elif field in {"action", "actions", "sequence", "then", "else"}:
                    next_role = Role.WRITE
                if key == "entities" and ENTITY_RE.fullmatch(field):
                    emit(source, field, child_path, Confidence.EXPLICIT, role)
                    # Scene state attributes are not configuration references.
                    continue
                walk(
                    source,
                    child,
                    child_path,
                    field,
                    next_role,
                    depth + 1,
                    device_reference=field == "device_id"
                    and (device_node or (key == "event_data" and event_filter)),
                    registry_entity=field == "entity_id" and device_node,
                    event_filter=field == "event_data" and event_trigger,
                )
        elif isinstance(value, (list, tuple)):
            for index, child in enumerate(value):
                walk(
                    source,
                    child,
                    f"{path}[{index}]",
                    key,
                    role,
                    depth + 1,
                    device_reference,
                    registry_entity,
                    event_filter,
                )
        elif isinstance(value, str):
            if is_template(value):
                result = inspect_template(value)
                for target in result.literals:
                    # A states() read in action data is not an action target.
                    # Even templated targets can read one entity to select another.
                    # Keep their visible literals as dependencies, never guessed effects.
                    emit(source, target, path, Confidence.TEMPLATE_LITERAL, Role.READ)
                templated_target = (
                    key
                    in _ENTITY_KEYS
                    | {
                        "action",
                        "service",
                        "service_template",
                        "target",
                    }
                    | _SELECTOR_KEYS
                )
                if result.dynamic or templated_target:
                    emit(
                        source,
                        None,
                        path,
                        Confidence.DYNAMIC,
                        role,
                        result.reason
                        or ("Templated target" if templated_target else "Runtime expression"),
                    )
            elif key in _ENTITY_KEYS:
                # HA accepts comma-separated entity targets as well as arrays.
                for target in value.split(","):
                    target = target.strip()
                    if ENTITY_RE.fullmatch(target):
                        emit(source, target, path, Confidence.EXPLICIT, role)
                    elif (
                        registry_entity
                        and source.entity_registry is not None
                        and (resolved := source.entity_registry.get(target))
                        and ENTITY_RE.fullmatch(resolved)
                    ):
                        emit(
                            source,
                            resolved,
                            path,
                            Confidence.EXPLICIT,
                            role,
                            "Entity registry ID resolved",
                        )
                    elif target:
                        emit(
                            source,
                            None,
                            path,
                            Confidence.DYNAMIC,
                            role,
                            (
                                "Entity registry ID not found"
                                if source.entity_registry is not None
                                else "Entity registry lookup unavailable"
                            )
                            if registry_entity and re.fullmatch(r"[0-9a-f]{32}", target)
                            else "Entity pattern"
                            if any(char in target for char in "*?[")
                            else "Non-literal entity target",
                        )
            elif key in {"action", "service"}:
                if (
                    value.startswith("script.")
                    and value[7:] not in _SCRIPT_SERVICES
                    and ENTITY_RE.fullmatch(value)
                ):
                    emit(source, value, path, Confidence.EXPLICIT, Role.CALL)
            elif key in _SELECTOR_KEYS:
                emit_selector(source, key, value, path, role, device_reference)
            elif value in known_entities:
                emit(
                    source,
                    value,
                    path,
                    Confidence.UNKNOWN,
                    Role.READ,
                    "Literal in an untyped field",
                )

    for source in sources:
        initial = {"dashboard": Role.DISPLAY, "scene": Role.WRITE, "group": Role.MEMBER}.get(
            source.source_type, Role.READ
        )
        walk(source, source.config, "", "", initial, 0)
        # HA metadata has no location, role or execution guarantee. Supplement
        # only missing targets as reviewable reads, never duplicate a located ref
        # or manufacture a downstream effect from the native set.
        located = located_by_source.get(source.source_id, set())
        for target in sorted(source.native_entities - located):
            if ENTITY_RE.fullmatch(target):
                emit(
                    source,
                    target,
                    "metadata.referenced_entities",
                    Confidence.UNKNOWN,
                    Role.READ,
                    "HA-native reference; location and role unavailable",
                )
        selectors = selectors_by_source.get(source.source_id, set())
        for kind, value in sorted(source.native_selectors - selectors):
            emit_selector(source, kind, value, f"metadata.{kind}", Role.READ)
    return Scan(tuple(found), tuple(sorted(warnings)))
