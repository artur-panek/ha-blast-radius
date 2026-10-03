# Contributing

Use the README development commands, a small branch and a focused pull request.
Keep `analysis/` independent of HA imports and UI concerns.

For new source/syntax coverage, add a synthetic fixture and a regression test,
explain confidence and unresolved cases, verify the pinned HA API, and update
limitations. Never guess dynamic targets.

Run pytest, Ruff, mypy, frontend build and browser tests. Commit the compiled panel
with its source. Do not commit real configuration, tokens, `.storage`, installation
paths or screenshots of a real household.

The v0.1 boundary is read-only. Rewrites, runtime recorders and external automation
parsers require a separate scope discussion.
