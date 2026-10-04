import type { Reference } from "./types";

export interface ReviewGroup {
  reference: Reference;
  paths: string[];
}

export function reviewResolution(ref: Reference) {
  return (
    ref.resolution ||
    (ref.target !== null ? "entity" : ref.selector ? "selector" : "unresolved")
  );
}

// Group locations, never claim that dynamic expressions share a target.
// Keep roles, selector identities and registry statuses separate, just as the
// Markdown export does. Filters are applied before grouping.
export function groupReviewReferences(refs: Reference[]): ReviewGroup[] {
  const groups = new Map<string, ReviewGroup>();
  for (const ref of refs) {
    const key = JSON.stringify([
      ref.source_id,
      ref.source_type,
      ref.role,
      ref.confidence,
      ref.reason,
      reviewResolution(ref),
      ref.selector?.kind,
      ref.selector?.value,
      ref.selector?.exists,
    ]);
    const group = groups.get(key);
    if (group) group.paths.push(ref.path);
    else groups.set(key, { reference: ref, paths: [ref.path] });
  }
  return [...groups.values()];
}

export function reviewLabel(ref: Reference): string {
  if (reviewResolution(ref) === "device") return "Device reference";
  if (reviewResolution(ref) === "selector") return "Entity set not expanded";
  return ref.reason || "Dynamic or unrecognized target";
}

export function reviewRole(ref: Reference): string {
  return (
    {
      read: "Read or trigger",
      write: "Action",
      display: "Display",
      call: "Call",
      member: "Membership",
    }[ref.role] || ref.role
  );
}

export function reviewCounts(refs: Reference[]): string {
  const groups = groupReviewReferences(refs).length;
  return `${groups} ${groups === 1 ? "group" : "groups"} · ${refs.length} ${refs.length === 1 ? "location" : "locations"}`;
}
