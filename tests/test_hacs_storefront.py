"""Keep the HACS product page separate from the full developer README."""

import json
from pathlib import Path


def test_hacs_details_use_a_short_information_page():
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "hacs.json").read_text(encoding="utf-8"))
    info = (root / "info.md").read_text(encoding="utf-8")

    assert manifest["render_readme"] is False
    assert "read-only" in info.lower()
    assert "configuration" in info.lower()
    assert "https://github.com/artur-panek/ha-blast-radius" in info
    assert "2026.9.4" in info
