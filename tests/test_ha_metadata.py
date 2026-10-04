"""Contract tests against real HA loaded configurations, never household data."""

from unittest.mock import patch

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.helpers import area_registry as ar  # noqa: E402
from homeassistant.helpers import device_registry as dr  # noqa: E402
from homeassistant.helpers import entity_registry as er  # noqa: E402
from homeassistant.helpers import floor_registry as fr  # noqa: E402
from homeassistant.helpers import label_registry as lr  # noqa: E402
from homeassistant.helpers.entity_component import DATA_INSTANCES  # noqa: E402
from homeassistant.setup import async_setup_component  # noqa: E402
from pytest_homeassistant_custom_component.common import MockConfigEntry  # noqa: E402

from custom_components.blast_radius.adapter import collect_snapshot  # noqa: E402
from custom_components.blast_radius.coordinator import BlastRadiusCoordinator  # noqa: E402


@pytest.fixture(autouse=True)
def custom_integrations(enable_custom_integrations):
    yield


@pytest.mark.parametrize("domain", ["automation", "script"])
async def test_loaded_blueprint_is_substituted_through_native_config_api(
    hass, hass_ws_client, tmp_path, domain
):
    hass.config.config_dir = str(tmp_path)
    directory = tmp_path / "blueprints" / domain
    directory.mkdir(parents=True)
    body = (
        "triggers:\n  - trigger: state\n    entity_id: !input watched\nactions:\n"
        if domain == "automation"
        else "sequence:\n"
    )
    (directory / "synthetic.yaml").write_text(
        f"blueprint:\n  name: Synthetic\n  domain: {domain}\n  input:\n"
        "    watched:\n      default: binary_sensor.watch\n"
        "    destination:\n" + body + "  - action: light.turn_on\n    target: !input destination\n",
        encoding="utf-8",
    )
    instance = {
        "alias": "Blueprint example",
        "use_blueprint": {
            "path": "synthetic.yaml",
            "input": {
                "watched": "input_boolean.enabled",
                "destination": {"entity_id": "light.desk"},
            },
        },
    }
    config = [dict(instance, id="synthetic")] if domain == "automation" else {"example": instance}
    assert await async_setup_component(hass, domain, {domain: config})
    await hass.async_block_till_done()
    entity = next(iter(hass.data[DATA_INSTANCES][domain].entities))
    assert entity.available
    assert entity.referenced_blueprint == "synthetic.yaml"
    assert entity._blueprint_inputs["use_blueprint"] == instance["use_blueprint"]
    assert "use_blueprint" not in entity.raw_config
    sequence = entity.raw_config["actions" if domain == "automation" else "sequence"]
    assert sequence[0]["target"] == {"entity_id": "light.desk"}
    assert "light.desk" in entity.referenced_entities
    if domain == "automation":
        assert entity.raw_config["triggers"][0]["entity_id"] == "input_boolean.enabled"
        assert "input_boolean.enabled" in entity.referenced_entities
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{domain}/config", "entity_id": entity.entity_id})
    response = await client.receive_json()
    assert response["success"]
    assert response["result"]["config"] == entity.raw_config
    with patch.object(type(hass.services), "async_call", side_effect=AssertionError("read only")):
        sources, _, warnings = await collect_snapshot(hass)
        report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "light.desk"})
    assert sources[0].blueprint
    assert report["coverage"]["loaded_blueprints"] == 1
    assert report["coverage"]["warnings"] == []
    assert len(report["references"]) == 1  # Structural + native metadata must not duplicate.
    assert report["references"][0]["confidence"] == "explicit"
    assert "synthetic.yaml" not in str(report)
    assert str(tmp_path) not in str(report)
    assert not any("blueprint" in warning for warning in warnings)


@pytest.mark.parametrize("domain", ["automation", "script"])
async def test_failed_blueprint_keeps_redacted_coverage_warning(hass, tmp_path, domain):
    hass.config.config_dir = str(tmp_path)
    instance = {
        "alias": "Unavailable example",
        "use_blueprint": {"path": "private-path-secret.yaml", "input": {"token": "private-token"}},
    }
    config = [dict(instance, id="unavailable")] if domain == "automation" else {"example": instance}
    assert await async_setup_component(hass, domain, {domain: config})
    await hass.async_block_till_done()
    entity = next(iter(hass.data[DATA_INSTANCES][domain].entities))
    assert not entity.available
    assert entity.referenced_blueprint is None
    assert "use_blueprint" in entity.raw_config
    report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "light.desk"})
    assert any("blueprint expansion unavailable" in w for w in report["coverage"]["warnings"])
    assert "Results are incomplete" in report["markdown"]
    for secret in ("private-path", "private-token", str(tmp_path)):
        assert secret not in str(report)


async def test_selectors_confirm_registry_identity_without_entity_expansion(hass):
    entry = MockConfigEntry(domain="test")
    entry.add_to_hass(hass)
    floor = fr.async_get(hass).async_create("Synthetic floor")
    area = ar.async_get(hass).async_create("Synthetic area", floor_id=floor.floor_id)
    label = lr.async_get(hass).async_create("Synthetic label")
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("test", "synthetic")}
    )
    dr.async_get(hass).async_update_device(device.id, area_id=area.id, labels={label.label_id})
    member = er.async_get(hass).async_get_or_create(
        "light", "test", "unproven_member", device_id=device.id
    )
    selectors = {
        "device_id": device.id,
        "area_id": area.id,
        "floor_id": floor.floor_id,
        "label_id": label.label_id,
    }
    target = {**selectors, "entity_id": "light.explicit"}
    assert await async_setup_component(
        hass,
        "script",
        {
            "script": {
                "selectors": {
                    "sequence": [{"action": "light.turn_on", "target": target}],
                }
            }
        },
    )
    await hass.async_block_till_done()
    entity = next(iter(hass.data[DATA_INSTANCES]["script"].entities))
    assert entity.referenced_devices == {device.id}
    assert entity.referenced_areas == {area.id}
    assert entity.referenced_floors == {floor.floor_id}
    assert entity.referenced_labels == {label.label_id}
    assert entity.referenced_entities == {"light.explicit"}
    with patch.object(type(hass.services), "async_call", side_effect=AssertionError("read only")):
        report = await BlastRadiusCoordinator(hass).request(
            "analyze", {"entity_id": "script.selectors"}
        )
    refs = report["uncertain_references"]
    assert len(refs) == 4
    assert {r["selector"]["kind"] for r in refs} == set(selectors)
    assert all(r["target"] is None and r["selector"]["exists"] is True for r in refs)
    nodes = {n["id"] for n in report["graph"]["nodes"]}
    assert "light.explicit" in nodes
    assert member.entity_id not in nodes
    # Registry deletion changes identity status, never creates or removes entity edges.
    lr.async_get(hass).async_delete(label.label_id)
    after = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "script.selectors"})
    assert (
        next(r for r in after["uncertain_references"] if r["selector"]["kind"] == "label_id")[
            "selector"
        ]["exists"]
        is False
    )


async def test_native_metadata_fills_missing_reference_without_inventing_write_role(hass):
    assert await async_setup_component(
        hass,
        "script",
        {
            "script": {
                "scene_shortcut": {
                    "sequence": [{"scene": "scene.evening"}],
                }
            }
        },
    )
    await hass.async_block_till_done()
    report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "scene.evening"})
    assert len(report["references"]) == 1
    ref = report["references"][0]
    assert ref["path"] == "metadata.referenced_entities"
    assert ref["confidence"] == "unknown"
    assert ref["role"] == "read"
    script = await BlastRadiusCoordinator(hass).request(
        "analyze", {"entity_id": "script.scene_shortcut"}
    )
    assert not any(n["relationship"] == "downstream" for n in script["graph"]["nodes"])


async def test_device_action_registry_uuid_follows_renames_without_config_mutation(hass):
    entry = MockConfigEntry(domain="test")
    entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("test", "registry_example")}
    )
    registry = er.async_get(hass)
    member = registry.async_get_or_create("light", "test", "registry_example", device_id=device.id)
    other = registry.async_get_or_create("light", "test", "not_targeted", device_id=device.id)
    action = {"device_id": device.id, "domain": "light", "type": "turn_on", "entity_id": member.id}
    assert await async_setup_component(
        hass, "script", {"script": {"registry_example": {"sequence": [action]}}}
    )
    await hass.async_block_till_done()
    entity = next(iter(hass.data[DATA_INSTANCES]["script"].entities))
    assert entity.available
    assert entity.raw_config["sequence"][0]["entity_id"] == member.id
    for entity_id in (member.entity_id, "light.renamed_example"):
        if entity_id != member.entity_id:
            registry.async_update_entity(member.entity_id, new_entity_id=entity_id)
            await hass.async_block_till_done()
        with patch.object(
            type(hass.services), "async_call", side_effect=AssertionError("read only")
        ):
            report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": entity_id})
        direct = [r for r in report["references"] if r["path"] == "sequence[0].entity_id"]
        assert len(direct) == 1
        assert direct[0]["target"] == entity_id and direct[0]["confidence"] == "explicit"
        assert direct[0]["reason"] == "Entity registry ID resolved"
        assert other.entity_id not in {n["id"] for n in report["graph"]["nodes"]}
        assert entity.raw_config["sequence"][0]["entity_id"] == member.id
    registry.async_remove("light.renamed_example")
    await hass.async_block_till_done()
    after = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": entity.entity_id})
    assert any(r["reason"] == "Entity registry ID not found" for r in after["uncertain_references"])


@pytest.mark.parametrize(
    "helper",
    [
        "input_boolean",
        "input_number",
        "input_select",
        "input_text",
        "input_datetime",
        "counter",
        "timer",
        "schedule",
    ],
)
async def test_helper_entity_references_need_no_helper_specific_parser(hass, helper):
    entity_id = f"{helper}.example"
    assert await async_setup_component(
        hass,
        "script",
        {
            "script": {
                "helper_user": {
                    "sequence": [
                        {
                            "action": "homeassistant.update_entity",
                            "target": {"entity_id": entity_id},
                        }
                    ],
                }
            }
        },
    )
    await hass.async_block_till_done()
    report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": entity_id})
    assert len(report["references"]) == 1
    assert report["references"][0]["confidence"] == "explicit"


async def test_metadata_failure_and_missing_raw_config_are_redacted(hass):
    from unittest.mock import PropertyMock

    assert await async_setup_component(
        hass,
        "script",
        {
            "script": {
                "example": {
                    "sequence": [
                        {"action": "light.turn_on", "target": {"entity_id": "light.desk"}}
                    ],
                }
            }
        },
    )
    await hass.async_block_till_done()
    entity = next(iter(hass.data[DATA_INSTANCES]["script"].entities))
    with patch.object(
        type(entity),
        "referenced_entities",
        new_callable=PropertyMock,
        side_effect=RuntimeError("private-path-token"),
    ):
        report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "light.desk"})
    assert len(report["references"]) == 1
    assert report["coverage"]["warnings"] == [
        "script.example: native reference metadata unavailable."
    ]
    assert "private-path" not in str(report)
    with patch.object(entity, "raw_config", None):
        report = await BlastRadiusCoordinator(hass).request("analyze", {"entity_id": "light.desk"})
    assert report["coverage"]["warnings"] == ["Configuration unavailable for script.example."]
