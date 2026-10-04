"""Immutable snapshot analysis and non-mutating change previews."""

import re
from collections import Counter
from typing import Any

from .graph import DependencyGraph
from .models import Confidence, InvalidInput, Source
from .references import scan_sources
from .templates import ENTITY_RE


def _card_scope(path: str) -> str | None:
    """Use the nearest standard card boundary; custom card semantics stay unknown."""
    matches = list(re.finditer(r"(?:^|\.)cards\[\d+\]", path))
    return path[: matches[-1].end()] if matches else None


class Analyzer:
    def __init__(
        self, sources: tuple[Source, ...], entities: set[str], warnings: tuple[str, ...] = ()
    ) -> None:
        self.sources = {source.source_id: source for source in sources}
        self.entities = frozenset(entities)
        scan = scan_sources(sources, entities)
        self.references = scan.references
        self.warnings = warnings + scan.warnings
        self.graph = DependencyGraph(self.references)

    def analyze(self, entity_id: str, max_depth: int = 6) -> dict[str, Any]:
        if not ENTITY_RE.fullmatch(entity_id):
            raise InvalidInput("Use a valid domain.entity_id")
        direct = self.graph.incoming.get(entity_id, [])
        graph = self.graph.impact(entity_id, max_depth)
        affected = {n["id"] for n in graph["nodes"]}
        unresolved = [ref for ref in self.references if ref.target is None]
        linked_cards: dict[str, set[str]] = {}
        for ref in graph["edges"]:
            if ref["source_type"] == "dashboard" and (scope := _card_scope(ref["path"])):
                linked_cards.setdefault(ref["source_id"], set()).add(scope)
        uncertain = []
        other_dashboard = []
        for ref in unresolved:
            if ref.source_id not in affected:
                continue
            scope = _card_scope(ref.path)
            in_linked_card = scope is not None and any(
                scope == linked or scope.startswith(linked + ".") or linked.startswith(scope + ".")
                for linked in linked_cards.get(ref.source_id, ())
            )
            if ref.source_type == "dashboard" and not in_linked_card:
                other_dashboard.append(ref.as_dict())
            else:
                uncertain.append(ref.as_dict())
        warnings = list(self.warnings)
        exists = entity_id in self.entities
        if not exists:
            warnings.append(
                "Entity has no current state or registry entry; stale references are still shown."
            )
        if graph["truncated"]:
            warnings.append(
                "Graph traversal reached its depth or size limit; more dependencies may exist."
            )
        if graph["cycles"]:
            warnings.append(
                "Cyclic configuration references found; traversal stopped revisiting nodes."
            )
        counts = Counter(ref.confidence.value for ref in direct)
        return {
            "entity_id": entity_id,
            "exists": exists,
            "read_only": True,
            "references": [ref.as_dict() for ref in direct],
            "graph": graph,
            "uncertain_references": uncertain,
            "other_dashboard_references": other_dashboard,
            "source_names": {
                key: source.name for key, source in self.sources.items() if key in affected
            },
            "unresolved_total": len(unresolved),
            "summary": {
                "references": len(direct),
                "sources": len({ref.source_id for ref in direct}),
                "downstream": sum(n["relationship"] == "downstream" for n in graph["nodes"]),
                "explicit": counts[Confidence.EXPLICIT],
                "template_literal": counts[Confidence.TEMPLATE_LITERAL],
                "unknown": counts[Confidence.UNKNOWN],
            },
            "coverage": {
                "sources": len(self.sources),
                "entities": len(self.entities),
                "source_types": dict(Counter(s.source_type for s in self.sources.values())),
            },
            "warnings": warnings,
        }

    def preview(
        self, entity_id: str, operation: str, new_entity_id: str | None = None, max_depth: int = 6
    ) -> dict[str, Any]:
        if operation not in {"rename", "delete"}:
            raise InvalidInput("Operation must be rename or delete")
        if operation == "rename":
            if not new_entity_id or not ENTITY_RE.fullmatch(new_entity_id):
                raise InvalidInput("Enter a valid replacement entity ID")
            if entity_id == new_entity_id:
                raise InvalidInput("Replacement must be different")
            if entity_id.partition(".")[0] != new_entity_id.partition(".")[0]:
                raise InvalidInput("A rename must stay in the same domain")
            if new_entity_id in self.entities:
                raise InvalidInput("Replacement entity ID already exists")
        elif new_entity_id is not None:
            raise InvalidInput("Removal previews do not accept a replacement entity ID")
        report = self.analyze(entity_id, max_depth)
        distinct = {(ref["source_id"], ref["source_type"]) for ref in report["references"]}
        report["preview"] = {
            "operation": operation,
            "new_entity_id": new_entity_id,
            "affected_sources": dict(Counter(t for _, t in distinct)),
            "changes_applied": False,
            "note": "Static review only. Home Assistant may update some references itself; "
            "this report does not predict automatic rewrites or runtime execution.",
        }
        return report


def markdown_report(report: dict[str, Any]) -> str:
    """Export identifiers and paths, never full source configuration or template text."""
    lines = [
        "# HA Blast Radius report",
        "",
        f"Entity: `{report['entity_id']}`",
        "",
        "Read-only static analysis. No changes have been made.",
        "",
    ]
    if preview := report.get("preview"):
        lines += [
            f"Preview: {preview['operation']}",
            f"Replacement: `{preview['new_entity_id']}`" if preview["new_entity_id"] else "",
            "",
        ]
    lines += ["## Direct references", ""]
    for ref in report["references"]:
        lines.append(f"- `{ref['source_id']}` — `{ref['path']}` ({ref['confidence']})")
    if not report["references"]:
        lines.append(
            "No direct references found in inspected sources; this is not a guarantee of safety."
        )
    lines += ["", "## Structural impact", ""]
    for node in report["graph"]["nodes"]:
        lines.append(f"- `{node['id']}` — {node['relationship']}, depth {node['depth']}")
    lines += [
        "",
        "## Unresolved references",
        "",
        f"{report['unresolved_total']} unresolved references across the whole snapshot; "
        "these cannot be attributed to the selected entity.",
    ]
    for ref in report["uncertain_references"]:
        lines.append(f"- `{ref['source_id']}` — `{ref['path']}` ({ref['reason']})")
    other_dashboard = report.get("other_dashboard_references", [])
    if other_dashboard:
        lines += [
            "",
            "### Elsewhere in linked dashboards",
            "",
            f"{len(other_dashboard)} additional expressions outside cards with known links. "
            "These are retained for context, not attributed to the selected entity.",
        ]
        for ref in other_dashboard:
            lines.append(f"- `{ref['source_id']}` — `{ref['path']}` ({ref['reason']})")
    lines += ["", "## Coverage and warnings", "", str(report["coverage"])]
    lines.extend(f"- {warning}" for warning in report["warnings"])
    lines += ["", "Generated by HA Blast Radius.", ""]
    return "\n".join(lines)
