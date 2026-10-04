# Validation

## v0.2.1

Local pre-release validation on 2026-10-04:

| Check | Result |
| --- | --- |
| Python 3.12 engine/release suite | 112 passed; 2 HA modules intentionally skipped |
| Stable HA Core 2026.9.4 / Python 3.14.7 | 143 passed; 98.30% engine coverage |
| HA-next Core 2026.10.0b0 / Python 3.14.7 | 143 passed; 98.30% engine coverage |
| HA-next test environment | pytest-homeassistant-custom-component 0.13.368, frontend 20260930.0; dependency check passed |
| Chromium browser suite | 46 passed |
| Ruff lint/format, engine mypy, TypeScript/build | Passed |
| Version/package/mutation-call checks | Passed |

The next version was selected from the official HA release list on 2026-10-04;
2026.10.0b0 was the latest published 2026.10 prerelease. Stable support remains
2026.9.4; a passing beta run is early compatibility evidence, not a support promise.

Real-HA regressions verify substituted automation/script blueprint `raw_config`
through the native config WebSocket commands, separate input bags and blueprint
provenance, failure warnings and privacy. Device/area/floor/label registries are
populated and checked without adding their members to entity graphs. Native metadata
supplements unlocated references conservatively, deduplicates known targets and
fails with a redacted warning. Eight common helper domains use ordinary entity
references, with no helper-definition parsing.

Browser regressions cover all source types, confidence/review filters, empty results,
keyboard activation, new-root and session resets, full unfiltered exports, matching
graph paths, Analyze this from dependents and targets, preview reset, Recent history,
stale responses, selector text, mobile overflow and separate native Open navigation.
Existing Back/account isolation tests pass. Active filter text is checked at 4.5:1
contrast in the existing light/dark/custom-dark checks. Updated synthetic screenshots
were visually inspected. The added GitHub social preview is 1280×640 PNG under 1 MB.
No household data is used in tests, screenshots or branding.

[PR #12](https://github.com/artur-panek/ha-blast-radius/pull/12) passed the complete
Quality and HA-next workflows before squash merge. The merged commit
`0f7d72e2b1cca28cc482adbe62b42058f154e054` then passed all six jobs in the
[main Quality run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37179707650):
Python 3.12 (112 passed, 2 intentionally skipped, 97.90% engine coverage), stable
HA 2026.9.4 / Python 3.14 (143 passed, 98.30%), frontend (46 Chromium tests),
hassfest (0 invalid integrations), HACS (**all 9 checks, no ignored validations**)
and automatic publication. Formatting, type checks, generated frontend/brand
consistency and packaging also passed in that run. The separate
[main HA-next run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37179707651)
passed against **HA 2026.10.0b0**, with 143 tests and 98.30% engine coverage.

The published [v0.2.1](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.2.1)
is GitHub's latest normal release (`draft: false`, `prerelease: false`). The tag points
to the tested merge commit above. Both the installation ZIP and `SHA256SUMS` were
downloaded from the release; the ZIP contains 24 files, passes ZIP integrity checks
and is byte-for-byte identical to the local package. Its SHA-256 is:
`a0eab804648f1a652fa546a6c488b929ac65b3a7337f10522d2d0143c827328e`.
That digest also matches the checksum file and GitHub's asset digest.

HACS release discovery was checked with the upstream repository implementation at
[`adb7d83e33d24325535fb43b8226572405143757`](https://github.com/hacs/integration/blob/adb7d83e33d24325535fb43b8226572405143757/custom_components/hacs/repositories/base.py).
Its real `get_releases(prerelease=False)` method called the live public GitHub API
and returned `v0.2.1` first. Applying that normal-channel result as `last_version`,
as `common_update_data` does, made `version_to_download()` select `v0.2.1`.
The tagged integration manifest is version `0.2.1`; the tagged `hacs.json`, parsed
by HACS's `HacsManifest`, retains `hide_default_branch: true`, and `main` is absent
from the release list. This verifies discovery/selection and the branch-hiding
setting, not installation or refresh behavior on the user's running HA server.
The post-release repository check found no open issues or unintended pull requests;
only the existing Dependabot PRs #7, #8 and #9 remain open.

## v0.2.0

Public-alpha release preparation changed packaging, HACS onboarding and manifest
metadata only; the analysis engine is unchanged from v0.1.9. The main Quality run
[37175008251](https://github.com/artur-panek/ha-blast-radius/actions/runs/37175008251)
passed Python 3.12, Python 3.14, frontend, hassfest, HACS and publication at
`6d37ab7ed8f2bed1947c7d669d5b3a99763501e8`. The Python 3.14 suite ran **122 tests**
with **98.17%** engine coverage; the frontend ran **30 Chromium tests**.

HACS validation passed **all 9 checks with no ignores**, including local brand
validation. Hassfest passed with the manifest declared as a calculated,
single-config-entry integration. The committed frontend bundle and generated brand
assets matched their sources, and the reproducible package contained 24 files.

The published [v0.2.0](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.2.0)
release points to that tested commit. Its installation ZIP has SHA-256
`819a825c6920719f8b62aeec977ea53f4cba67e0bd51cece9ee3840351ed234e` and is accompanied
by `SHA256SUMS`. HACS default-directory submission is separate from this release.
Installation on unrelated real-world Home Assistant configurations remains the goal
of the public alpha rather than a claim of broad compatibility.

## v0.1.9

Local validation on 2026-10-04: **122 Python tests passed**, with **98.69%** engine
coverage; **30 Chromium tests passed**. Ruff lint/format, engine mypy, frontend
formatting, TypeScript, production build and package checks passed against
Home Assistant Core 2026.9.4 / Python 3.14.7.

New engine cases check the exact 500-node/2,000-edge boundaries and one link beyond
each, scanner truncation with zero selected-entity references, and the distinction
between specific coverage gaps and the routine static-analysis note. A real HA
adapter test verifies that an unavailable dashboard produces structured coverage
warnings and an incomplete Markdown report without disclosing its exception.

Six new browser tests cover visible depth warnings, deeper fresh analysis, hard
size/max-depth limits, empty reports with coverage gaps, keyboard focus when opening
coverage, JSON export, mobile overflow and older reports without structured limits.
Existing navigation, Back, session isolation, previews and contrast checks pass.
Light/dark/mobile layouts and the new incomplete-results notice were visually
reviewed with synthetic data. The user's HA installation has not been tested remotely.

The 24-file local installation ZIP has SHA-256:
`e18e069edbcec4ee2ae276375e36d25f027921776ac45b6205fe67eb9436e91d`.

All six jobs passed in the [v0.1.9 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37173053823)
at `d6ffa29df16481b9f597f0138117be7688e6c5e9`: Python 3.12 (106 tests, HA module
skipped), Python 3.14 (122 tests, 98.17% engine coverage), frontend (30 browser
tests), hassfest, HACS and automatic publication. The published
[v0.1.9](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.9) tag points
to that tested commit, and its ZIP matches the local checksum. HACS discovery and
installation on the user's server remain unverified remotely.

## v0.1.8

Local validation on 2026-10-04: **116 Python tests passed**, with **97.07%** engine
coverage; **24 Chromium tests passed**. Ruff lint/format, engine mypy, frontend
formatting, TypeScript, production build and package checks passed against
Home Assistant Core 2026.9.4 / Python 3.14.7.

New browser tests click a native source link, remove the panel, use actual browser
Back and recreate the element. They verify entity, depth, tab and scroll restoration,
plus a fresh entities request and analysis. Reload and reconnect are also covered.
Recent searches are checked for six-item limits, deduplication, saved depths,
keyboard focus after reordering, Clear, per-user separation and mobile overflow.
Malformed storage and blocked storage are exercised; serialized metadata is checked
to exclude reports and configuration. Failed searches do not enter the recent list
or leave stale reports available to export.

Light and mobile layouts were visually reviewed using synthetic data. Browser
tests simulate HA panel removal/recreation; this release has not been installed or
tested directly on the user's server. No household screenshots are published.

The 24-file local installation ZIP has SHA-256:
`bfb824523adfc4052df7f7c70b35b2e6c719070a309633c949ecdd629a33baad`.

All six jobs passed in the [v0.1.8 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37171730640)
at `f8eab7f4a8f9417def7357c8b8143c9270d71b00`: Python 3.12, Python 3.14 (116 tests,
97.07% engine coverage), frontend (24 browser tests), hassfest, HACS and automatic
publication. The published [v0.1.8](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.8)
tag points to that commit, and its ZIP matches the local checksum. HACS discovery,
installation and Back behavior on the user's server remain unverified remotely.

## v0.1.7

Local validation on 2026-10-04: **116 Python tests passed**, with **97.07%** engine
coverage; **17 Chromium tests passed**. Ruff lint/format, engine mypy, frontend
formatting, TypeScript, the production build and package checks passed. Tested
against Home Assistant Core 2026.9.4 / Python 3.14.7.

Two real-HA transport regressions reproduce HTTP 500 from the native automation
and script file editor by supplying an invalid file structure. Both verify that
the native loaded-config WebSocket commands still return the running configuration
and that navigation uses `/show/{entity_id}`. A further test covers an automation
without an editor ID. Existing rename, scene, dashboard and entity-dialog cases pass.
Browser checks verify the new view routes, routing events, rejected path shapes and
no file-editor API call from the panel. Existing UI checks remain green.

This is a reproduction of the failure class, not a diagnosis of the user's actual
configuration file. The screenshot confirms an editor HTTP 500; its server-side
cause remains unknown without HA logs. The fix changes the inspection route and
does not repair HA files. Browser tests use a synthetic harness, not the user's HA
frontend. No household screenshots or configuration are published.

The 24-file local installation ZIP has SHA-256:
`98175a7c981c4612f4a0a0459bce7ea36b608506aa073e61a78cdc860eb94a4d`.

All six jobs passed in the [v0.1.7 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37170706705)
at `4b800fee29d6707feffe621122cb0e1a39cb76eb`: Python 3.12 (100 tests, HA module
skipped), Python 3.14 (116 tests, 97.07% engine coverage), frontend (17 browser tests),
hassfest, HACS and automatic publication. The published
[v0.1.7](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.7) tag points
to that commit and its ZIP matches the local checksum. Discovery, installation and
opening the loaded-config view on the user's server remain unverified remotely.

## v0.1.6

Local validation on 2026-10-04: **113 Python tests passed**, with **97.07%** engine
coverage; **17 Chromium tests passed**. Ruff lint/format, engine mypy, frontend
formatting, TypeScript, the production build and package checks passed. Tested
against Home Assistant Core 2026.9.4 / Python 3.14.7.

Real HA tests verify automation/script editor IDs after registry renames, scene
ID encoding, default/custom dashboard routes, no-ID fallbacks and missing entities.
Browser tests verify native navigation events and history, editor URLs, entity
details events, rejected unsafe routes and current HA font inheritance. Navigation
does not issue WebSocket commands or run services. Preview, export, keyboard,
contrast, uncertainty grouping and mobile-overflow regressions remain covered.

The light, dark and mobile screenshots were visually reviewed and use synthetic
data only. Browser routing is tested in the demo harness; opening editors in a
running household HA frontend has not been remotely verified.

The 24-file local installation ZIP has SHA-256:
`be3cfadc5923b80511a78f50ad4f7b8944aa31e77a758beb8ff40da09f9603b2`.

All six jobs passed in the [v0.1.6 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37169707943)
at `1302bd34304828a52629d56bf3f116cb9f0960db`: Python 3.12 (100 tests, HA module
skipped), Python 3.14 (113 tests, 97.07% engine coverage), frontend (17 browser tests),
hassfest, HACS and automatic publication. The workflow published
[v0.1.6](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.6) in the
standard HACS release channel. The tag points to the tested commit and the published
ZIP matches the local checksum above. HACS discovery and installation on the user's
server are not remotely verified.

## v0.1.5

Local validation on 2026-10-04: **111 Python tests passed**, with **97.07%** engine
coverage; **13 Chromium tests passed**. Ruff lint/format, engine mypy, frontend
formatting, TypeScript, the production build and package checks passed. Tested
against Home Assistant Core 2026.9.4 / Python 3.14.7.

New regression cases cover a synthetic dashboard with 51 unresolved expressions:
one remains in the linked card and 50 are retained separately as dashboard context.
Nested sibling cards, parent wrappers, dashboard-level expressions, previews and
exports are checked. Simple local template bindings avoid false uncertainty while
runtime lookups, external variables, imports, unknown filters/tests and broad state
collections remain visible. A guard test rejects template compilation/rendering or
filter execution during analysis.

Browser tests verify collapsed groups with 51 entries, their explanations and exact
paths, one-based readable locations, keyboard tabs, mobile overflow and contrast of
confidence labels, secondary labels and the Analyze button (**at least 4.5:1**) in
the three tested themes. A custom dark theme deliberately supplies low-contrast
secondary/semantic colors. This is scoped verification, not whole-panel accessibility
certification or a claim about every HA theme. Light, dark and mobile layouts were
visually reviewed; screenshots and test reports use synthetic data only.

The 24-file local installation ZIP has SHA-256:
`9036ef291ec567b3eba2fe49f6a26922023e922f9870983f3a577f191d2c982a`.

All six jobs passed in the [v0.1.5 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37167766656)
at `44c0217b820c275eaf393c1b40077a2fa6f7d445`: Python 3.12 (100 tests, HA module
skipped), Python 3.14 (111 tests, 97.07% engine coverage), frontend (13 browser tests),
hassfest, HACS and automatic publication. The workflow published
[v0.1.5](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.5) in the
standard HACS release channel. The tag points to the tested commit and the published
ZIP matches the local checksum above. HACS discovery and installation on the user's
server are not remotely verified.

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

All six jobs passed in the [v0.1.4 CI run](https://github.com/artur-panek/ha-blast-radius/actions/runs/37166171988)
at `a497deeb94ea8812446b7516f86b7f7a7a0a77b7`: Python 3.12 (79 tests, HA module
skipped), Python 3.14 (90 tests, 96.31% engine coverage), frontend (11 browser tests),
hassfest, HACS and automatic publication.

The workflow published [v0.1.4](https://github.com/artur-panek/ha-blast-radius/releases/tag/v0.1.4)
in the standard HACS release channel. The tag points to the tested commit. The
24-file ZIP and checksum file are attached; the ZIP's SHA-256 matches the local
package and both CI builds:
`91a0fa77cc06e6cc41cc6cfd0d6b58305c2c2cd17bedaa3b883e4d332c9dbe34`.
HACS discovery and installation on the user's server are not remotely verified.

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

## HA-next policy

The separate **HA next compatibility** workflow is advisory and runs on pull requests,
main updates and weekly. It uses a reproducible HA/pytest-fixture/frontend pairing
from `requirements/ha-next.txt`; it runs the full suite without `continue-on-error`.
Failures remain visible in a separate workflow. Stable HA 2026.9.4 in Quality is
still required by the release job. See [promotion process](releasing.md#maintaining-ha-compatibility).
