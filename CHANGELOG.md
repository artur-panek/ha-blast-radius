# Changelog

## 0.1.3 — 2026-10-04

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
