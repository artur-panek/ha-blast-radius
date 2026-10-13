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

After opening a configuration, use your browser's **Back** button to return to
Blast Radius. The panel reloads the last successful search and restores its depth,
selected advanced tab and scroll position when possible.

The Recent bar can reopen up to six earlier searches. It stays out of the way if
the only saved search is the one currently displayed. To clear history, expand
**Analysis options** and choose **Clear search history**. Only entity IDs and view
settings are saved in browser session storage; reports and raw configuration are
not. History is scoped to your HA user and browser tab.

Select **Preview a change** to inspect a possible rename or removal. The preview
does not perform either operation. Select **Explore relationships** to open
Advanced analysis, where **Detailed impact**, **Relationship map** and **Raw
references** remain available. The relationship map separates configurations
using an entity from possible output targets; it does not simulate execution.

For scanner gaps, open **Scan details**. The first section shows what was
inspected and which configurations could not be checked. **Technical details**
contains installation-wide statistics and reason groups. Counts of unresolved
expressions are not counts of broken entities or confirmed dependencies of the
selected entity.

The normal results list has **View exact locations** under each source.
Friendly paths use one-based numbers (for example, Card 3); the underlying
configuration path uses zero-based indexes (`cards[2]`). Advanced analysis
also exposes raw paths and export options.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Integration not found | Verify the folder path and HA version, then restart HA |
| Sidebar entry absent | Confirm the integration was added and you are an administrator |
| Old UI or missing sidebar icon | Restart HA after updating, then reload the browser or reopen the app |
| Error opening an automation | Check whether the same automation loads in HA's own inspector, then check HA logs. Blast Radius uses HA's loaded-config view; it does not repair invalid configuration files |
| Analysis fails | Reload the integration and retry; record versions and a synthetic reproduction |
| Expected reference absent | Open Scan details. Unloaded YAML, failed blueprint expansion, generated dashboards and unsupported sources can leave gaps |
| Many unresolved entries | Technical details includes full-snapshot statistics. Expand reason groups to inspect runtime variables, patterns or selectors; unlinked dashboard expressions are not assigned to the selected entity |
| Empty result | Check spelling and coverage; no detected reference is not proof removal is safe |

## Removal

Remove the integration through Devices & services, then uninstall its files through
HACS or remove only `<config>/custom_components/blast_radius/`. Restart HA. Your
automations, scripts, entities and dashboards are not modified by the integration.

Report bugs at https://github.com/artur-panek/ha-blast-radius/issues.
Share only redacted reports and minimal synthetic examples, not full household
configuration, access tokens or `.storage` files.

## Advanced analysis

Source and confidence filters apply to the detailed analysis, graph and raw
references, not the main source list or exports. **Analyze this** changes the
selected entity in the graph; **Open →** inspects the source in Home Assistant.
Filters reset when you choose another entity or reopen the panel.

Successful automation and script blueprints are inspected after Home Assistant
substitutes their inputs. Device/area/floor/label selectors are checked for
registry identity, but their entity members are not inferred. The stable
compatibility baseline is Core 2026.9.4; HA-next CI is advisory.
