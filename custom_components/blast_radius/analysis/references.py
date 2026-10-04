"""Walk normalized configuration with explicit field semantics."""

from typing import Any

from .models import Confidence, Reference, Role, Scan, Source
from .templates import ENTITY_RE, inspect_template, is_template

MAX_NESTING = 80
MAX_REFERENCES = 50_000
_SKIP = {"alias", "description", "name", "icon", "unique_id", "id"}
_ENTITY_KEYS = {"entity_id", "entity", "entities", "entity_ids"}
_SCRIPT_SERVICES = {"turn_on", "turn_off", "toggle", "reload"}


def scan_sources(sources: tuple[Source, ...], known_entities: set[str]) -> Scan:
    found: dict[Reference, None] = {}
    warnings: set[str] = set()

    def emit(
        source: Source,
        target: str | None,
        path: str,
        confidence: Confidence,
        role: Role,
        reason: str = "",
    ) -> None:
        if len(found) >= MAX_REFERENCES:
            warnings.add("Reference limit reached; analysis is incomplete.")
            return
        found[
            Reference(source.source_id, source.source_type, target, path, confidence, role, reason)
        ] = None

    def walk(source: Source, value: Any, path: str, key: str, role: Role, depth: int) -> None:
        if depth > MAX_NESTING:
            warnings.add(f"Nesting limit reached in {source.source_id}; analysis is incomplete.")
            return
        if len(found) >= MAX_REFERENCES:
            warnings.add("Reference limit reached; analysis is incomplete.")
            return
        if isinstance(value, dict):
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
                walk(source, child, child_path, field, next_role, depth + 1)
        elif isinstance(value, (list, tuple)):
            for index, child in enumerate(value):
                walk(source, child, f"{path}[{index}]", key, role, depth + 1)
        elif isinstance(value, str):
            if is_template(value):
                result = inspect_template(value)
                for target in result.literals:
                    # A states() read in action data is not an action target.
                    # Even templated targets can read one entity to select another.
                    # Keep their visible literals as dependencies, never guessed effects.
                    emit(source, target, path, Confidence.TEMPLATE_LITERAL, Role.READ)
                templated_target = key in _ENTITY_KEYS | {
                    "action",
                    "service",
                    "service_template",
                    "target",
                }
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
                    elif target:
                        emit(
                            source,
                            None,
                            path,
                            Confidence.DYNAMIC,
                            role,
                            "Entity pattern"
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
            elif key in {"area_id", "device_id", "floor_id", "label_id"}:
                emit(source, None, path, Confidence.DYNAMIC, role, f"Unexpanded {key} target")
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
    return Scan(tuple(found), tuple(sorted(warnings)))
