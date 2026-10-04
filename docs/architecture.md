# Architecture and API

`adapter.py` is the configuration access layer. `analysis/` accepts detached plain
dictionaries in frozen source records. `coordinator.py` serializes requests and
executes analysis outside HA's event loop. Reports omit raw configs and template bodies.

## Source access

Verified against **Home Assistant Core 2026.9.4** on 2026-10-03:

| Source | Access | Limitation |
| --- | --- | --- |
| Entities | State machine + entity registry | Registry-only entities count as known |
| Automations/scripts | `DATA_INSTANCES` → entities → `raw_config` | Loaded configs; blueprint inputs only |
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
analysis returns to the event loop. Values are `{kind, path}` for local editor or
dashboard routes, or `{kind: "entity", entity_id}` for HA's native more-info dialog.
Automation/scene IDs come from state attributes; script configuration IDs come from
the entity registry, so an entity rename does not change the editor destination.
Sources without an editor ID use the details dialog when a current state exists.
Missing entities have no destination. Dashboard links open the dashboard, not an
individual nested card. The pure engine does not depend on HA routing metadata.

The panel validates local route shapes, preserves modified link clicks, and uses
HA's `location-changed` / `hass-more-info` events. It does not call services or
save configuration when navigating. Routes/events were checked against frontend
20260826.7's [navigation helper](https://github.com/home-assistant/frontend/blob/20260826.7/src/common/navigate.ts)
and [more-info dialog](https://github.com/home-assistant/frontend/blob/20260826.7/src/dialogs/more-info/ha-more-info-dialog.ts).

Graph nodes include `id`, `depth`, `relationship`, and a traversal predecessor
`via`, reference `path` and `confidence` where applicable. Edges retain the original
**source references target** direction; `via` need not be the edge source.
`cycles` lists detected back-edge paths (up to 50), not every possible simple cycle.
`truncated` identifies depth/size limits. Forward expansion processes the shortest
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

The panel presents both scopes in collapsed groups by source and reason; the main
summary focuses on known references. Both arrays are retained in JSON and Markdown
exports. `source_names` maps affected source IDs to display names; raw IDs and paths
are unchanged. Readable UI locations are one-based; raw paths remain zero-based.
The global total is in coverage details; a zero local count does not establish
complete coverage.

## Safety and privacy

- No service calls, registry writes, config saves or template rendering.
- Setup stores only the normal HA config entry and registers the panel.
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

HACS default-directory acceptance still requires upstream branding/default-list
requirements and a public release. This repository does not submit itself.
