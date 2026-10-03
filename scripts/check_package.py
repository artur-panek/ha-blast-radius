"""Check installable layout and reject accidental mutation APIs in runtime code."""

import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / "custom_components/blast_radius"
manifest = json.loads((COMPONENT / "manifest.json").read_text())
assert manifest["version"] == "0.1.1"
assert manifest["config_flow"] is True
assert json.loads((ROOT / "hacs.json").read_text())["homeassistant"] == "2026.9.4"
assert (COMPONENT / "frontend/blast-radius.js").stat().st_size > 1000
assert [
    p.name
    for p in (ROOT / "custom_components").iterdir()
    if p.is_dir() and not p.name.startswith("__")
] == ["blast_radius"]
assert json.loads((COMPONENT / "strings.json").read_text()) == json.loads(
    (COMPONENT / "translations/en.json").read_text()
)
for path in COMPONENT.rglob("*.py"):
    tree = ast.parse(path.read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            assert node.func.attr not in {
                "async_call",
                "async_save",
                "async_update_entity",
                "async_remove",
                "async_render",
                "write_text",
                "write_bytes",
            }, path
for path in ("README.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md", "CHANGELOG.md"):
    assert (ROOT / path).is_file(), path
print("Installable layout, metadata, frontend and read-only API checks passed")
