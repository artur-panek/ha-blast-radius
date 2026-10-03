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
`uncertain_references`, `unresolved_total`, `summary`, `coverage`, `warnings`,
`snapshot_at`, `markdown`.

Graph nodes include `id`, `depth`, `relationship`, and a traversal predecessor
`via`, reference `path` and `confidence` where applicable. Edges retain the original
**source references target** direction; `via` need not be the edge source.
`cycles` lists detected back-edge paths (up to 50), not every possible simple cycle.
`truncated` identifies depth/size limits.

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

## Safety and privacy

- No service calls, registry writes, config saves or template rendering.
- Setup stores only the normal HA config entry and registers the panel.
- Exports reveal entity IDs and configuration structure; review before sharing.
- Diagnostics expose version, timestamp, read-only flag and aggregate counts only.
- No third-party CDN, analytics, tokens or remote execution in the panel.
- The public static route serves packaged JS only; data commands require admin auth.
- Config strings over 64 KiB or nesting over 80 levels produce coverage warnings.

## Verification

Pure-engine tests cover references, arrays, nested branches, cycles, duplicate paths,
templates, bounds, missing IDs and previews. HA tests load real automations/scripts
and use the authenticated WebSocket transport. Browser tests use clearly labelled
synthetic data, checking previews, exports, errors, escaping and dark/mobile layout.

HACS default-directory acceptance still requires upstream branding/default-list
requirements and a public release. This repository does not submit itself.
