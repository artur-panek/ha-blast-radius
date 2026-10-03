"""HA Blast Radius: read-only configuration impact analysis."""

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_PATH, STATIC_URL, VERSION
from .coordinator import BlastRadiusCoordinator
from .websocket import async_register_commands

type BlastRadiusConfigEntry = ConfigEntry[BlastRadiusCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: BlastRadiusConfigEntry) -> bool:
    data = hass.data.setdefault(DOMAIN, {})
    if not data.get("registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(Path(__file__).parent / "frontend"), False)]
        )
        async_register_commands(hass)
        data["registered"] = True
    entry.runtime_data = BlastRadiusCoordinator(hass)
    data["coordinator"] = entry.runtime_data
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/blast-radius-icons.js?v={VERSION}")
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="blast-radius-panel",
        sidebar_title="Blast Radius",
        sidebar_icon="blast-radius:radius",
        module_url=f"{STATIC_URL}/blast-radius.js?v={VERSION}",
        require_admin=True,
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: BlastRadiusConfigEntry) -> bool:
    frontend.async_remove_panel(hass, PANEL_PATH)
    frontend.remove_extra_js_url(hass, f"{STATIC_URL}/blast-radius-icons.js?v={VERSION}")
    hass.data[DOMAIN].pop("coordinator", None)
    # Static route and commands remain registered once. Commands return not_loaded
    # while unloaded; a reload must not attempt duplicate aiohttp registrations.
    return True
