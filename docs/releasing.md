# Release checklist

The 0.2 series is a public alpha. A green workflow validates the declared
test environment; it is not certification across all Home Assistant installations.
Publishing to GitHub and listing in HACS's default directory are separate steps.

## Prepare

1. Choose a new three-part version and update `manifest.json`, `const.py`,
   `pyproject.toml`, `frontend/package.json` and its lockfile together. The package
   check rejects mismatches, including a stale frontend cache version.
2. Update the changelog, README version and compatibility/coverage statements.
3. Regenerate demo reports after engine changes. Regenerate brand assets after
   changing their source. Rebuild and commit the frontend and runtime assets.
4. Run the commands in CONTRIBUTING.md. Inspect desktop/mobile screenshots and
   check setup, analysis, preview and unload on the supported HA version.
5. Review the diff for credentials, household configuration and unintentional files.
6. Confirm both hassfest and the HACS Action pass without ignored validations.

## Package

From a clean checkout of the reviewed commit:

```bash
python scripts/check_package.py
python scripts/package_release.py
```

The second command creates `dist/ha-blast-radius-v<version>.zip` and prints its
SHA-256. It includes only tracked runtime files, the MIT license and standalone
installation instructions. ZIP timestamps are fixed for reproducible builds.
Existing output files are not overwritten; use `--output <new-path>.zip` if needed.

## Automatic publication

Merging or pushing an **unreleased manifest version to `main` is the publication
decision**. The final Quality job waits for both Python jobs, frontend, hassfest
and HACS. If they all pass, it publishes `v<version>` at that exact tested commit.
Pull requests and fork repositories cannot publish.

The job uses GitHub's short-lived `GITHUB_TOKEN` with `contents: write`, scoped only
to publication; test jobs remain read-only. No personal access token is needed.
It creates a draft, uploads the manual-install ZIP and `SHA256SUMS`, verifies the
uploaded digests, and only then publishes it. Release notes come from the matching
changelog section and include compatibility and installation guidance.

Numbered releases use GitHub's **regular release channel** (`prerelease: false`)
so HACS users do not have to enable beta versions. The release title, notes, README
and panel still label the project an **experimental alpha**. This channel choice
does not establish production stability or broader HA compatibility.

### Safeguards and retry

- A published version is a no-op: later commits cannot silently replace its assets,
  notes or tag. Bump the version for the next user-facing update.
- Publication stops if `main` advanced, a tag points elsewhere, a draft belongs to
  another commit, an asset checksum differs, or the version would downgrade latest.
- A cancelled/failed upload can leave an unpublished draft. Rerun the failed Quality
  job at the same commit; matching assets are reused without overwriting them.
- If `main` advanced, inspect the draft before proceeding. The workflow intentionally
  does not delete conflicting drafts/assets, move tags or broaden token permissions.
- A manual **Run workflow** on `main` reruns all checks before attempting publication.
  Documentation-only pushes remain excluded from Quality and do not republish releases.

After publication, verify the tag, release assets and installation through HACS.
Existing branch-based installations should Redownload once and select the numbered
version; see [installation](installation.md). HACS detects releases periodically;
the integration never auto-installs itself or restarts HA. No HACS default-directory
submission is performed by this workflow.

## Maintaining HA compatibility

`pyproject.toml` pins stable HA, its matching pytest fixture package and frontend.
Quality's Python 3.14 job remains required by publication; Python 3.12 tests the
standalone engine. `.github/workflows/ha-next.yml` runs the same full Python suite
on PRs, main and weekly, using `requirements/ha-next.txt` in a separate environment.
The next lane is advisory and is not a dependency of publication. Failures remain
red with their logs and exact HA version; no `continue-on-error` hides them.

Before each release, inspect official HA GitHub releases and update the next pairing
to the latest appropriate official prerelease, including the matching fixture package
and HA frontend requirement. Version pins keep runs reproducible. A newly released
beta does not silently replace an already recorded test result.

Once the next HA version becomes stable, run the full suite, assess interface changes
and deliberately update the stable pins, HACS minimum/support statement, package
checks and release notes. Then move the advisory pairing to the next official release.
Do not relax stable checks to accommodate beta failures. Keep stable and next in
separate environments; do not install the stable `ha` extra in the next environment.

```bash
python3.14 -m venv .venv-next
.venv-next/bin/python -m pip install -e '.[dev]' -r requirements/ha-next.txt
.venv-next/bin/python -m pip check
.venv-next/bin/pytest -q --cov --timeout=60
```
