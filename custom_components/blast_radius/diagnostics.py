"""Diagnostics deliberately contain aggregate counts only."""

from typing import Any

from homeassistant.core import HomeAssistant

from . import BlastRadiusConfigEntry
from .const import VERSION


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: BlastRadiusConfigEntry
) -> dict[str, Any]:
    return {"version": VERSION, "read_only": True, **entry.runtime_data.last_summary}
