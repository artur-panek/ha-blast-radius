# Release checklist

The 0.1 series is an experimental alpha. A green workflow validates the declared
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
