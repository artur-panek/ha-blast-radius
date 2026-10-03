"""Indexed dependency graph and bounded structural impact traversal."""

from collections import defaultdict, deque
from typing import Any

from .models import Reference, Role

MAX_NODES = 500
MAX_EDGES = 2_000
EFFECT_ROLES = {Role.WRITE, Role.CALL, Role.MEMBER}


class DependencyGraph:
    """Edges mean source configuration references target, not runtime causality."""

    def __init__(self, references: tuple[Reference, ...]) -> None:
        self.incoming: dict[str, list[Reference]] = defaultdict(list)
        self.outgoing: dict[str, list[Reference]] = defaultdict(list)
        for ref in dict.fromkeys(references):
            if ref.target is not None:
                self.incoming[ref.target].append(ref)
                self.outgoing[ref.source_id].append(ref)

    def impact(self, entity_id: str, max_depth: int = 6) -> dict[str, Any]:
        if not 1 <= max_depth <= 12:
            raise ValueError("Depth must be between 1 and 12")
        nodes: dict[str, dict[str, Any]] = {
            entity_id: {"id": entity_id, "depth": 0, "relationship": "selected"}
        }
        edges: dict[Reference, None] = {}
        truncated = False

        def follow(origin: str, ref: Reference, target: str, depth: int, relation: str) -> bool:
            nonlocal truncated
            if depth > max_depth or len(edges) >= MAX_EDGES:
                truncated = True
                return False
            if target not in nodes and len(nodes) >= MAX_NODES:
                truncated = True
                return False
            edges[ref] = None
            if target not in nodes or nodes[target]["depth"] > depth:
                nodes[target] = {
                    "id": target,
                    "depth": depth,
                    "relationship": relation,
                    "via": origin,
                    "path": ref.path,
                    "confidence": ref.confidence,
                }
                return True
            return False

        # Phase one: configurations that depend on the selected entity, recursively.
        queue = deque([(entity_id, 0)])
        dependents = {entity_id}
        while queue:
            current, depth = queue.popleft()
            for ref in self.incoming.get(current, []):
                if follow(current, ref, ref.source_id, depth + 1, "dependent"):
                    dependents.add(ref.source_id)
                    queue.append((ref.source_id, depth + 1))

        # Phase two: only action targets/calls/membership of impacted configurations.
        # Do not walk upstream from an action target: that would claim runtime chains.
        queue = deque((node, nodes[node]["depth"]) for node in sorted(dependents))
        visited: set[str] = set()
        while queue:
            current, depth = queue.popleft()
            if current in visited:
                continue
            visited.add(current)
            for ref in self.outgoing.get(current, []):
                # A dashboard groups independent cards, not a shared action sequence.
                # Keep its incoming dependency edges without expanding other card actions.
                if ref.source_type == "dashboard":
                    continue
                if ref.role not in EFFECT_ROLES or ref.target is None:
                    continue
                if follow(current, ref, ref.target, depth + 1, "downstream"):
                    queue.append((ref.target, depth + 1))

        edge_list = list(edges)
        return {
            "nodes": sorted(nodes.values(), key=lambda n: (n["depth"], n["id"])),
            "edges": [ref.as_dict() for ref in edge_list],
            "cycles": self._cycles(edge_list),
            "max_depth": max_depth,
            "truncated": truncated,
        }

    @staticmethod
    def _cycles(edges: list[Reference]) -> list[list[str]]:
        adjacency: dict[str, set[str]] = defaultdict(set)
        for ref in edges:
            if ref.target is not None:
                adjacency[ref.source_id].add(ref.target)
        visited: set[str] = set()
        active: set[str] = set()
        path: list[str] = []
        cycles: list[list[str]] = []

        def visit(node: str) -> None:
            if node in active:
                if len(cycles) < 50:
                    cycles.append(path[path.index(node) :] + [node])
                return
            if node in visited:
                return
            visited.add(node)
            active.add(node)
            path.append(node)
            for target in sorted(adjacency.get(node, set())):
                visit(target)
            path.pop()
            active.remove(node)

        for node in sorted(adjacency):
            visit(node)
        return cycles
