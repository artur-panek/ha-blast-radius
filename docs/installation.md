# Installation and troubleshooting

HA Blast Radius is an experimental, read-only custom integration. Use Home Assistant
2026.9.4 or newer and an administrator account. Compatibility is currently tested
against 2026.9.4; newer versions are not automatically guaranteed to work.
Make a Home Assistant backup before installing or updating any custom integration.

## HACS custom repository

[![Open your Home Assistant instance and open this repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=artur-panek&repository=ha-blast-radius&category=integration)

Use the button above for one-click HACS setup, or add the repository manually:

1. Open HACS and its **Custom repositories** dialog.
2. Add `https://github.com/artur-panek/ha-blast-radius` as **Integration**.
3. Download **HA Blast Radius** and restart Home Assistant.
4. Open **Settings → Devices & services → Add integration → HA Blast Radius**.
5. Confirm setup, then open **Blast Radius** in the sidebar.

This is a custom repository, not a HACS default-directory listing. Choose the
latest numbered release, not `main`, for the normal update channel. Releases are
published automatically after all Quality checks pass for a new manifest version.
The integration remains an experimental alpha; using the standard HACS release
channel is not a claim of production stability.

## Manual installation

From the repository or a release installation ZIP, copy
`custom_components/blast_radius/` into the `custom_components/` folder in your Home
Assistant configuration directory. The final path must be
`<config>/custom_components/blast_radius/manifest.json`, not a nested repository
folder. Include the `frontend/`, `brand/`, `analysis/` and `translations/` folders.

Restart Home Assistant, then add the integration through Devices & services.
Do not add configuration YAML, credentials or dashboard resources. Node.js is not
needed on the Home Assistant machine; the built panel is included.

## Updating and rolling back

- HACS checks for new numbered releases and exposes available updates in Home
  Assistant. Discovery is periodic, not immediate. Install the offered update,
  then restart HA; this integration never installs itself or restarts your server.
- **One-time switch from `main`:** open HACS → HA Blast Radius → menu →
  **Redownload**, select the newest numbered release, and download it. Restart HA
  and reload the browser. Even if the panel already shows that version, this switches
  HACS from branch tracking to numbered release tracking.
- If a new release is missing, use the repository menu's **Update information**
  option and reopen Redownload. Do not delete the integration or edit HACS storage.
- Staying on `main` is an opt-in development choice; branch updates may include
  unreleased changes and do not follow the numbered release channel.
- For manual installation, back up the existing `blast_radius` folder and replace
  it with the complete folder from the chosen version. Do not mix files from versions.
- Restart Home Assistant and fully reload the browser. The desktop panel header
  and integration diagnostics show the installed version.
- To roll back, install the earlier tagged version or restore the previous folder
  from your backup, then restart and reload again.

## First check

Analyze an entity you know appears in an automation or dashboard. Confirm the
source IDs and paths against that configuration. Click a source name or **Open**
to inspect the loaded automation or script in HA's native read-only view. This also
works for loaded YAML automations without an editor ID. Scene links open HA's editor;
dashboards open their view and other entities open HA's details dialog. Scenes
without an editor ID fall back to details; missing entities have no open button.
Navigation does not run automations, scripts or scenes.

Use browser **Back** after opening a source. The panel restores your last successful
search, depth and tab, requests a fresh report and restores the scroll position as
far as the refreshed layout allows. This also works after reloading the page.
The **Recent** bar keeps six successful searches in this browser tab's session;
click one to analyze it again at its saved depth. **Clear** forgets the history and
saved view without removing the report currently on screen. Your next successful
analysis starts the list again. History is separate for each HA user on this origin.
Only entity IDs and view settings are saved locally, not reports or configuration.
Closing the tab normally ends the session; browser session recovery can retain it.

Open **Graph** for separate **Used by** and **Possible targets** columns. Expand
**Preview a change** to try a removal preview. Preview buttons only generate
reports; they never perform the change.

An unresolved count is not a count of broken entities. Expand **Unresolved
expressions** to review groups by source and reason. **In linked configurations**
covers affected automation/script configurations and linked dashboard cards.
**Elsewhere in linked dashboards** retains expressions outside those cards or at
dashboard level without attributing them to this entity. Their targets remain
unknown. The total across the snapshot is under **Coverage and limitations**;
a zero local count does not establish complete coverage.

Friendly names and readable locations make the result easier to scan. Locations
use one-based numbers (for example, Card 3). Expand **Reference details** or
**Connection details** for
the exact zero-based path (`cards[2]`), or use **Raw references** and the exports.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Integration not found | Verify the folder path and HA version, then restart HA |
| Sidebar entry absent | Confirm the integration was added and you are an administrator |
| Old UI or missing sidebar icon | Restart HA after updating, then reload the browser or reopen the app |
| Error loading automation (500) after Open | Update to v0.1.7+, restart HA and reload. Open now uses HA's loaded-config view. A 500 in HA's separate edit screen still needs investigation in HA logs; Blast Radius does not repair configuration files |
| Analysis fails | Reload the integration and retry; record versions and a synthetic reproduction |
| Expected reference absent | Expand coverage warnings; unloaded YAML, failed blueprint expansion and unsupported source types can leave gaps |
| Many unresolved entries | Expand the reason groups; runtime variables, patterns and selectors need more context. Other dashboard cards are listed separately, not attributed to this entity |
| Empty result | Check spelling and coverage; no detected reference is not proof removal is safe |

## Removal

Remove the integration through Devices & services, then uninstall its files through
HACS or remove only `<config>/custom_components/blast_radius/`. Restart HA. Your
automations, scripts, entities and dashboards are not modified by the integration.

Report bugs at https://github.com/artur-panek/ha-blast-radius/issues.
Share only redacted reports and minimal synthetic examples, not full household
configuration, access tokens or `.storage` files.

## v0.2.1 exploration controls

Source/confidence chips filter the displayed results. Full totals, coverage and
exports remain complete. **Analyze this** changes the graph root inside Blast
Radius; **Open →** opens Home Assistant's own inspector. Filters reset for a new
root or when the panel is reopened. Recent searches and the selected tab retain
existing session behavior. After updating, reload the browser to load the new panel.

Successful loaded automation/script blueprints are inspected with HA-substituted
inputs. Selector identity status is checked against registries; their entity members
are not inferred. Supported stable baseline: Core 2026.9.4. HA-next CI is advisory.
