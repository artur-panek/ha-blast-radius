# v0.1.0 validation

Validated locally on 2026-10-03 against Home Assistant 2026.9.4 / Python 3.14.7.

| Check | Result |
| --- | --- |
| Python suite | 40 tests passed |
| Pure analysis coverage | 97% |
| HA installation | Config-entry manager setup and unload passed |
| HA transport | Authenticated WebSocket commands and non-admin rejection passed |
| Preview safety | Configuration unchanged; service calls forbidden during test |
| Ruff lint/format | Passed |
| Engine mypy | Passed |
| Frontend TypeScript/build | Passed; about 12.6 KiB gzipped |
| Chromium browser suite | 5 tests passed |
| Visual review | Light, dark and mobile screenshots inspected |
| Official hassfest | 1 integration; 0 invalid integrations |
| Package layout/read-only API audit | Passed |

The panel screenshots and browser harness use synthetic data. No access to a
real household installation was used or required.

## GitHub Actions

The first [published build](https://github.com/artur-panek/ha-blast-radius/actions/runs/37157836225)
ran on 2026-10-03 at commit `3684c907efa7916f5218e566016906e4fa7a2b36`.

| Job | Result |
| --- | --- |
| Python | Passed: 40 tests, 97.13% engine coverage, Ruff, mypy and package audit |
| Frontend | Passed: formatting, TypeScript/build, committed bundle consistency and 5 browser tests |
| Official hassfest | Passed |
| HACS | Failed: repository description and topics are not set |

HACS passed its license, information, issues, archived, integration manifest and
`hacs.json` checks. Its remaining failures concern the GitHub repository's About
metadata. Add a description and topics, then rerun the HACS job.

The HACS action intentionally excludes the upstream `brands` check for the custom
repository alpha. Remove that exclusion before a future default-list submission.

## Reproduce

Follow the README setup, then run:

```bash
pytest -q --cov --timeout=60
ruff check .
ruff format --check .
mypy
python scripts/check_package.py
cd frontend
npm run build
npm test
git diff --exit-code -- ../custom_components/blast_radius/frontend/blast-radius.js
```

The official hassfest run used the `script.hassfest` module from HA Core tag
`2026.9.4`, with `--integration-path` pointing to this custom component.
