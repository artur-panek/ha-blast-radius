# Validation

## v0.1.2

Local validation: 42 Python tests and 5 Chromium browser tests passed. The HA
lifecycle test covers registering, removing and restoring the sidebar icon module.
Ruff, mypy, TypeScript/build and the package audit passed.

The radius mark was visually inspected at 24 px and 40 px, on light and dark
backgrounds, and in the panel's mobile header. Updated panel screenshots remain
synthetic. Standard and high-resolution integration icons are packaged locally.

## v0.1.1

The dashboard traversal regression was reproduced with synthetic light and
computer-control cards. Before the fix, analyzing the light included an unrelated
computer script and its button target. After the fix, the light retains its
automation and both dashboard references, with no unrelated downstream targets.
Selecting the computer script still reports its dashboard reference and button target.

Local validation: 42 Python tests passed, 97.15% engine coverage, Ruff, mypy and the
package audit passed. Regenerating demo data produced no changes.
All four jobs passed in the [patch CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37159173784).

## v0.1.0

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

### GitHub Actions

The first [published build](https://github.com/artur-panek/ha-blast-radius/actions/runs/37157836225)
ran on 2026-10-03 at commit `3684c907efa7916f5218e566016906e4fa7a2b36`.

| Job | Result |
| --- | --- |
| Python | Passed: 40 tests, 97.13% engine coverage, Ruff, mypy and package audit |
| Frontend | Passed: formatting, TypeScript/build, committed bundle consistency and 5 browser tests |
| Official hassfest | Passed |
| HACS | Passed: all 8 checks after adding the repository description and topics |

HACS initially failed because the GitHub repository's About metadata was empty.
After adding a description and topics, [attempt 2](https://github.com/artur-panek/ha-blast-radius/actions/runs/37157836225/attempts/2)
passed all eight HACS checks. All four jobs are now green.

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
