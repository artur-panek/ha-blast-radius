"""Exercise real HA configuration, WebSocket auth and integration lifecycle."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.components import frontend  # noqa: E402
from homeassistant.components.lovelace.const import LOVELACE_DATA  # noqa: E402
from homeassistant.setup import async_setup_component  # noqa: E402
from pytest_homeassistant_custom_component.common import MockConfigEntry  # noqa: E402

from custom_components.blast_radius import async_setup_entry, async_unload_entry  # noqa: E402
from custom_components.blast_radius.adapter import collect_snapshot  # noqa: E402
from custom_components.blast_radius.const import DOMAIN  # noqa: E402
from custom_components.blast_radius.coordinator import BlastRadiusCoordinator  # noqa: E402
from custom_components.blast_radius.diagnostics import (
    async_get_config_entry_diagnostics,  # noqa: E402
)
from custom_components.blast_radius.websocket import async_register_commands  # noqa: E402


@pytest.fixture(autouse=True)
def custom_integrations(enable_custom_integrations):
    yield


async def load_sources(hass):
    assert await async_setup_component(
        hass,
        "script",
        {
            "script": {
                "music_toggle": {
                    "alias": "Music toggle",
                    "sequence": [
                        {
                            "action": "media_player.media_play",
                            "target": {"entity_id": "media_player.speaker"},
                        }
                    ],
                }
            }
        },
    )
    assert await async_setup_component(
        hass,
        "automation",
        {
            "automation": [
                {
                    "id": "wall_button",
                    "alias": "Wall button",
                    "triggers": [
                        {"trigger": "state", "entity_id": "binary_sensor.wall_button", "to": "on"}
                    ],
                    "actions": [{"action": "script.music_toggle"}],
                }
            ]
        },
    )
    hass.states.async_set("binary_sensor.wall_button", "off")
    hass.states.async_set("media_player.speaker", "idle")
    await hass.async_block_till_done()


async def test_real_automation_script_adapter_and_non_mutation(hass):
    await load_sources(hass)
    sources, names, warnings = await collect_snapshot(hass)
    assert {s.source_id for s in sources} >= {"automation.wall_button", "script.music_toggle"}
    assert "media_player.speaker" in names
    coordinator = BlastRadiusCoordinator(hass)
    with patch.object(
        hass.services, "async_call", side_effect=AssertionError("must not call services")
    ):
        report = await coordinator.request(
            "preview",
            {
                "entity_id": "binary_sensor.wall_button",
                "operation": "rename",
                "new_entity_id": "binary_sensor.new_button",
            },
        )
    assert report["summary"]["explicit"] == 1
    assert report["preview"]["changes_applied"] is False
    assert "media_player.speaker" in {n["id"] for n in report["graph"]["nodes"]}
    assert (await collect_snapshot(hass))[0] == sources
    assert warnings


async def test_dashboard_failure_is_partial_coverage(hass):
    good = AsyncMock()
    good.async_load.return_value = {"views": [{"cards": [{"entity": "light.desk"}]}]}
    bad = AsyncMock()
    bad.async_load.side_effect = RuntimeError("private-secret-and-path")
    hass.data[LOVELACE_DATA] = SimpleNamespace(dashboards={None: good, "broken": bad})
    sources, _, warnings = await collect_snapshot(hass)
    assert sources[0].source_id == "dashboard.lovelace"
    assert any("dashboard.broken" in warning for warning in warnings)
    assert not any("private-secret" in warning for warning in warnings)
    good.async_save.assert_not_called()
    bad.async_save.assert_not_called()


async def test_websocket_real_transport(hass, hass_ws_client):
    await load_sources(hass)
    hass.data[DOMAIN] = {"coordinator": BlastRadiusCoordinator(hass)}
    async_register_commands(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "blast_radius/entities"})
    response = await client.receive_json()
    assert response["success"]
    assert any(
        e["entity_id"] == "binary_sensor.wall_button" for e in response["result"]["entities"]
    )
    await client.send_json(
        {"id": 2, "type": "blast_radius/analyze", "entity_id": "binary_sensor.wall_button"}
    )
    response = await client.receive_json()
    assert response["success"]
    assert response["result"]["summary"]["explicit"] == 1
    await client.send_json(
        {
            "id": 3,
            "type": "blast_radius/preview",
            "entity_id": "binary_sensor.wall_button",
            "operation": "rename",
            "new_entity_id": "light.wrong_domain",
        }
    )
    response = await client.receive_json()
    assert response["error"]["code"] == "invalid_input"
    await client.send_json(
        {"id": 4, "type": "blast_radius/analyze", "entity_id": "light.desk", "max_depth": 99}
    )
    assert (await client.receive_json())["error"]["code"] == "invalid_format"
    hass.data[DOMAIN].pop("coordinator")
    await client.send_json({"id": 5, "type": "blast_radius/entities"})
    assert (await client.receive_json())["error"]["code"] == "not_loaded"


async def test_non_admin_cannot_inspect(hass, hass_ws_client, hass_read_only_access_token):
    async_register_commands(hass)
    client = await hass_ws_client(hass, access_token=hass_read_only_access_token)
    for idx, command in enumerate(["entities", "analyze", "preview"], 1):
        msg = {"id": idx, "type": f"blast_radius/{command}"}
        if command != "entities":
            msg["entity_id"] = "light.desk"
        if command == "preview":
            msg["operation"] = "delete"
        await client.send_json(msg)
        assert (await client.receive_json())["error"]["code"] == "unauthorized"


async def test_setup_unload_reload_and_private_diagnostics(hass):
    # Real panel registry; HTTP registration is isolated to avoid setting up HA's
    # entire frontend dependency tree in this targeted lifecycle test.
    entry = MockConfigEntry(domain=DOMAIN, data={}, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    hass.data[frontend.DATA_PANELS] = {}
    with patch.object(hass, "http", create=True) as http:
        http.async_register_static_paths = AsyncMock()
        assert await async_setup_entry(hass, entry)
        assert hass.data[frontend.DATA_PANELS]["blast-radius"].require_admin
        assert await async_unload_entry(hass, entry)
        assert "blast-radius" not in hass.data[frontend.DATA_PANELS]
        assert await async_setup_entry(hass, entry)
        assert http.async_register_static_paths.await_count == 1
    diagnostics = await async_get_config_entry_diagnostics(hass, entry)
    assert diagnostics == {"version": "0.1.0", "read_only": True}


async def test_config_flow_singleton(hass):
    from custom_components.blast_radius.config_flow import BlastRadiusConfigFlow

    flow = BlastRadiusConfigFlow()
    flow.hass = hass
    flow.context = {"source": "user"}
    result = await flow.async_step_user()
    assert result["type"] == "form"
    result = await flow.async_step_user({})
    assert result["type"] == "create_entry"
