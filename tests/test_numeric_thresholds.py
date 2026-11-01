"""Numeric-state thresholds are state reads, including missing entity IDs."""

import json
from pathlib import Path

import pytest
from br_analysis.analyzer import Analyzer
from br_analysis.models import Confidence, Role, Source
from br_analysis.references import scan_sources


@pytest.mark.parametrize("known", [False, True])
def test_threshold_locations_survive_delete_and_rename_previews(known):
    data = json.loads((Path(__file__).parent / "fixtures/numeric_thresholds.json").read_text())
    sources = tuple(Source(**source) for source in data)
    engine = Analyzer(sources, {"input_number.limit"} if known else set())
    for operation, replacement in [("delete", None), ("rename", "input_number.new_limit")]:
        report = engine.preview("input_number.limit", operation, replacement)
        assert report["exists"] is known
        assert {ref["path"] for ref in report["references"]} == {
            "triggers[0].below",
            "conditions[0].above",
            "sequence[0].if[0].above",
        }
        assert all(
            ref["role"] == "read" and ref["confidence"] == "explicit"
            for ref in report["references"]
        )
    # The threshold is not an action target of either configuration.
    for source in sources:
        graph = engine.analyze(source.source_id)["graph"]
        assert "input_number.limit" not in {node["id"] for node in graph["nodes"]}


@pytest.mark.parametrize("domain", ["input_number", "number", "sensor", "zone"])
@pytest.mark.parametrize("bound", ["above", "below"])
@pytest.mark.parametrize("discriminator", ["trigger", "platform", "condition"])
def test_native_numeric_threshold_domains(domain, bound, discriminator):
    node = {
        discriminator: "numeric_state",
        "entity_id": "sensor.temperature",
        bound: f"{domain}.limit",
    }
    config = {"conditions" if discriminator == "condition" else "triggers": [node]}
    source = Source("automation.test", "automation", "Test", config)
    refs = scan_sources((source,), set()).references
    threshold = next(ref for ref in refs if ref.target == f"{domain}.limit")
    assert threshold.confidence == Confidence.EXPLICIT
    assert threshold.role == Role.READ


@pytest.mark.parametrize(
    "config,path",
    [
        (
            {"sequence": [{"condition": "numeric_state", "above": "sensor.limit"}]},
            "sequence[0].above",
        ),
        (
            {
                "sequence": [
                    {"wait_for_trigger": [{"trigger": "numeric_state", "above": "sensor.limit"}]}
                ]
            },
            "sequence[0].wait_for_trigger[0].above",
        ),
        (
            {
                "sequence": [
                    {
                        "repeat": {
                            "while": [{"condition": "numeric_state", "below": "sensor.limit"}],
                            "sequence": [],
                        }
                    }
                ]
            },
            "sequence[0].repeat.while[0].below",
        ),
    ],
)
def test_nested_thresholds_are_reads_without_duplicate_native_metadata(config, path):
    source = Source(
        "script.test", "script", "Test", config, native_entities=frozenset({"sensor.limit"})
    )
    refs = scan_sources((source,), set()).references
    assert len(refs) == 1
    assert refs[0].path == path
    assert refs[0].confidence == Confidence.EXPLICIT and refs[0].role == Role.READ


@pytest.mark.parametrize("value", [0, -2.5, "2.5", "1e3"])
def test_numeric_threshold_values_do_not_become_references(value):
    source = Source(
        "script.test",
        "script",
        "Test",
        {"sequence": [{"condition": "numeric_state", "above": value}]},
    )
    assert scan_sources((source,), set()).references == ()


@pytest.mark.parametrize("wrapper", ["variables", "data", "event_data"])
def test_threshold_shaped_payloads_do_not_acquire_native_semantics(wrapper):
    source = Source(
        "script.test",
        "script",
        "Test",
        {"sequence": [{wrapper: {"condition": "numeric_state", "above": "sensor.limit"}}]},
    )
    assert scan_sources((source,), set()).references == ()
    refs = scan_sources((source,), {"sensor.limit"}).references
    assert len(refs) == 1
    assert refs[0].confidence == Confidence.UNKNOWN and refs[0].role == Role.READ


def test_dashboard_numeric_conditions_do_not_gain_automation_semantics():
    source = Source(
        "dashboard.test",
        "dashboard",
        "Test",
        {
            "views": [
                {
                    "cards": [
                        {
                            "type": "conditional",
                            "conditions": [
                                {
                                    "condition": "numeric_state",
                                    "entity": "sensor.temperature",
                                    "above": "sensor.limit",
                                }
                            ],
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert [ref.target for ref in refs] == ["sensor.temperature"]


def test_non_numeric_condition_does_not_interpret_threshold_fields():
    source = Source(
        "script.test",
        "script",
        "Test",
        {"sequence": [{"condition": "state", "above": "sensor.limit"}]},
    )
    assert scan_sources((source,), set()).references == ()
