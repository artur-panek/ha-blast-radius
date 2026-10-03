"""Discover literal Jinja references using syntax only; never render a template."""

import re
from dataclasses import dataclass

from jinja2 import Environment, TemplateSyntaxError, nodes

ENTITY_RE = re.compile(r"[a-z_][a-z0-9_]*\.[a-z0-9_]+\Z")
ENTITY_TOKEN = re.compile(r"(?<![\w./])([a-z_][a-z0-9_]*\.[a-z0-9_]+)(?![\w./])")
_ENV = Environment()
_FUNCTIONS = {"states", "state_attr", "is_state", "is_state_attr", "has_value"}
_VALUE_FILTERS = {"float", "int", "round", "default", "abs", "lower", "upper", "trim"}


@dataclass(frozen=True)
class TemplateReferences:
    literals: tuple[str, ...]
    dynamic: bool
    invalid: bool = False


def is_template(value: str) -> bool:
    return any(marker in value for marker in ("{{", "{%", "{#"))


def inspect_template(value: str) -> TemplateReferences:
    """Literal strings are candidates, not proof of a runtime dependency."""
    try:
        return _inspect_template(value)
    except (TemplateSyntaxError, RecursionError):
        return TemplateReferences(tuple(sorted(set(ENTITY_TOKEN.findall(value)))), True, True)


def _inspect_template(value: str) -> TemplateReferences:
    tree = _ENV.parse(value)
    literals: set[str] = set()
    dynamic = False
    for item in tree.find_all(nodes.Const):
        if isinstance(item.value, str):
            literals.update(ENTITY_TOKEN.findall(item.value))
    for item in tree.find_all(nodes.Getattr):
        parent = item.node
        if (
            isinstance(parent, nodes.Getattr)
            and isinstance(parent.node, nodes.Name)
            and parent.node.name == "states"
        ):
            entity_id = f"{parent.attr}.{item.attr}"
            if ENTITY_RE.fullmatch(entity_id):
                literals.add(entity_id)
    for call in tree.find_all(nodes.Call):
        if isinstance(call.node, nodes.Name) and call.node.name in _FUNCTIONS:
            if not call.args or not (
                isinstance(call.args[0], nodes.Const)
                and isinstance(call.args[0].value, str)
                and ENTITY_RE.fullmatch(call.args[0].value)
            ):
                dynamic = True
        else:
            # expand, area_entities, user macros, filters and external functions
            # can hide dependencies. A visible literal is still retained above.
            dynamic = True
    # Names, collection lookups, domain-wide iteration and custom filters can all
    # introduce dependencies absent from literal calls. Conservatively flag them.
    allowed_names = _FUNCTIONS | {"states"}
    if any(n.name not in allowed_names for n in tree.find_all(nodes.Name)):
        dynamic = True
    if any(n.name not in _VALUE_FILTERS for n in tree.find_all(nodes.Filter)):
        dynamic = True
    for item in tree.find_all(nodes.Getitem):
        if not (
            isinstance(item.node, nodes.Name)
            and item.node.name == "states"
            and isinstance(item.arg, nodes.Const)
            and isinstance(item.arg.value, str)
            and ENTITY_RE.fullmatch(item.arg.value)
        ):
            dynamic = True
    # Literal-only styling/text is not an unresolved entity dependency. Templated
    # action/target fields are handled separately by the configuration walker.
    return TemplateReferences(tuple(sorted(literals)), dynamic)
