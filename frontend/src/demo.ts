import "./panel";
import { BlastRadiusPanel } from "./panel";
import data from "./demo-data.json";
import type { NavigationTarget, Report } from "./types";

const reports = data.reports as Record<string, unknown>;
const panel = document.querySelector<BlastRadiusPanel>("blast-radius-panel")!;
// This harness is not part of the distributable integration bundle.
panel.hass = {
  async callWS<T>(message: Record<string, unknown>): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (message.type === "blast_radius/entities")
      return { entities: data.entities } as T;
    const source = reports[`${message.entity_id}:${message.max_depth || 6}`];
    if (!source)
      throw new Error(
        "This demo includes only the synthetic entities in the list.",
      );
    const report = structuredClone(source) as Report;
    const editorPaths: Record<string, string> = {
      "automation.wall_button": "/config/automation/edit/wall_button_config",
      "automation.indicator": "/config/automation/edit/indicator_config",
      "script.music_toggle": "/config/script/edit/music_toggle_config",
      "scene.evening": "/config/scene/edit/evening_01",
      "dashboard.home": "/lovelace",
    };
    report.navigation = Object.fromEntries(
      report.graph.nodes
        .filter(
          (node) =>
            editorPaths[node.id] ||
            data.entities.some(
              (entity) => entity.entity_id === node.id && entity.exists,
            ),
        )
        .map((node): [string, NavigationTarget] => {
          const path = editorPaths[node.id];
          return [
            node.id,
            path
              ? {
                  kind: node.id.split(".")[0] as
                    "automation" | "script" | "scene" | "dashboard",
                  path,
                }
              : { kind: "entity", entity_id: node.id },
          ];
        }),
    );
    if (message.type === "blast_radius/preview") {
      if (message.operation === "rename") {
        const target = String(message.new_entity_id || "");
        if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(target))
          throw new Error("Enter a valid replacement entity ID");
        if (target.split(".")[0] !== report.entity_id.split(".")[0])
          throw new Error("A rename must stay in the same domain");
        if (data.entities.some((e) => e.entity_id === target))
          throw new Error("Replacement entity ID already exists");
      }
      const sourceTypes = new Map(
        report.references.map((ref) => [ref.source_id, ref.source_type]),
      );
      const counts: Record<string, number> = {};
      sourceTypes.forEach((type) => (counts[type] = (counts[type] || 0) + 1));
      report.preview = {
        operation: message.operation as "rename" | "delete",
        new_entity_id: message.new_entity_id
          ? String(message.new_entity_id)
          : null,
        changes_applied: false,
        affected_sources: counts,
        note: "Static demo preview. Conditional branches are not evaluated.",
      };
      report.markdown += `\nPreview: ${report.preview.operation}\nReplacement: ${report.preview.new_entity_id || "none"}\nNo changes have been made.\n`;
    }
    return report as T;
  },
};
document
  .querySelector("#theme")!
  .addEventListener("click", () => document.body.classList.toggle("dark"));
if (new URLSearchParams(location.search).get("theme") === "dark")
  document.body.classList.add("dark");
