"""scene.create stores definitions and snapshots; it does not apply the scene."""

import pytest
from br_analysis.analyzer import Analyzer
from br_analysis.models import Confidence, Role, Source
from br_analysis.references import scan_sources


def action(data):
    return {"action": "scene.create", "data": data}


@pytest.mark.parametrize("known", [set(), {"light.defined", "light.snapshot"}])
def test_scene_create_records_definitions_and_snapshot_reads_without_effects(known):
    source = Source(
        "script.snapshot",
        "script",
        "Snapshot",
        {
            "sequence": [
                action(
                    {
                        "scene_id": "saved",
                        "entities": {
                            "light.defined": {
                                "state": "on",
                                "friendly_name": "light.not_a_reference",
                            }
                        },
                        "snapshot_entities": ["light.snapshot"],
                    }
                )
            ]
        },
    )
    refs = scan_sources((source,), known).references
    assert {(ref.target, ref.role) for ref in refs} == {
        ("light.defined", Role.DEFINITION),
        ("light.snapshot", Role.READ),
    }
    assert all(ref.confidence is Confidence.EXPLICIT for ref in refs)
    report = Analyzer((source,), known).analyze(source.source_id)
    assert {node["id"] for node in report["graph"]["nodes"]} == {source.source_id}


def test_nested_native_and_dashboard_actions_keep_snapshot_semantics():
    native = Source(
        "script.nested",
        "script",
        "Nested",
        {
            "sequence": [
                {
                    "choose": [
                        {
                            "conditions": [],
                            "sequence": [action({"snapshot_entities": "light.stale"})],
                        }
                    ]
                }
            ]
        },
    )
    dashboard = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "type": "button",
                            "tap_action": {
                                "action": "perform-action",
                                "perform_action": "scene.create",
                                "data": {"snapshot_entities": ["light.desk"]},
                            },
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((native, dashboard), set()).references
    assert {(ref.target, ref.role) for ref in refs} == {
        ("light.stale", Role.READ),
        ("light.desk", Role.READ),
    }


def test_templated_snapshot_entities_keep_reads_and_uncertainty():
    source = Source(
        "script.snapshot",
        "script",
        "Snapshot",
        {"sequence": [action({"snapshot_entities": "{{ states('sensor.choice') }}"})]},
    )
    refs = scan_sources((source,), set()).references
    assert any(ref.target == "sensor.choice" and ref.role is Role.READ for ref in refs)
    assert any(ref.target is None and ref.confidence is Confidence.DYNAMIC for ref in refs)
    assert all(ref.role is Role.READ for ref in refs)


def test_scene_activation_still_has_write_effects():
    source = Source(
        "script.apply",
        "script",
        "Apply",
        {
            "sequence": [
                {"action": "scene.turn_on", "target": {"entity_id": "scene.saved"}},
                {"action": "scene.apply", "data": {"entities": {"light.desk": "on"}}},
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert {(ref.target, ref.role) for ref in refs} == {
        ("scene.saved", Role.WRITE),
        ("light.desk", Role.WRITE),
    }
