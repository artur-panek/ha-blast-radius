## Find what uses an entity before you change it

HA Blast Radius is a read-only dependency inspector for Home Assistant. Select an entity and see which automations, scripts, scenes and dashboards reference it, grouped by how they use it.

- **Open a source** directly in Home Assistant, or expand it to see the exact configuration locations.
- **Preview a rename or removal** to review affected configurations. Blast Radius does not make the change for you.
- **Explore relationships** when you need the deeper dependency map and raw references.

### Know the limits

The analysis is based on configuration, not a simulation of runtime behavior. Dynamic templates, device and area targets, external integrations and unavailable dashboard configuration may hide additional uses. No matches does **not** mean an entity is safe to delete.

Requires **Home Assistant 2026.9.4 or later** and administrator access. Experimental alpha; no cloud service or telemetry.

[Installation and setup](https://github.com/artur-panek/ha-blast-radius#installation) · [Example screenshot](https://github.com/artur-panek/ha-blast-radius/blob/main/docs/panel-dark.png) · [Known limitations](https://github.com/artur-panek/ha-blast-radius#known-limitations) · [Report an issue](https://github.com/artur-panek/ha-blast-radius/issues/new/choose)
