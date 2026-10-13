# Contributing

Use the README development commands, a small branch and a focused pull request.
Keep `analysis/` independent of HA imports and UI concerns.

For new source/syntax coverage, add a synthetic fixture and a regression test,
explain confidence and unresolved cases, verify the pinned HA API, and update
limitations. Never guess dynamic targets.

Run pytest, Ruff, mypy, frontend build and browser tests. Commit the compiled panel
with its source. Do not commit real configuration, tokens, `.storage`, installation
paths or screenshots of a real household.

## Commits and pull requests

Keep commits focused on one change. Use a short subject that says what changed,
not how much work went into it. A `fix:`, `test:`, `docs:` or `ui:` prefix is
fine when it helps, but isn't required.

For example:

```text
fix: report skipped dashboard scans
test: cover unresolved entity references
ui: separate state reads from action targets
docs: explain scan coverage limits
```

Avoid generic subjects such as `final polish`, `improve UX` or `complete
redesign`. Don't split a single fix into several cosmetic commits just to
make the history look busy. Generated frontend assets belong in the same
commit as their source changes.

In a pull request, explain the failure or confusing behavior, the change,
how it was checked and any known limitations. Keep release notes about
user-visible behavior; implementation details belong in the PR.

## Before opening a pull request

Use Python 3.14.2+ for the full HA suite (pinned to Core 2026.9.4), or Python 3.12+
for the pure engine. Install dependencies as described in the README, then run:

```bash
ruff check .
ruff format --check .
mypy
pytest -q --cov --timeout=60
python scripts/check_package.py
python scripts/generate_demo.py
cd frontend
npm ci
npx prettier --check 'src/*.ts' '*.ts' '*.json' 'test/*.ts' index.html
npm run build
npx playwright install chromium
npm test
```

Explain what failed before the change, add a regression test, and describe any
coverage or compatibility tradeoff. CI runs the engine on Python 3.12, the full
suite on Python 3.14, browser tests, official hassfest and HACS validation.
Passing these checks does not establish compatibility with untested HA versions.

## Generated assets

- Engine changes: regenerate `frontend/src/demo-data.json` and check the results.
- Panel changes: rebuild and commit the compiled runtime JS with its TypeScript.
- Brand changes: edit `frontend/src/brand.json`, run
  `node scripts/generate_brand.mjs` from the repository root, then rebuild the panel.
  See [brand assets](docs/brand/README.md); do not hand-edit generated icons.
- Browser tests update synthetic light, dark and mobile screenshots in `docs/`.
  Inspect them for overflow, clipping and readable contrast.

## Scope and reporting

The v0.2 boundary is read-only. Rewrites, runtime recorders and external automation
parsers require a separate scope discussion. Never render templates to improve
coverage or infer a runtime action from a visible template literal.

Bug reports should include HA/integration versions, installation method, expected
versus actual behavior and the smallest synthetic example. Redact report exports:
entity names and reference paths can still identify people, rooms and routines.
For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of a public bug report.
For versioning and packaging, follow the [release checklist](docs/releasing.md).

Run the advisory next-version suite in its own environment; see
[HA compatibility maintenance](docs/releasing.md#maintaining-ha-compatibility).
