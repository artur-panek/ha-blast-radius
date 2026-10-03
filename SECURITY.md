# Security

Security fixes target the latest 0.1.x alpha. Older alpha builds are not separately
maintained. This project has not undergone an independent security audit.

Reports contain entity IDs, names, configuration paths and dependency structure,
even though raw source configs and template bodies are excluded. Treat JSON,
Markdown and screenshots as private configuration data and review them before sharing.

## Reporting a vulnerability

Use GitHub private vulnerability reporting if enabled on the published repository.
If unavailable, open a minimal issue requesting a private channel; do not publish
exploit details, tokens or configuration dumps.

Include integration/HA versions, a synthetic reproduction and impact. Do not send
live credentials, full configurations, `.storage` files or unredacted exports.

## Trust boundary

The panel and all data commands require administrator access. The integration runs
inside Home Assistant and is not a sandbox for untrusted code. Static JavaScript
assets are publicly served; configuration data is available only through the
authenticated, administrator-only WebSocket commands.

The analyzer never renders templates, invokes services or applies previewed changes.
Setup creates the normal HA config entry and registers the panel and icon assets;
read-only refers to the inspected automations, scripts, entities and dashboards.
Unexpected API failures return a generic error rather than exception text.
No telemetry or external analysis service is used.

Dependency scans and the mutation-call guard in CI are useful checks, not proof
that every vulnerability or possible write has been excluded.
