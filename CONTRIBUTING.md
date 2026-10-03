# Contributing

Use the README development commands, a small branch and a focused pull request.
Keep `analysis/` independent of HA imports and UI concerns.

For new source/syntax coverage, add a synthetic fixture and a regression test,
explain confidence and unresolved cases, verify the pinned HA API, and update
limitations. Never guess dynamic targets.

Run pytest, Ruff, mypy, frontend build and browser tests. Commit the compiled panel
with its source. Do not commit real configuration, tokens, `.storage`, installation
paths or screenshots of a real household.

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

The v0.1 boundary is read-only. Rewrites, runtime recorders and external automation
parsers require a separate scope discussion. Never render templates to improve
coverage or infer a runtime action from a visible template literal.

Bug reports should include HA/integration versions, installation method, expected
versus actual behavior and the smallest synthetic example. Redact report exports:
entity names and reference paths can still identify people, rooms and routines.
For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of a public bug report.
For versioning and packaging, follow the [release checklist](docs/releasing.md).
