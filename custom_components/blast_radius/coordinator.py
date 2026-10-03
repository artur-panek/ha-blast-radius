"""Serialize on-demand snapshots; run analysis outside HA's event loop."""

import asyncio
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

from .adapter import collect_snapshot
from .analysis.analyzer import Analyzer, markdown_report


class BlastRadiusCoordinator:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.lock = asyncio.Lock()
        self.last_summary: dict[str, Any] = {}

    async def request(self, operation: str, message: dict[str, Any]) -> dict[str, Any]:
        async with self.lock:
            sources, names, warnings = await collect_snapshot(self.hass)
            timestamp = datetime.now(UTC).isoformat()

            def analyze() -> dict[str, Any]:
                engine = Analyzer(sources, set(names), warnings)
                if operation == "entities":
                    # Include stale references so removed entities remain discoverable.
                    targets = {r.target for r in engine.references if r.target}
                    return {
                        "entities": [
                            {"entity_id": eid, "name": names.get(eid, eid), "exists": eid in names}
                            for eid in sorted(set(names) | targets)
                        ],
                        "warnings": list(engine.warnings),
                        "snapshot_at": timestamp,
                    }
                args = (message["entity_id"], message.get("max_depth", 6))
                if operation == "preview":
                    report = engine.preview(
                        args[0], message["operation"], message.get("new_entity_id"), args[1]
                    )
                else:
                    report = engine.analyze(*args)
                report["snapshot_at"] = timestamp
                report["markdown"] = markdown_report(report)
                return report

            result = await self.hass.async_add_executor_job(analyze)
            self.last_summary = {
                "snapshot_at": timestamp,
                "source_count": len(sources),
                "entity_count": len(names),
                "warning_count": len(result.get("warnings", warnings)),
            }
            return result
