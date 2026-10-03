"""Load the engine independently from the integration's HA entry point."""

import importlib.util
import sys
from pathlib import Path

ENGINE = Path(__file__).parents[1] / "custom_components/blast_radius/analysis"
spec = importlib.util.spec_from_file_location(
    "br_analysis", ENGINE / "__init__.py", submodule_search_locations=[str(ENGINE)]
)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules["br_analysis"] = module
spec.loader.exec_module(module)
