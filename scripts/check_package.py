"""Check installable layout and reject accidental mutation APIs in runtime code."""

import ast
import json
import re
import struct
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / "custom_components/blast_radius"
manifest = json.loads((COMPONENT / "manifest.json").read_text())
version = manifest["version"]
assert re.fullmatch(r"\d+\.\d+\.\d+", version), "Use a three-part integration version"
assert tomllib.loads((ROOT / "pyproject.toml").read_text())["project"]["version"] == version
assert json.loads((ROOT / "frontend/package.json").read_text())["version"] == version
lockfile = json.loads((ROOT / "frontend/package-lock.json").read_text())
assert lockfile["version"] == lockfile["packages"][""]["version"] == version
constants = ast.parse((COMPONENT / "const.py").read_text())
assert any(
    isinstance(node, ast.Assign)
    and any(isinstance(target, ast.Name) and target.id == "VERSION" for target in node.targets)
    and ast.literal_eval(node.value) == version
    for node in constants.body
), "The integration version and frontend cache key must agree"
assert manifest["config_flow"] is True
assert manifest["single_config_entry"] is True
assert manifest["iot_class"] == "calculated"
hacs = json.loads((ROOT / "hacs.json").read_text())
assert hacs["homeassistant"] == "2026.9.4"
assert hacs["render_readme"] is True
assert hacs["hide_default_branch"] is True
assert (COMPONENT / "frontend/blast-radius.js").stat().st_size > 1000
assert (COMPONENT / "frontend/blast-radius-icons.js").is_file()
for prefix in ("", "dark_"):
    for suffix, size in (("", 256), ("@2x", 512)):
        image = (COMPONENT / f"brand/{prefix}icon{suffix}.png").read_bytes()
        assert image[:8] == b"\x89PNG\r\n\x1a\n"
        assert struct.unpack(">II", image[16:24]) == (size, size)
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
print("Package layout, version consistency, brand images and mutation-call guard passed")
