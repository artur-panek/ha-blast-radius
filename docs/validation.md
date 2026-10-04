# Validation

## v0.1.4

Local validation on 2026-10-04: 90 Python tests passed, with 97.65% engine coverage;
11 Chromium browser tests passed. Ruff, mypy, TypeScript and the production build
passed. The integration remains tested against Home Assistant Core 2026.9.4.

New graph tests cover confidence ordering in either input order, consistent path
and predecessor updates, preserved shortest paths and dependent/selected node roles.
All alternative references remain available in the edge list.

Browser tests measure confidence-label text contrast at **at least 4.5:1** on light,
dark and custom dark surfaces with deliberately low-contrast semantic accent colors.
This checks the tested labels and themes, not accessibility certification of the
whole panel or arbitrary themes. Other tests distinguish 0 or 1 unresolved references
in affected sources from a synthetic global total of 170. The global total remains
visible in expanded coverage details.

## v0.1.3

Release-preparation validation on 2026-10-04 against Home Assistant 2026.9.4 /
Python 3.14.7. New regression cases reproduced incorrect shortest-path expansion,
cycle truncation, template classification, unexpected exception disclosure and
stale export behavior before the fixes.

| Check | Result |
| --- | --- |
| Python suite | 59 tests passed, including real HA setup/unload and WebSocket tests |
| Pure analysis coverage | 96.26% |
| Ruff lint/format and engine mypy | Passed |
| Frontend formatting, TypeScript and production build | Passed |
| Chromium browser suite | 6 tests passed |
| Visual review | Synthetic light, dark and mobile layouts; original radius branding |
| Generated brand consistency | Regeneration matches committed runtime assets |
| Package and version consistency | Passed, including local PNG dimensions |
| Manual-install ZIP | 24 files; two builds byte-for-byte identical |
| Installed Python dependency consistency | `pip check` passed |
| Frontend production dependency scan | `npm audit --omit=dev`: 0 reported vulnerabilities |

Dependency scan results are a point-in-time check, not a security certification.
Browser tests use synthetic reports and do not establish compatibility with every
HA theme, browser or custom card. The alpha remains tested only against Core 2026.9.4.

The Quality workflow now checks Python 3.12 engine compatibility as well as the
full Python 3.14 HA suite, generated assets, browser behavior, hassfest and HACS.
All five jobs passed in the [v0.1.3 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37162015799)
for runtime commit `5bb27b134a9cff811b8c4326f86fdb217d16b941`:

- Python 3.12: 48 engine tests passed; the HA module was intentionally skipped.
- Python 3.14: 59 tests passed, including the HA integration suite.
- Frontend: formatting, build, generated bundle/brand checks and 6 browser tests passed.
- Official hassfest and HACS: passed. The upstream brands check remains excluded
  for the custom-repository alpha, as documented below.

The local installation ZIP and CI package have the same SHA-256:
`1f2e80fae2f203514ad3977d8c8fdde7dfad5c64dbf0ee2b4640132c78f23fa0`.
No GitHub release or tag was created as part of this validation.

### First numbered HACS release

Later on 2026-10-04, release automation was added without changing the integration's
runtime code. All six jobs passed in the [publication CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37163333604)
at `0eb10f4d2d1ed3e275929a6d9343a4ea8a032339`: both Python versions, frontend,
hassfest, HACS and publication. The suite now includes 22 release-automation tests:
81 tests pass on Python 3.14; 70 pass on Python 3.12 with the HA module skipped.
The 6 browser tests and engine coverage are unchanged.

The workflow published [v0.1.3](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.3)
in the standard HACS release channel, with an explicit experimental-alpha label.
The tag points to the tested commit. The ZIP and checksum file are attached; its
SHA-256 matches the local package:
`418b0534c7e90914db30f1e3afe9e237d036400b2705b0eac4b8f21c51186dfb`.
This differs from the preparation ZIP above because the bundled installation
instructions now explain numbered updates. No private household screenshots were
published. HACS discovery and installation on the user's server are not remotely
verified; branch installs need the documented one-time switch to the numbered release.

## v0.1.2

Local validation: 42 Python tests and 5 Chromium browser tests passed. The HA
lifecycle test covers registering, removing and restoring the sidebar icon module.
Ruff, mypy, TypeScript/build and the package audit passed.
All four jobs passed in the [v0.1.2 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37159867613):
Python, frontend, official hassfest and HACS.

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
