"""Compare scene.create semantics with HA's registered native service handler."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest


def test_native_scene_creation_snapshots_without_applying_states(tmp_path, monkeypatch):
    pytest.importorskip("homeassistant")
    from homeassistant.components.homeassistant import scene
    from homeassistant.core import HomeAssistant

    async def run():
        hass = HomeAssistant(str(tmp_path))
        hass.states.async_set("light.snapshot", "off")
        captured = []
        monkeypatch.setattr(
            scene.entity_platform,
            "async_get_current_platform",
            lambda: SimpleNamespace(entities={}),
        )
        reproduce = AsyncMock()
        monkeypatch.setattr(scene, "async_reproduce_state", reproduce)
        await scene.async_setup_platform(hass, {scene.STATES: []}, captured.extend)
        await hass.services.async_call(
            "scene",
            "create",
            {
                "scene_id": "saved",
                "entities": {"light.defined": "on"},
                "snapshot_entities": ["light.snapshot", "light.stale"],
            },
            blocking=True,
        )
        assert len(captured) == 1
        assert captured[0].scene_config.states["light.defined"].state == "on"
        assert captured[0].scene_config.states["light.snapshot"].state == "off"
        assert "light.stale" not in captured[0].scene_config.states
        reproduce.assert_not_awaited()
        assert hass.states.get("light.snapshot").state == "off"
        assert hass.states.get("light.defined") is None

    asyncio.run(run())
