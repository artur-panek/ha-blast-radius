const pathLabels: Record<string, string> = {
  views: "View",
  sections: "Section",
  cards: "Card",
  card: "Content",
  triggers: "Trigger",
  trigger: "Trigger",
  actions: "Action",
  action: "Action",
  sequence: "Step",
  conditions: "Condition",
  condition: "Condition",
  choose: "Branch",
  default: "Default",
  target: "Target",
  entity_id: "Entity ID",
  entities: "Entity",
  entity: "Entity",
  value_template: "Template",
};

export function readablePath(path: string): string {
  return path
    .split(".")
    .map((part) => {
      const match = /^(.*?)(?:\[(\d+)\])?$/.exec(part)!;
      const key = match[1];
      const label =
        pathLabels[key] ||
        key.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
      return `${label}${match[2] === undefined ? "" : ` ${Number(match[2]) + 1}`}`;
    })
    .join(" › ");
}

const reasons: Record<string, string> = {
  "Computed entity lookup": "The entity ID is calculated at runtime.",
  "External template variable":
    "A variable comes from runtime context or the card. Its value is not available here.",
  "Template helper or macro":
    "A helper or macro may read additional entities that are not visible in this expression.",
  "Unsupported template filter or test":
    "This filter or test may hide entity dependencies and is not resolved by the analyzer.",
  "State collection or computed lookup":
    "The expression reads a collection of states or selects a state dynamically.",
  "Computed value lookup": "A value is selected dynamically from a collection.",
  "Template import": "Imported template content is not inspected.",
  "Unsupported template syntax":
    "The expression could not be parsed. Visible entity IDs are still retained.",
  "Templated target":
    "The final action or entity target is produced by a template that is not executed here.",
  "Entity pattern":
    "A wildcard or pattern can match multiple entities; matches are not expanded.",
  "Non-literal entity target": "This field does not contain a fixed entity ID.",
};

export function explainReason(reason: string): string {
  if (reason.startsWith("Unexpanded "))
    return "This selector targets a device, area, floor or label. Its entity membership is not expanded.";
  return reason
    .split("; ")
    .map(
      (item) =>
        reasons[item] ||
        item ||
        "The target cannot be determined from the loaded configuration.",
    )
    .join(" ");
}
