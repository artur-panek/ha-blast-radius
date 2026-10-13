## Find where an entity is used

Before renaming or removing a Home Assistant entity, check what refers to it.

Enter an entity ID. Blast Radius lists matching automations, scripts, scenes and dashboards. Open a configuration in Home Assistant, or expand a result to see the exact reference location.

![Blast Radius results from a synthetic Home Assistant configuration](https://raw.githubusercontent.com/artur-panek/ha-blast-radius/main/docs/panel-light.png)

A rename or removal preview shows the configurations to review. Blast Radius is **read-only**: it never makes those changes. The relationship map and raw references are available when you need more detail.

**Limitations:** This is a static scan of loaded configuration, not an execution trace. It cannot evaluate conditions or resolve every template, device/area target or unavailable dashboard. No matches does not mean an entity is safe to remove.

Requires **Home Assistant 2026.9.4 or later** and an administrator account. Runs locally in Home Assistant, with no cloud service or telemetry.

[Install through HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=artur-panek&repository=ha-blast-radius&category=integration) · [Documentation](https://github.com/artur-panek/ha-blast-radius#installation) · [Known limitations](https://github.com/artur-panek/ha-blast-radius#known-limitations) · [Report a problem](https://github.com/artur-panek/ha-blast-radius/issues/new/choose)
