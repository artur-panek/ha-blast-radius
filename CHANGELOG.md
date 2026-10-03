# Changelog

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
