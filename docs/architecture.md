# Architecture and API

`adapter.py` is the configuration access layer. `analysis/` accepts detached plain
dictionaries in frozen source records. `coordinator.py` serializes requests and
executes analysis outside HA's event loop. Reports omit raw configs and template bodies.

## Source access

Verified against **Home Assistant Core 2026.9.4** on 2026-10-04:

| Source | Access | Limitation |
| --- | --- | --- |
| Entities | State machine + entity registry | Registry-only entities count as known |
| Automations/scripts | `DATA_INSTANCES` → entities → `raw_config` | Loaded configs, including substituted blueprint bodies |
| Scenes/legacy groups | Exposed `entity_id` state attribute | Membership only |
| Lovelace | `LOVELACE_DATA.dashboards` → `async_load(False)` | Generated configs may be unavailable |

HA has no single stable public Python API for bulk reading every source. The
automation/script adapter reads the **same loaded objects** used by HA's native
`automation/config` and `script/config` WebSocket commands. These version-sensitive
interfaces are isolated and covered by integration tests. Lovelace loading delegates
to HA; this project never opens arbitrary `.storage` files.

Upstream references:

- [Automation config handler](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/components/automation/__init__.py)
- [Script config handler](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/components/script/__init__.py)
- [Entity components](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/helpers/entity_component.py)
- [Lovelace loader](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/components/lovelace/dashboard.py)
- [Custom panels](https://developers.home-assistant.io/docs/frontend/custom-ui/creating-custom-panels/)
- [WebSocket extensions](https://developers.home-assistant.io/docs/frontend/extending/websocket-api/)
- [HACS requirements](https://www.hacs.xyz/docs/publish/integration/)

## Blueprints, native metadata and selectors (v0.2.1)

Real HA tests load synthetic automation **and** script blueprints through normal
component setup and query the native `automation/config` / `script/config` commands.
In Core 2026.9.4, validation calls `BlueprintInputs.async_substitute()` before
assigning `raw_config`. It contains the blueprint body with substituted entity and
action-target inputs; `use_blueprint` is absent after success. The separate
`raw_blueprint_inputs` / entity `_blueprint_inputs` retain the instance's
`use_blueprint` input bag. `referenced_blueprint` is the blueprint path, not its body.
Blast Radius records only a boolean provenance flag and the aggregate
`coverage.loaded_blueprints` count. It does not export blueprint paths or input bags.

Unavailable HA entities may retain original inputs or a partially validated config.
If `use_blueprint` remains, the adapter explicitly warns that expansion is unavailable;
missing `raw_config`, unavailable entities and metadata failures also produce generic
coverage warnings. Exception text, validation errors and blueprint paths are never
copied into those warnings. No blueprint file parsing or substitution is performed
by Blast Radius; it reads HA's already loaded result.

`referenced_entities` and `referenced_devices/areas/floors/labels` are static sets
from HA's validated runtime configuration. They are **not complete runtime traces**:
HA skips template destinations and does not report a reference's location, role or
branch execution. The structural scanner stays authoritative for located references.
A native-only entity ID is added once with `confidence: unknown`, `role: read` and
path `metadata.referenced_entities`, requiring review without creating a guessed
write edge. Existing located references are not duplicated or upgraded. Regression
coverage includes HA's scene shorthand, which the generic structural scanner can
otherwise miss when the scene has no state/registry entry.

Literal selector fields retain their exact configuration location and, where it is
a bounded identifier, a `selector: {kind, value, exists}` record. `exists` checks
identity in HA's device/area/floor/label registry (`null` in a pure-engine snapshot
without registries). Native-only selectors supplement missing structural entries.
The entity target remains `null` and confidence remains dynamic because **the entity
set is unresolved**, even when the selector's own identity is known. Templates remain
unresolved; they are never rendered. Arbitrary non-ID selector text is not exported.

No device, area, floor or label selector is expanded. HA action/service eligibility,
entity capabilities, disabled entities, label placement, registry changes and runtime
selection prevent a selector's static membership from establishing definite entity
actions. Tests populate a real device/area/floor/label membership and prove it does
not leak into graph edges; a mixed explicit entity + selector keeps only the explicit
entity edge. Missing registry identity is reported without claiming breakage.

### Review classification and device entity IDs (v0.2.2)

References add `resolution`: `entity`, `device`, `selector`, or `unresolved`.
This describes what was identified, independently of the existing entity-reference
`confidence`. Literal device IDs in native triggers/conditions/actions and event
trigger filters are device identities, not unexpanded selections of every entity
on a device. Literal service selectors still have an unknown entity set. Templates
remain unresolved. A selector's `exists` continues to mean registry identity only.

For API compatibility, `uncertain_references`, `other_dashboard_references` and
`unresolved_total` retain every location whose **entity target** is null, including
known devices and selectors. Consumers should use `resolution` and `review_summary`
instead of interpreting that legacy total as dynamic expressions or broken entities.
`review_summary` contains `linked`, `other_dashboard` and `snapshot` summaries, each
with `locations`, `groups`, `device_locations`, `selector_locations`, and
`unresolved_locations`. The three location-category counts sum to `locations`.

Review grouping uses source ID/type, role, confidence, reason, resolution and
selector kind/value/registry status. Different devices, sources and roles remain
separate. All paths survive JSON, raw-reference inspection and grouped Markdown.
Grouping a shared reason does not establish identical expressions or targets.
Panel counts are recalculated after display filters; exports retain the full report.

The adapter detaches the entity registry's internal ID → current entity ID mapping
on the event loop. The pure scanner uses it only in typed native device automation
nodes in known trigger, condition and action paths (including choose/repeat/parallel).
This follows Core 2026.9.4's `entity_id_or_uuid` and device-automation validation
contract, checked against
[HA's validator](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/components/device_automation/helpers.py)
and [entity registry resolver](https://github.com/home-assistant/core/blob/2026.9.4/homeassistant/helpers/entity_registry.py).
The original configuration is untouched. Resolved IDs retain the exact source path
and role with `reason: "Entity registry ID resolved"`. Device conditions embedded
as sequence steps remain reads. Renames follow the current registry identity;
missing IDs remain unresolved. Arbitrary source values and raw templates are not
added to exports. Service payloads, variable dictionaries, templates and custom cards
are not treated as native device nodes merely because their field names look similar.

Input helpers, counters, timers and schedules work through normal explicit entity
references in loaded configurations. No bespoke helper-definition parsers were added.
Internal helper/template integration definitions remain outside guaranteed coverage.

## Presentation filters and graph navigation

Source and confidence chips affect only cards, displayed graph nodes/edges and the
raw-reference view (which also includes linked unresolved expressions). Full totals,
coverage, previews and JSON/Markdown reports retain the complete analysis. Needs
review combines `unknown` and `dynamic`. Graph filtering uses matching source edges,
not the target entity's domain; when an alternative matching edge supplies a node's
connection, `via`, path and confidence change together. The root remains visible;
paths can pass through hidden configurations. Filtering never reruns graph traversal.

Filters remain in panel memory, survive same-root refresh/depth/preview requests and
reset for a new root, remount or HA account change. They are intentionally not added
to session storage. The analysis tab and existing user-scoped Recent history remain.
`Analyze this` runs a fresh request using the node's ID and current depth, resets the
preview and reuses stale-request protection; `Open →` separately invokes native HA
navigation. Nodes whose IDs cannot be accepted by the entity-ID API (for example a
dashboard URL with a hyphen) retain Open but do not offer an invalid analysis action.
The issue shortcut links to the bug form without adding any report or entity data.

## WebSocket API

All commands require an authenticated **administrator**. Schema failures return
`invalid_format`; semantic preview errors return `invalid_input`; unloaded
integrations return `not_loaded`. Unexpected errors return `analysis_failed`
without leaking raw exceptions, secrets or local paths.

```json
{"id":1,"type":"blast_radius/entities"}
```

Returns `entities: [{entity_id, name, exists}]`, `warnings`, `snapshot_at`.
Referenced IDs absent from state/registry have `exists: false`.

```json
{"id":2,"type":"blast_radius/analyze","entity_id":"binary_sensor.wall_button","max_depth":6}
```

Returns `entity_id`, `exists`, `read_only`, `references`, `graph`,
`uncertain_references`, `other_dashboard_references`, `source_names`, `navigation`,
`unresolved_total`, `summary`, `coverage`, `warnings`,
`snapshot_at`, `markdown`.

Since v0.1.6, the HA adapter adds `navigation`, keyed by source/entity ID, after
analysis returns to the event loop. Values are `{kind, path}` for local views or
dashboard routes, or `{kind: "entity", entity_id}` for HA's native more-info dialog.
Since v0.1.7, loaded automations/scripts use `/config/{domain}/show/{entity_id}`.
HA loads this read-only view through its native `automation/config` or `script/config`
WebSocket command, matching the loaded objects inspected by the analyzer. This
works after entity renames and without an automation editor ID. It avoids `/edit`,
whose separate file request may return HTTP 500 even with a valid loaded config.
No file repair or configuration write is attempted.

Scene editor IDs still come from state attributes. Other sources use the details
dialog when a current state exists.
Missing entities have no destination. Dashboard links open the dashboard, not an
individual nested card. The pure engine does not depend on HA routing metadata.

The panel validates local route shapes, preserves modified link clicks, and uses
HA's `location-changed` / `hass-more-info` events. It does not call services or
save configuration when navigating. Routes/events were checked against frontend
20260826.7's [navigation helper](https://github.com/home-assistant/frontend/blob/20260826.7/src/common/navigate.ts)
and [more-info dialog](https://github.com/home-assistant/frontend/blob/20260826.7/src/dialogs/more-info/ha-more-info-dialog.ts).
The loaded-config routes were checked against its
[automation editor](https://github.com/home-assistant/frontend/blob/20260826.7/src/panels/config/automation/ha-automation-editor.ts),
[script editor](https://github.com/home-assistant/frontend/blob/20260826.7/src/panels/config/script/ha-script-editor.ts)
and [file-load handling](https://github.com/home-assistant/frontend/blob/20260826.7/src/panels/config/automation/ha-automation-script-editor-mixin.ts).

Graph nodes include `id`, `depth`, `relationship`, and a traversal predecessor
`via`, reference `path` and `confidence` where applicable. Edges retain the original
**source references target** direction; `via` need not be the edge source.
`cycles` lists detected back-edge paths (up to 50), not every possible simple cycle.
`truncated` identifies depth/size limits. Since v0.1.9, `limits_reached` lists the
specific bounds reached (`depth`, `nodes`, `edges`). Reaching a bound exactly is
not truncation unless an otherwise reachable link is omitted. The panel offers
deeper inspection only for a depth limit below 12 without a node/edge limit.
Forward expansion processes the shortest
discovered depth first, so a longer dependent path cannot hide a reachable target.
Closing an already known cycle does not by itself make the result incomplete.
When equal-depth references reach the same node with the same relationship, its
displayed path prefers explicit references, then template literals, then unclassified
candidates. `via`, `path` and `confidence` change together. This does not change
reachability, replace shorter paths or reclassify dependents as downstream targets;
the complete edge list retains alternative references.

Dashboards are terminal dependents: their direct entity and script references stay
visible, but forward impact traversal does not expand dashboard actions. Cards are
independent controls; sharing a dashboard does not establish an impact path.
Analyzing a script directly still follows its own actions.

```json
{"id":3,"type":"blast_radius/preview","entity_id":"light.office","operation":"rename","new_entity_id":"light.desk"}
```

```json
{"id":4,"type":"blast_radius/preview","entity_id":"light.office","operation":"delete"}
```

Preview adds `preview: {operation, new_entity_id, affected_sources,
changes_applied: false, note}`. Renames must be valid, same-domain, different,
and collision-free. Missing source IDs are allowed for stale-reference analysis.
Removal rejects a replacement ID.

## Template classification

The engine parses Jinja syntax without evaluating it. Literal IDs become read
dependencies, including IDs inside action-target templates; they are not guessed
write targets. Templated entity/action/target fields also produce an unresolved
entry because their final destination is unknown.

Constant-only text and styling are not automatically unresolved. A small allowlist
of value-only filters and tests is recognized. Syntax-only tracking recognizes
simple local assignments and loop variables; branch assignments do not escape
their block in this analysis. This does not compile or render templates or resolve
variable values into entity targets. External variables, unknown calls/filters/tests,
imports and broad state collections remain conservative unresolved candidates.
`reason` describes the missing information rather than returning raw template text.
Entity-like strings in variables
are reads, not downstream writes. Malformed or excessively nested templates retain
visible literal candidates and an unresolved warning instead of aborting the report.

Snapshot warnings describe overall coverage. `unresolved_total` counts uncertainty
throughout the snapshot. Since v0.1.5, `uncertain_references` includes affected
non-dashboard configurations and linked dashboard cards. The nearest standard
`cards[n]` boundary groups a dashboard reference; its parent/child card scopes are
included conservatively. Sibling cards do not inherit a link merely by sharing a
dashboard. Unknown custom card layouts and dashboard-level expressions remain in
`other_dashboard_references`, as do expressions in unlinked cards of affected
dashboards. The two arrays partition unresolved entries from affected sources;
neither establishes a dependency or runtime branch. Expressions in unaffected
sources still contribute to `unresolved_total` only.

Since v0.1.9, `coverage.warnings` retains specific snapshot and scanner gaps,
including skipped sources, failed blueprint expansion and scan bounds. It excludes
the routine explanation of unsupported source types; that explanation remains in
the report's top-level `warnings`. These gaps trigger a visible incomplete-results
notice even when the selected entity has zero references and its graph is not
truncated. The gaps apply to the snapshot, not necessarily to this entity.
Markdown exports place an incomplete-results notice before the references, with
full warnings below. JSON retains the graph limits and coverage warning list.

The panel presents both scopes in collapsed groups by source and reason; the main
summary focuses on known references. Both arrays are retained in JSON and Markdown
exports. `source_names` maps affected source IDs to display names; raw IDs and paths
are unchanged. Readable UI locations are one-based; raw paths remain zero-based.
The global total is in coverage details; a zero local count does not establish
complete coverage.

## Safety and privacy

- No service calls, registry writes, config saves or template rendering.
- Setup stores only the normal HA config entry and registers the panel.
- Since v0.1.8 the panel stores browser session metadata under
  `blast-radius:session:v1:<HA user ID>`: six recent entity IDs/depths and the last
  successful entity/depth/tab/scroll position. No report, source names, template
  bodies or configuration contents are retained. Origin and tab scope come from
  `sessionStorage`; changing HA accounts loads a separate key and clears the view.
  A page-memory fallback handles blocked/full storage. Clear removes the
  saved metadata. Missing user identity disables persistence.
- Returning/remounting fetches entities and a new analysis before restoring scroll;
  it never exports a cached report or repeats a rename/removal preview. Stale async
  responses are ignored after another request, account change or panel disconnect.
- Exports reveal entity IDs and configuration structure; review before sharing.
- Diagnostics expose version, timestamp, read-only flag and aggregate counts only.
- No third-party CDN, analytics, tokens or remote execution in the panel.
- The public static route serves packaged JS only; data commands require admin auth.
- Config strings over 64 KiB or nesting over 80 levels produce coverage warnings.
  The same string bound applies to HA Template objects. An invalid source is skipped
  with a warning rather than hiding otherwise available sources.

## Verification

Pure-engine tests cover references, arrays, nested branches, cycles, duplicate paths,
templates, bounds, missing IDs and previews. HA tests load real automations/scripts
and use the authenticated WebSocket transport. Browser tests use clearly labelled
synthetic data, checking previews, exports, errors, escaping and dark/mobile layout.

HACS default-directory acceptance is separate from the numbered releases in this
repository and still requires upstream branding/default-list requirements.
This repository does not submit itself.
