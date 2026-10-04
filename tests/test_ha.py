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
from custom_components.blast_radius.adapter import (  # noqa: E402
    collect_snapshot,
    navigation_targets,
)
from custom_components.blast_radius.const import DOMAIN, VERSION  # noqa: E402
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
        type(hass.services), "async_call", side_effect=AssertionError("must not call services")
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
    assert (
        report["navigation"]["automation.wall_button"]["path"]
        == "/config/automation/show/automation.wall_button"
    )
    assert (
        report["navigation"]["script.music_toggle"]["path"]
        == "/config/script/show/script.music_toggle"
    )
    assert report["navigation"]["media_player.speaker"] == {
        "kind": "entity",
        "entity_id": "media_player.speaker",
    }


async def test_navigation_uses_current_entity_ids_after_renames(hass):
    from homeassistant.helpers import entity_registry as er

    await load_sources(hass)
    registry = er.async_get(hass)
    registry.async_update_entity("automation.wall_button", new_entity_id="automation.renamed")
    registry.async_update_entity("script.music_toggle", new_entity_id="script.renamed")
    await hass.async_block_till_done()
    sources, _, _ = await collect_snapshot(hass)
    targets = navigation_targets(hass, sources, {"automation.renamed", "script.renamed"})
    assert targets["automation.renamed"]["path"] == "/config/automation/show/automation.renamed"
    assert targets["script.renamed"]["path"] == "/config/script/show/script.renamed"


async def test_scene_dashboard_and_missing_navigation(hass):
    from custom_components.blast_radius.analysis.models import Source

    hass.states.async_set("scene.evening", "unknown", {"id": "evening scene/#1"})
    hass.states.async_set("scene.external", "unknown")
    hass.states.async_set("automation.yaml_no_id", "on")
    sources = (
        Source("dashboard.lovelace", "dashboard", "Overview", {}),
        Source("dashboard.wall-panel", "dashboard", "Wall", {}),
    )
    ids = {"scene.evening", "scene.external", "automation.yaml_no_id", "light.removed"} | {
        s.source_id for s in sources
    }
    with patch.object(
        type(hass.services), "async_call", side_effect=AssertionError("must not call services")
    ):
        targets = navigation_targets(hass, sources, ids)
    assert targets["scene.evening"]["path"] == "/config/scene/edit/evening%20scene%2F%231"
    assert targets["scene.external"] == {"kind": "entity", "entity_id": "scene.external"}
    assert targets["automation.yaml_no_id"] == {
        "kind": "entity",
        "entity_id": "automation.yaml_no_id",
    }
    assert targets["dashboard.lovelace"]["path"] == "/lovelace"
    assert targets["dashboard.wall-panel"]["path"] == "/wall-panel"
    assert "light.removed" not in targets


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


@pytest.mark.parametrize(
    ("domain", "entity_id", "config_key", "invalid_file"),
    [
        ("automation", "automation.wall_button", "wall_button", {"wrong_root": []}),
        ("script", "script.music_toggle", "music_toggle", ["wrong_root"]),
    ],
)
async def test_loaded_config_remains_available_when_editor_returns_500(
    hass, hass_client, hass_ws_client, domain, entity_id, config_key, invalid_file
):
    from homeassistant.components.config import automation, script

    await load_sources(hass)
    assert await async_setup_component(hass, "http", {})
    assert await async_setup_component(hass, "websocket_api", {})
    assert (automation if domain == "automation" else script).async_setup(hass)
    http = await hass_client()
    websocket = await hass_ws_client(hass)
    sources, _, _ = await collect_snapshot(hass)
    # Reproduce a failed native file-based editor independently from the valid
    # configuration still loaded in HA. Do not modify any user configuration.
    with (
        patch("homeassistant.components.config.view._read", return_value=invalid_file),
        patch.object(
            type(hass.services), "async_call", side_effect=AssertionError("must not call services")
        ),
    ):
        response = await http.get(f"/api/config/{domain}/config/{config_key}")
        assert response.status == 500
        targets = navigation_targets(hass, sources, {entity_id})
        assert targets[entity_id]["path"] == f"/config/{domain}/show/{entity_id}"
        # This is the native command used by HA's /show route, not a stub.
        await websocket.send_json({"id": 1, "type": f"{domain}/config", "entity_id": entity_id})
        result = await websocket.receive_json()
        assert result["success"]
        assert result["result"]["config"]["alias"] == (
            "Wall button" if domain == "automation" else "Music toggle"
        )


async def test_loaded_yaml_automation_without_id_opens_native_inspector(hass):
    assert await async_setup_component(
        hass,
        "automation",
        {
            "automation": [
                {
                    "alias": "YAML only",
                    "triggers": [{"trigger": "event", "event_type": "synthetic_event"}],
                    "actions": [],
                }
            ]
        },
    )
    await hass.async_block_till_done()
    sources, _, _ = await collect_snapshot(hass)
    assert "id" not in hass.states.get("automation.yaml_only").attributes
    assert (
        navigation_targets(hass, sources, {"automation.yaml_only"})["automation.yaml_only"]["path"]
        == "/config/automation/show/automation.yaml_only"
    )


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
    hass.data[frontend.DATA_EXTRA_MODULE_URL] = set()
    icon_url = f"/blast_radius_static/blast-radius-icons.js?v={VERSION}"
    with patch.object(hass, "http", create=True) as http:
        http.async_register_static_paths = AsyncMock()
        assert await async_setup_entry(hass, entry)
        assert hass.data[frontend.DATA_PANELS]["blast-radius"].require_admin
        assert icon_url in hass.data[frontend.DATA_EXTRA_MODULE_URL]
        assert await async_unload_entry(hass, entry)
        assert "blast-radius" not in hass.data[frontend.DATA_PANELS]
        assert icon_url not in hass.data[frontend.DATA_EXTRA_MODULE_URL]
        assert await async_setup_entry(hass, entry)
        assert http.async_register_static_paths.await_count == 1
    diagnostics = await async_get_config_entry_diagnostics(hass, entry)
    assert diagnostics == {"version": VERSION, "read_only": True}


async def test_config_flow_singleton(hass):
    from custom_components.blast_radius.config_flow import BlastRadiusConfigFlow

    flow = BlastRadiusConfigFlow()
    flow.hass = hass
    flow.handler = DOMAIN
    flow.context = {"source": "user"}
    result = await flow.async_step_user()
    assert result["type"] == "form"
    result = await flow.async_step_user({})
    assert result["type"] == "create_entry"
    MockConfigEntry(domain=DOMAIN, data={}, unique_id=DOMAIN).add_to_hass(hass)
    from homeassistant.data_entry_flow import AbortFlow

    with pytest.raises(AbortFlow) as error:
        await flow.async_step_user()
    assert error.value.reason == "already_configured"


async def test_install_through_config_entry_manager(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert "blast-radius" in hass.data[frontend.DATA_PANELS]
    assert await hass.config_entries.async_unload(entry.entry_id)


@pytest.mark.parametrize("error_type", [ValueError, RuntimeError])
async def test_unexpected_errors_do_not_leak_details(hass, hass_ws_client, error_type):
    hass.data[DOMAIN] = {
        "coordinator": SimpleNamespace(
            request=AsyncMock(side_effect=error_type("private-token-or-config-path"))
        )
    }
    async_register_commands(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "blast_radius/entities"})
    response = await client.receive_json()
    assert response["error"]["code"] == "analysis_failed"
    assert "private-token" not in str(response)


async def test_oversized_membership_does_not_abort_snapshot(hass):
    hass.states.async_set("group.oversized", "on", {"entity_id": "x" * 65_537})
    hass.states.async_set("group.valid", "on", {"entity_id": ["light.office"]})
    sources, _, warnings = await collect_snapshot(hass)
    assert {source.source_id for source in sources} == {"group.valid"}
    assert any("group.oversized" in warning for warning in warnings)


def test_template_objects_obey_the_same_string_limit(hass):
    from homeassistant.helpers.template import Template

    from custom_components.blast_radius.adapter import _normalize

    with pytest.raises(ValueError, match="string exceeds"):
        _normalize(Template("x" * 65_537, hass))
