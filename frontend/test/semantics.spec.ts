import { test, expect } from "@playwright/test";
import {
  effectGroups,
  readKind,
  referenceSummary,
  referenceUseLabel,
  usageBuckets,
  usageCategory,
  usageStats,
} from "../src/semantics";
import type { Reference, Report } from "../src/types";

const ref = (overrides: Partial<Reference> = {}): Reference => ({
  source_id: "automation.example",
  source_type: "automation",
  target: "light.office",
  path: "actions[0].target.entity_id",
  confidence: "explicit",
  role: "write",
  reason: "",
  resolution: "entity",
  ...overrides,
});

test("usage semantics distinguish actions, reads, triggers, checks and context", () => {
  const refs = [
    ref(),
    ref({ role: "call", target: "script.scene_mode", path: "actions[1].action" }),
    ref({ role: "read", path: "triggers[0].entity_id" }),
    ref({ role: "read", path: "conditions[0].entity_id" }),
    ref({ role: "read", path: "variables.source" }),
    ref({ role: "display", source_id: "dashboard.home", source_type: "dashboard" }),
    ref({ role: "member", source_id: "group.rooms", source_type: "group" }),
  ];

  expect(usageCategory(refs[0])).toBe("action");
  expect(usageCategory(refs[2])).toBe("observe");
  expect(usageCategory(refs[5])).toBe("context");
  expect(readKind(refs[2])).toBe("trigger");
  expect(readKind(refs[3])).toBe("check");
  expect(readKind(refs[4])).toBe("read");
  expect(referenceUseLabel(refs[0])).toBe("Changes / targets this entity");
  expect(referenceUseLabel(refs[2])).toBe("Triggers from this entity");
  expect(referenceUseLabel(refs[3])).toBe("Checks this entity");

  const buckets = usageBuckets(refs);
  expect(buckets.map((bucket) => [bucket.category, bucket.refs.length])).toEqual([
    ["action", 2],
    ["observe", 3],
    ["context", 2],
  ]);
  expect(usageStats(refs)).toMatchObject({
    totalSources: 3,
    actionSources: 1,
    observeSources: 1,
    contextSources: 2,
    actionReferences: 2,
    observeReferences: 3,
    contextReferences: 2,
  });
  expect(referenceSummary([refs[2]])).toBe("1 trigger");
});

test("related effects are grouped under the direct flow that also uses the selected entity", () => {
  const selected = "light.office";
  const directA = ref({
    source_id: "automation.a",
    target: selected,
    path: "actions[0].target.entity_id",
  });
  const directB = ref({
    source_id: "script.b",
    source_type: "script",
    target: selected,
    path: "sequence[0].target.entity_id",
  });
  const aTarget = ref({
    source_id: "automation.a",
    target: "switch.fan",
    path: "actions[1].target.entity_id",
  });
  const aCall = ref({
    source_id: "automation.a",
    target: "script.helper",
    path: "actions[2].action",
    role: "call",
  });
  const helperTarget = ref({
    source_id: "script.helper",
    source_type: "script",
    target: "light.ambient",
    path: "sequence[0].target.entity_id",
  });
  const bTarget = ref({
    source_id: "script.b",
    source_type: "script",
    target: "input_boolean.mode",
    path: "sequence[1].target.entity_id",
  });

  const report = {
    entity_id: selected,
    references: [directA, directB],
    graph: {
      nodes: [
        { id: selected, depth: 0, relationship: "selected" },
        {
          id: "automation.a",
          depth: 1,
          relationship: "dependent",
          via: selected,
          path: directA.path,
          confidence: "explicit",
        },
        {
          id: "script.b",
          depth: 1,
          relationship: "dependent",
          via: selected,
          path: directB.path,
          confidence: "explicit",
        },
        {
          id: "switch.fan",
          depth: 2,
          relationship: "downstream",
          via: "automation.a",
          path: aTarget.path,
          confidence: "explicit",
        },
        {
          id: "script.helper",
          depth: 2,
          relationship: "downstream",
          via: "automation.a",
          path: aCall.path,
          confidence: "explicit",
        },
        {
          id: "light.ambient",
          depth: 3,
          relationship: "downstream",
          via: "script.helper",
          path: helperTarget.path,
          confidence: "explicit",
        },
        {
          id: "input_boolean.mode",
          depth: 2,
          relationship: "downstream",
          via: "script.b",
          path: bTarget.path,
          confidence: "explicit",
        },
      ],
      edges: [directA, directB, aTarget, aCall, helperTarget, bTarget],
    },
  } as unknown as Report;

  const groups = effectGroups(report);
  expect(groups.map((group) => group.sourceId)).toEqual([
    "automation.a",
    "script.b",
  ]);
  expect(groups[0].directReferences).toEqual([directA]);
  expect(groups[0].directItems.map((item) => item.node.id)).toEqual([
    "script.helper",
    "switch.fan",
  ]);
  expect(groups[0].chainedItems.map((item) => item.node.id)).toEqual([
    "light.ambient",
  ]);
  expect(groups[1].items.map((item) => item.node.id)).toEqual([
    "input_boolean.mode",
  ]);
});

test("selected configurations keep their own outputs separate from co-effects", () => {
  const selected = "script.scene_mode";
  const own = ref({
    source_id: selected,
    source_type: "script",
    target: "light.office",
    path: "sequence[0].target.entity_id",
  });
  const report = {
    entity_id: selected,
    references: [],
    graph: {
      nodes: [
        { id: selected, depth: 0, relationship: "selected" },
        {
          id: "light.office",
          depth: 1,
          relationship: "downstream",
          via: selected,
          path: own.path,
          confidence: "explicit",
        },
      ],
      edges: [own],
    },
  } as unknown as Report;

  const groups = effectGroups(report);
  expect(groups).toHaveLength(1);
  expect(groups[0].sourceId).toBe(selected);
  expect(groups[0].directReferences).toEqual([]);
  expect(groups[0].directItems.map((item) => item.node.id)).toEqual([
    "light.office",
  ]);
});
