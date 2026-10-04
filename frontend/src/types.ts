export type Confidence =
  "explicit" | "template_literal" | "dynamic" | "unknown";
export interface Reference {
  source_id: string;
  source_type: string;
  target: string | null;
  path: string;
  confidence: Confidence;
  role: string;
  reason: string;
}
export interface GraphNode {
  id: string;
  depth: number;
  relationship: "selected" | "dependent" | "downstream";
  via?: string;
  path?: string;
  confidence?: Confidence;
}
export interface Report {
  entity_id: string;
  exists: boolean;
  read_only: true;
  snapshot_at: string;
  references: Reference[];
  uncertain_references: Reference[];
  other_dashboard_references?: Reference[];
  source_names?: Record<string, string>;
  navigation?: Record<string, NavigationTarget>;
  unresolved_total: number;
  graph: {
    nodes: GraphNode[];
    edges: Reference[];
    cycles: string[][];
    truncated: boolean;
    limits_reached?: ("depth" | "nodes" | "edges")[];
    max_depth: number;
  };
  summary: {
    references: number;
    sources: number;
    downstream: number;
    explicit: number;
    template_literal: number;
    unknown: number;
  };
  coverage: {
    sources: number;
    entities: number;
    source_types: Record<string, number>;
    warnings?: string[];
  };
  warnings: string[];
  markdown: string;
  preview?: {
    operation: "rename" | "delete";
    new_entity_id: string | null;
    changes_applied: false;
    note: string;
    affected_sources: Record<string, number>;
  };
}
export type NavigationTarget =
  | { kind: "automation" | "script" | "scene" | "dashboard"; path: string }
  | { kind: "entity"; entity_id: string };
export interface Entity {
  entity_id: string;
  name: string;
  exists: boolean;
}
export interface Hass {
  user?: { id: string };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}
