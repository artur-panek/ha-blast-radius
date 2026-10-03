"""Admin-only, read-only WebSocket API."""

from typing import Any

import probatio as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .coordinator import BlastRadiusCoordinator


async def _respond(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    operation: str,
) -> None:
    coordinator: BlastRadiusCoordinator | None = hass.data.get(DOMAIN, {}).get("coordinator")
    if coordinator is None:
        connection.send_error(msg["id"], "not_loaded", "HA Blast Radius is not loaded")
        return
    try:
        result = await coordinator.request(operation, msg)
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_input", str(err))
    except Exception:
        connection.send_error(
            msg["id"], "analysis_failed", "Unable to inspect configuration. Reload and try again."
        )
    else:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "blast_radius/entities"})
@websocket_api.require_admin
@websocket_api.async_response
async def entities(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    await _respond(hass, connection, msg, "entities")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "blast_radius/analyze",
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("max_depth", default=6): vol.All(int, vol.Range(min=1, max=12)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def analyze(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    await _respond(hass, connection, msg, "analyze")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "blast_radius/preview",
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("operation"): vol.In(["rename", "delete"]),
        vol.Optional("new_entity_id"): cv.entity_id,
        vol.Optional("max_depth", default=6): vol.All(int, vol.Range(min=1, max=12)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def preview(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    await _respond(hass, connection, msg, "preview")


@callback
def async_register_commands(hass: HomeAssistant) -> None:
    for handler in (entities, analyze, preview):
        websocket_api.async_register_command(hass, handler)
