"""Discover literal Jinja references using syntax only; never render a template."""

import re
from dataclasses import dataclass

from jinja2 import Environment, TemplateSyntaxError, nodes

ENTITY_RE = re.compile(r"[a-z_][a-z0-9_]*\.[a-z0-9_]+\Z")
ENTITY_TOKEN = re.compile(r"(?<![\w./])([a-z_][a-z0-9_]*\.[a-z0-9_]+)(?![\w./])")
_ENV = Environment()
_FUNCTIONS = {"states", "state_attr", "is_state", "is_state_attr", "has_value"}
_VALUE_FILTERS = {
    "float",
    "int",
    "round",
    "default",
    "abs",
    "lower",
    "upper",
    "trim",
    "length",
    "count",
    "list",
    "join",
    "sum",
    "min",
    "max",
    "replace",
    "string",
}
_VALUE_TESTS = {"defined", "undefined", "none", "boolean", "true", "false", "number", "string"}


@dataclass(frozen=True)
class TemplateReferences:
    literals: tuple[str, ...]
    dynamic: bool
    invalid: bool = False
    reason: str = ""


def is_template(value: str) -> bool:
    return any(marker in value for marker in ("{{", "{%", "{#"))


def inspect_template(value: str) -> TemplateReferences:
    """Literal strings are candidates, not proof of a runtime dependency."""
    try:
        return _inspect_template(value)
    except (TemplateSyntaxError, RecursionError):
        return TemplateReferences(
            tuple(sorted(set(ENTITY_TOKEN.findall(value)))),
            True,
            True,
            "Unsupported template syntax",
        )


def _external_names(tree: nodes.Template) -> set[str]:
    """Track simple local bindings in syntax only, without compiling or rendering.

    Branch assignments do not escape their block here: ambiguous bindings stay
    conservative. Unknown calls, filters, tests and lookups are checked separately.
    """
    external: set[str] = set()

    def targets(node: nodes.Node) -> set[str]:
        if isinstance(node, nodes.Name):
            return {node.name}
        return {name.name for name in node.find_all(nodes.Name) if name.ctx == "store"}

    def block(body: list[nodes.Node], bound: set[str]) -> None:
        local = set(bound)
        for item in body:
            if isinstance(item, nodes.Assign):
                visit(item.node, local)
                local.update(targets(item.target))
            else:
                visit(item, local)

    def visit(node: nodes.Node, bound: set[str]) -> None:
        if isinstance(node, nodes.Name):
            if node.ctx == "load" and node.name not in bound:
                external.add(node.name)
        elif isinstance(node, nodes.For):
            visit(node.iter, bound)
            loop_bound = bound | targets(node.target) | {"loop"}
            if node.test is not None:
                visit(node.test, loop_bound)
            block(node.body, loop_bound)
            block(node.else_, bound)
        elif isinstance(node, nodes.If):
            visit(node.test, bound)
            block(node.body, bound)
            block(node.elif_, bound)
            block(node.else_, bound)
        else:
            for child in node.iter_child_nodes():
                visit(child, bound)

    block(tree.body, set())
    return external


def _inspect_template(value: str) -> TemplateReferences:
    tree = _ENV.parse(value)
    literals: set[str] = set()
    reasons: set[str] = set()
    parents = {
        child: parent for parent in tree.find_all(nodes.Node) for child in parent.iter_child_nodes()
    }
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
                reasons.add("Computed entity lookup")
        else:
            # expand, area_entities, user macros, filters and external functions
            # can hide dependencies. A visible literal is still retained above.
            reasons.add("Template helper or macro")
    # Names, collection lookups, domain-wide iteration and custom filters can all
    # introduce dependencies absent from literal calls. Conservatively flag them.
    allowed_names = _FUNCTIONS | {"states"}
    if _external_names(tree) - allowed_names:
        reasons.add("External template variable")
    if any(n.name not in _VALUE_FILTERS for n in tree.find_all(nodes.Filter)):
        reasons.add("Unsupported template filter or test")
    if any(n.name not in _VALUE_TESTS for n in tree.find_all(nodes.Test)):
        reasons.add("Unsupported template filter or test")
    if any(tree.find_all((nodes.Include, nodes.Import, nodes.FromImport, nodes.Extends))):
        reasons.add("Template import")
    # A domain/state collection is broader than a literal entity. Do not mistake
    # states.sensor or bare states for a fully inspected dependency set.
    for item in tree.find_all(nodes.Name):
        if item.name != "states" or item.ctx != "load":
            continue
        parent = parents.get(item)
        if isinstance(parent, nodes.Call) and parent.node is item:
            continue
        if (
            isinstance(parent, nodes.Getitem)
            and isinstance(parent.arg, nodes.Const)
            and isinstance(parent.arg.value, str)
            and ENTITY_RE.fullmatch(parent.arg.value)
        ):
            continue
        if isinstance(parent, nodes.Getattr):
            grandparent = parents.get(parent)
            if isinstance(grandparent, nodes.Getattr) and ENTITY_RE.fullmatch(
                f"{parent.attr}.{grandparent.attr}"
            ):
                continue
        reasons.add("State collection or computed lookup")
    for item in tree.find_all(nodes.Getitem):
        if not (
            isinstance(item.node, nodes.Name)
            and item.node.name == "states"
            and isinstance(item.arg, nodes.Const)
            and isinstance(item.arg.value, str)
            and ENTITY_RE.fullmatch(item.arg.value)
        ):
            reasons.add("Computed value lookup")
    # Literal-only styling/text is not an unresolved entity dependency. Templated
    # action/target fields are handled separately by the configuration walker.
    return TemplateReferences(
        tuple(sorted(literals)), bool(reasons), reason="; ".join(sorted(reasons))
    )
