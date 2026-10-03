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

## Publish when approved

- Confirm every Quality job is green for the release commit. Documentation-only
  commits can reuse the last runtime validation if no runtime or packaging files changed.
- Tag that exact commit as `v<version>` and create a GitHub release. Mark 0.1 releases
  as **pre-release** and use the matching changelog section for the release notes.
- Attach the installation ZIP and its SHA-256. State the tested HA version and
  remaining coverage limitations; do not describe the alpha as production-certified.
- Check the tagged files and installation through HACS. Users may need to opt into
  pre-release versions in their HACS installation.

No workflow in this repository creates tags, releases or a HACS listing automatically.
Preparing a versioned commit does not imply those publishing steps have been done.
