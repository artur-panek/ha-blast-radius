# Changelog

## 0.2.5 — 2026-10-05

- Redesign the panel around relationship direction so users can distinguish
  configurations that act on an entity, read or react to it, and only display
  or contain it.
- Add a compact Overview that answers what uses the selected entity and what
  else the same related flows can affect without implying runtime causality.
- Add dedicated Uses this entity and Related effects views, group co-effects by
  their originating configuration, and keep chained effects collapsed separately.
- Rename the graph lanes and connection labels to make incoming use versus
  same-flow effects explicit; keep the raw reference table under Technical.
- Move ordinary static-coverage caveats out of the main result flow, retain real
  traversal-limit warnings, improve mobile tab discoverability, and refresh the
  synthetic screenshots and browser regressions.

## 0.2.4 — 2026-10-05

- Redesign the panel around a factual direct-impact summary instead of an
  arbitrary High/Moderate/Low score, with direct references and related graph
  nodes visible at a glance.
- Distinguish real traversal truncation from partial static-analysis coverage so
  ordinary coverage limitations no longer present the whole result as incomplete.
- Keep unresolved expressions related to the selected entity in the Impact view,
  while moving device/selector context and system-wide dashboard diagnostics into
  Coverage & diagnostics.
- Tighten source cards, reduce default filter noise, move traversal depth into
  Analysis options and improve responsive behavior inside the Home Assistant shell.
- Refresh the distributed frontend and regression coverage for the revised
  impact-first workflow.

## 0.2.3 — 2026-10-05

- Keep state, numeric-state and compound conditions used as standalone script
  steps as read dependencies. They must not appear as downstream action targets.
- Preserve the v0.2.2 grouped review and device-registry improvements; add explicit
  regressions for sequence conditions and retain source paths for incoming review.

## 0.2.2 — 2026-10-05

- Separate literal device references from unexpanded entity-set selectors and
  dynamic/unrecognized targets in the panel, JSON and Markdown reports.
- Group repeated review locations by source, role, reason, selector identity and
  registry status. Retain every original path; show group and location counts
  without presenting snapshot-wide uncertainty as impact on one selected entity.
- Resolve internal entity registry IDs in native device actions, triggers and
  conditions, including nested branches and current IDs after entity renames.
  Keep missing IDs unresolved and exclude templates, service payloads, variables
  and custom cards from this lookup. Never expand device membership into targets.
- Add regression coverage for a 16-trigger keypad, repeated actions, all selector
  types, missing/unchecked registries, conditional reads, unrelated dashboards,
  filters, complete exports and mobile layouts. Rebuild the distributed panel.

## 0.2.1 — 2026-10-04

- Verify loaded automation/script blueprint expansion against real HA interfaces;
  inspect substituted entity/action targets and retain honest, redacted failure warnings.
- Supplement missing structural references with reviewable HA-native metadata,
  without duplicate references or inferred runtime actions. Verify common helper IDs.
- Show device/area/floor/label selector identity from HA registries. Keep entity
  membership unresolved and preserve explicit targets in mixed target selections.
- Add compact source/confidence filters for impact, graph and raw-reference views;
  keep full totals, coverage and exports unchanged.
- Add graph **Analyze this** actions, separate from native **Open →**, with fresh
  snapshots, preview reset, Recent history and stale-response protection.
- Add visible advisory HA-next CI for Core 2026.10.0b0, alongside the required
  2026.9.4 stable lane, and document promotion of future stable baselines.
- Add a privacy-preserving bug-report shortcut and updated synthetic screenshots.

## 0.2.0 — 2026-10-04

- Mark the first public-testing release and add one-click HACS installation through
  the official My Home Assistant repository link.
- Hide the development branch from HACS downloads so testers stay on numbered,
  CI-validated releases.
- Validate local integration branding in HACS without suppressing the brands check.
- Declare the integration as a calculated, single-config-entry integration in the
  Home Assistant manifest while retaining the existing read-only setup flow.
- Tighten release documentation and remove stale version-specific installation text.

## 0.1.9 — 2026-10-04

- Show incomplete results above the counts when traversal hits a depth/size limit
  or a snapshot cannot fully inspect a source. This also applies to empty reports.
- Distinguish depth, node and edge limits. Offer deeper inspection only when a
  larger depth can help; provide a direct control to open and focus coverage details.
- Keep skipped-source, blueprint and scanner warnings separate from the general
  static-analysis note. Preserve all warnings in exports and put an incomplete
  notice near the top of Markdown reports.
- Test graph size boundaries, coverage gaps through the HA adapter, deeper analysis,
  empty reports, mobile layout, export and compatibility with older report fields.
- Add README quick links, correct stale UI labels and roadmap items, and improve
  the bug form for first-time testers.

## 0.1.8 — 2026-10-04

- Restore the last successful entity search, traversal depth, analysis tab and
  scroll position when returning from a linked source or reloading the panel.
  Fetch a fresh analysis instead of persisting an old report.
- Add a compact recent-search bar with six deduplicated searches, one-click
  reopening at their saved depth and a Clear control.
- Scope browser session metadata to the HA user and tab; retain no reports or
  configuration contents. Handle unavailable storage and malformed saved values.
- Test real browser Back with panel recreation, reconnect/reload, fresh requests,
  recent-history limits, account isolation, invalid storage and mobile overflow.

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
