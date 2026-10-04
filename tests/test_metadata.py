"""Native metadata is supplementary; selectors never generate entity edges."""

from br_analysis.analyzer import Analyzer
from br_analysis.models import Confidence, Role, Source


def test_native_dedup_preserves_locations_and_supplements_only_missing_targets():
    source = Source(
        "script.test",
        "script",
        "Test",
        {
            "sequence": [
                {"target": {"entity_id": "light.desk"}},
                {"target": {"entity_id": "light.desk"}},
            ]
        },
        native_entities=frozenset({"light.desk", "scene.evening", "all", "private/path"}),
    )
    engine = Analyzer((source,), set())
    assert len(engine.references) == 3
    extras = [r for r in engine.references if r.target == "scene.evening"]
    assert len(extras) == 1
    assert extras[0].confidence == Confidence.UNKNOWN and extras[0].role == Role.READ
    assert all(
        r.target != "scene.evening"
        for r in engine.graph.outgoing.get("script.test", [])
        if r.role == Role.WRITE
    )


def test_native_selectors_are_deduplicated_and_do_not_expand_registry():
    source = Source(
        "script.test",
        "script",
        "Test",
        {
            "sequence": [{"target": {"area_id": ["office"], "entity_id": "light.explicit"}}],
        },
        native_selectors=frozenset({("area_id", "office"), ("floor_id", "upper")}),
        selector_registry=frozenset({("area_id", "office")}),
    )
    engine = Analyzer((source,), {"light.unproven"})
    report = engine.analyze("script.test")
    refs = report["uncertain_references"]
    assert len(refs) == 2
    assert {r["selector"]["exists"] for r in refs} == {True, False}
    assert {n["id"] for n in report["graph"]["nodes"]} == {"script.test", "light.explicit"}


def test_dynamic_selector_literals_are_reads_and_never_registry_ids():
    source = Source(
        "script.test",
        "script",
        "Test",
        {
            "sequence": [
                {
                    "target": {
                        "area_id": "{{ states('input_text.area') }}",
                        "label_id": "{{ 'fixed' }}",
                    }
                }
            ]
        },
    )
    engine = Analyzer((source,), set())
    assert len(engine.references) == 3
    assert all(r.selector is None for r in engine.references)
    assert engine.analyze("script.test")["summary"]["downstream"] == 0


def test_plain_selector_without_registry_retains_unknown_presence():
    engine = Analyzer((Source("script.a", "script", "A", {"target": {"device_id": "abc"}}),), set())
    ref = engine.analyze("script.a")["uncertain_references"][0]
    assert ref["selector"] == {"kind": "device_id", "value": "abc", "exists": None}


def test_non_identifier_selector_text_is_not_exported():
    source = Source("script.a", "script", "A", {"target": {"area_id": "/private/path/token"}})
    report = Analyzer((source,), set()).analyze("script.a")
    assert len(report["uncertain_references"]) == 1
    assert "selector" not in report["uncertain_references"][0]
    assert "/private/path" not in str(report)


def test_loaded_configuration_root_does_not_look_like_a_missing_entity():
    report = Analyzer((Source("dashboard.home", "dashboard", "Home", {}),), set()).analyze(
        "dashboard.home"
    )
    assert report["exists"]
    assert not report["warnings"]
