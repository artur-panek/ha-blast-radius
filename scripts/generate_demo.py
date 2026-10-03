"""Generate synthetic demo reports with the real engine (no HA installation needed)."""

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "custom_components/blast_radius/analysis"
spec = importlib.util.spec_from_file_location(
    "br_analysis", ENGINE / "__init__.py", submodule_search_locations=[str(ENGINE)]
)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules["br_analysis"] = module
spec.loader.exec_module(module)

from br_analysis.analyzer import Analyzer, markdown_report  # noqa: E402
from br_analysis.models import Source  # noqa: E402

data = json.loads((ROOT / "tests/fixtures/music.json").read_text())
sources = tuple(Source(**source) for source in data)
entities = {s.source_id for s in sources if s.source_type != "dashboard"} | {
    "binary_sensor.wall_button",
    "media_player.speaker",
    "media_player.tablet",
    "input_boolean.music_enabled",
    "light.desk",
    "sensor.unused",
}
engine = Analyzer(sources, entities, ("Synthetic demo snapshot. No Home Assistant connection.",))
reports = {}
for entity in sorted(entities | {"light.removed"}):
    for depth in (1, 2, 3, 4, 6, 8, 12):
        report = engine.analyze(entity, depth)
        report["snapshot_at"] = "2026-10-03T12:00:00+00:00"
        report["markdown"] = markdown_report(report)
        reports[f"{entity}:{depth}"] = report
output = {
    "entities": [
        {"entity_id": entity, "name": entity.replace("_", " "), "exists": True}
        for entity in sorted(entities)
    ],
    "reports": reports,
}
(ROOT / "frontend/src/demo-data.json").write_text(json.dumps(output, indent=2) + "\n")
print("Generated demo reports from synthetic fixtures")
