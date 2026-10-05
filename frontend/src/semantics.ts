import type { GraphNode, Reference, Report } from "./types";

export type UsageCategory = "action" | "observe" | "context";
export type ReadKind = "trigger" | "check" | "read";

export interface UsageBucket {
  category: UsageCategory;
  title: string;
  shortLabel: string;
  description: string;
  refs: Reference[];
  sources: number;
}

export interface UsageStats {
  totalSources: number;
  actionSources: number;
  observeSources: number;
  contextSources: number;
  actionReferences: number;
  observeReferences: number;
  contextReferences: number;
}

export interface EffectItem {
  node: GraphNode;
  edge?: Reference;
  chained: boolean;
}

export interface EffectGroup {
  sourceId: string;
  sourceType: string;
  directReferences: Reference[];
  items: EffectItem[];
  directItems: EffectItem[];
  chainedItems: EffectItem[];
}

const sourceCount = (refs: Reference[]) =>
  new Set(refs.map((ref) => ref.source_id)).size;

const isTriggerPath = (path: string) =>
  /(?:^|\.)(?:triggers?|wait_for_trigger)(?:\[|\.|$)/.test(path);

const isCheckPath = (path: string) =>
  /(?:^|\.)(?:conditions?|condition|if|while|until|wait_template)(?:\[|\.|$)/.test(
    path,
  );

export function readKind(ref: Reference): ReadKind {
  if (isTriggerPath(ref.path)) return "trigger";
  if (isCheckPath(ref.path)) return "check";
  return "read";
}

export function usageCategory(ref: Reference): UsageCategory {
  if (ref.role === "write" || ref.role === "call") return "action";
  if (ref.role === "display" || ref.role === "member") return "context";
  return "observe";
}

export const usageMeta: Record<
  UsageCategory,
  { title: string; shortLabel: string; description: string }
> = {
  action: {
    title: "Can change or invoke this entity",
    shortLabel: "Acts on it",
    description:
      "Action targets and script calls. These references can directly change the selected entity or invoke it when it is callable.",
  },
  observe: {
    title: "Reads, checks or reacts to this entity",
    shortLabel: "Reads / reacts",
    description:
      "Triggers, conditions, templates and other reads. These references depend on the selected entity without directly changing it.",
  },
  context: {
    title: "Displays or contains this entity",
    shortLabel: "Displays / contains",
    description:
      "Dashboard displays and group membership. These references expose or organize the entity rather than driving its state.",
  },
};

export function usageBuckets(refs: Reference[]): UsageBucket[] {
  return (Object.keys(usageMeta) as UsageCategory[]).map((category) => {
    const bucketRefs = refs.filter((ref) => usageCategory(ref) === category);
    return {
      category,
      ...usageMeta[category],
      refs: bucketRefs,
      sources: sourceCount(bucketRefs),
    };
  });
}

export function usageStats(refs: Reference[]): UsageStats {
  const buckets = usageBuckets(refs);
  const byCategory = Object.fromEntries(
    buckets.map((bucket) => [bucket.category, bucket]),
  ) as Record<UsageCategory, UsageBucket>;
  return {
    totalSources: sourceCount(refs),
    actionSources: byCategory.action.sources,
    observeSources: byCategory.observe.sources,
    contextSources: byCategory.context.sources,
    actionReferences: byCategory.action.refs.length,
    observeReferences: byCategory.observe.refs.length,
    contextReferences: byCategory.context.refs.length,
  };
}

export function referenceUseLabel(ref: Reference): string {
  if (ref.role === "write") return "Changes / targets this entity";
  if (ref.role === "call") return "Calls this script";
  if (ref.role === "display") return "Displays this entity";
  if (ref.role === "member") return "Contains this entity as a member";
  if (readKind(ref) === "trigger") return "Triggers from this entity";
  if (readKind(ref) === "check") return "Checks this entity";
  if (ref.confidence === "template_literal")
    return "Reads this entity in a template";
  return "Reads this entity";
}

export function referenceSummary(refs: Reference[]): string {
  if (!refs.length) return "0 references";
  const labels = new Map<string, number>();
  for (const ref of refs) {
    const label = referenceUseLabel(ref);
    labels.set(label, (labels.get(label) || 0) + 1);
  }
  if (labels.size === 1) {
    const [label, count] = [...labels][0];
    const noun =
      label === "Changes / targets this entity"
        ? "action target"
        : label === "Calls this script"
          ? "call"
          : label === "Displays this entity"
            ? "display"
            : label === "Contains this entity as a member"
              ? "membership"
              : label === "Triggers from this entity"
                ? "trigger"
                : label === "Checks this entity"
                  ? "check"
                  : "read";
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
  }
  return `${refs.length} references · ${labels.size} kinds`;
}

export function effectRoleLabel(role?: string): string {
  if (role === "write") return "changes / targets";
  if (role === "call") return "calls";
  if (role === "member") return "contains";
  return role || "references";
}

function rootSourceFor(
  node: GraphNode,
  selectedId: string,
  nodes: Map<string, GraphNode>,
): string {
  let current = node.via;
  let root = selectedId;
  let guard = 0;
  while (current && current !== selectedId && guard++ < 64) {
    root = current;
    current = nodes.get(current)?.via;
  }
  return root;
}

function edgeForNode(report: Report, node: GraphNode): Reference | undefined {
  if (!node.via) return undefined;
  return report.graph.edges.find(
    (edge) => edge.source_id === node.via && edge.target === node.id,
  );
}

export function effectGroups(report: Report): EffectGroup[] {
  const nodeMap = new Map(report.graph.nodes.map((node) => [node.id, node]));
  const grouped = new Map<string, EffectItem[]>();

  for (const node of report.graph.nodes) {
    if (node.relationship !== "downstream") continue;
    const root = rootSourceFor(node, report.entity_id, nodeMap);
    const item: EffectItem = {
      node,
      edge: edgeForNode(report, node),
      chained: node.via !== root,
    };
    grouped.set(root, [...(grouped.get(root) || []), item]);
  }

  return [...grouped.entries()]
    .map(([sourceId, items]) => {
      const sourceRef =
        report.references.find((ref) => ref.source_id === sourceId) ||
        report.graph.edges.find((ref) => ref.source_id === sourceId);
      return {
        sourceId,
        sourceType: sourceRef?.source_type || sourceId.split(".")[0],
        directReferences: report.references.filter(
          (ref) =>
            ref.source_id === sourceId && ref.target === report.entity_id,
        ),
        items: [...items].sort(
          (a, b) =>
            a.node.depth - b.node.depth || a.node.id.localeCompare(b.node.id),
        ),
        directItems: items.filter((item) => !item.chained),
        chainedItems: items.filter((item) => item.chained),
      };
    })
    .sort((a, b) => {
      if (a.sourceId === report.entity_id) return -1;
      if (b.sourceId === report.entity_id) return 1;
      return a.sourceId.localeCompare(b.sourceId);
    });
}

export function effectNodeCount(report: Report): number {
  return report.graph.nodes.filter((node) => node.relationship === "downstream")
    .length;
}
