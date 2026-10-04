import type { GraphNode, Reference, Report } from "./types";

export const sourceTypes = [
  "automation",
  "script",
  "dashboard",
  "scene",
  "group",
] as const;
export type SourceType = (typeof sourceTypes)[number];
export type ReviewFilter = "explicit" | "template_literal" | "review";

export function matchesReference(
  ref: Reference,
  sources: SourceType[],
  confidence: ReviewFilter[],
): boolean {
  const review: ReviewFilter =
    ref.confidence === "dynamic" || ref.confidence === "unknown"
      ? "review"
      : ref.confidence;
  return (
    (!sources.length || sources.includes(ref.source_type as SourceType)) &&
    (!confidence.length || confidence.includes(review))
  );
}

export function visibleNodes(
  report: Report,
  matches: (ref: Reference) => boolean,
): GraphNode[] {
  const edges = report.graph.edges.filter(matches);
  const byId = new Map(report.graph.nodes.map((node) => [node.id, node]));
  return report.graph.nodes.flatMap((node) => {
    if (node.relationship === "selected") return [node];
    const candidates = edges.filter((edge) => {
      const dependent = node.relationship === "dependent";
      if (dependent ? edge.source_id !== node.id : edge.target !== node.id)
        return false;
      const via = byId.get(dependent ? edge.target! : edge.source_id);
      // Only an existing shortest traversal predecessor may explain this node.
      // A dependent's unrelated action target is not a path back to the root.
      return (
        via?.depth === node.depth - 1 &&
        (dependent
          ? via.relationship !== "downstream"
          : ["write", "call", "member"].includes(edge.role))
      );
    });
    const edge =
      candidates.find(
        (edge) =>
          edge.path === node.path &&
          edge.confidence === node.confidence &&
          (node.relationship === "dependent" ? edge.target : edge.source_id) ===
            node.via,
      ) || candidates[0];
    if (!edge) return [];
    return [
      {
        ...node,
        via: node.relationship === "dependent" ? edge.target! : edge.source_id,
        path: edge.path,
        confidence: edge.confidence,
      },
    ];
  });
}
