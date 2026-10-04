# Changelog

## 0.1.7 — 2026-10-04

- Open automations/scripts through HA's native read-only `/show` route using
  current entity IDs. This inspects the configuration already loaded in HA and
  avoids the file-based editor request that can return HTTP 500.
- Support loaded YAML automations without an editor ID and renamed entities.
  Scene editors, dashboard links and ordinary entity details keep their behavior.
- Reproduce native editor HTTP 500 responses in HA tests and verify that its
  loaded-config WebSocket API remains available. Tighten allowed view routes and
  update navigation regression checks and documentation.
- This corrects Blast Radius navigation; it does not repair malformed or
  inaccessible configuration files behind errors in HA's own editor.

## 0.1.6 — 2026-10-04

- Open automations, scripts and scenes directly in their native HA editors using
  configuration IDs, including renamed entities. Open dashboards at their URL and
  ordinary entities in HA's details dialog. Navigation never runs an action.
- Replace technical reference walls with compact source cards, recognizable type
  icons, clear use descriptions and expandable paths/confidence details.
- Split the dependency map into used-by configurations and possible targets, with
  clickable predecessor names. Move change previews into a collapsible section.
- Use HA's current body-font token with system-font fallbacks. Refine desktop and
  mobile layouts, and refresh the synthetic screenshots.
- Add HA identifier/rename tests and browser checks for routing, entity dialogs,
  missing destinations, unsafe links and font inheritance.

## 0.1.5 — 2026-10-04

- Separate unresolved expressions in linked dashboard cards from those elsewhere
  in the same dashboard. Retain both scopes in the panel and exports; do not treat
  the whole dashboard as a dependency of one entity.
- Recognize simple template-local variables and value loops without executing
  templates. Keep runtime lookups, state collections, imports and unsupported
  filters/tests unresolved, with specific reasons.
- Improve panel readability with friendly names, larger text, stronger secondary
  text contrast, readable locations and collapsible exact configuration paths.
- Group uncertainty by source and reason instead of showing a long warning list.
  Keep the full-snapshot total in coverage details and focus summary cards on known
  references. Add keyboard navigation for analysis tabs.
- Add regression tests for template classification, dashboard scope separation,
  large uncertainty groups and keyboard interaction. Refresh synthetic screenshots.

## 0.1.4 — 2026-10-04

- Prefer stronger reference evidence for graph paths at the same depth and with
  the same relationship. Preserve alternative edges, shortest paths and graph scope.
- Improve confidence-label readability with theme text colors, subtle tinted
  backgrounds and semantic-color markers, including custom dark themes.
- Show unresolved references in affected source configurations in the main summary;
  keep the full-snapshot total in coverage details and exports.
- Add graph regression tests, measured label-contrast checks and local/global
  counter tests. Refresh the synthetic demo screenshots and documentation.

## 0.1.3 — 2026-10-04

- Publish numbered GitHub releases automatically after all Quality checks pass,
  with verified installation assets and a standard HACS update channel.
- Document the one-time switch from `main` to numbered releases in HACS.
- Expand forward dependencies by shortest path; avoid missing reachable action
  targets and false incompleteness when closing an already explored cycle.
- Distinguish constant/value templates from unresolved targets. Keep templated
  action destinations unresolved and variable references out of downstream writes.
- Handle excessively nested templates and oversized membership safely; apply the
  string limit to HA Template objects as well as plain strings.
- Return generic unexpected API errors without exposing exception details.
- Clear old reports before new requests so failed refreshes cannot export stale results.
- Include scanner warnings consistently in entity responses and diagnostic counts.
- Add regression tests, Python 3.12 engine CI, generated-brand consistency checks
  and a reproducible, runtime-only installation ZIP builder.
- Refine product wording and document installation, rollback, privacy, contribution
  and release preparation. This remains an experimental, read-only alpha.

## 0.1.2 — 2026-10-04

- Add an original vector radius mark to the panel, sidebar and integration tile.
- Include local light/dark brand images at standard and high resolution.
- Keep header branding compact on mobile and match the active HA accent color.
- Ship the dashboard impact fix from 0.1.1.

## 0.1.1 — 2026-10-04

- Stop impact traversal at dashboards so unrelated card actions and their script
  targets are not reported as downstream effects of another card's entity.
- Preserve direct dashboard references, removal previews and script action traversal.
- Add regression coverage for independent light and computer-control cards.

## 0.1.0 — 2026-10-03

Initial experimental alpha:

- Pure analyzer, exact paths, confidence classification, bounded graph and cycles.
- HA adapter for loaded automations/scripts, scene/group membership and dashboards.
- Admin-only API, singleton config flow and aggregate diagnostics.
- Sidebar panel, dark/mobile layouts, previews and Markdown/JSON export.
- Synthetic fixtures, HA transport tests, browser tests and HACS/CI packaging.
