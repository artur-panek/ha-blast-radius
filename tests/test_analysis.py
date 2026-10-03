import copy
import json
from pathlib import Path

import pytest
from br_analysis.analyzer import Analyzer, markdown_report
from br_analysis.graph import DependencyGraph
from br_analysis.models import Confidence, Reference, Role, Source
from br_analysis.references import scan_sources
from br_analysis.templates import inspect_template


@pytest.fixture
def analyzer():
    data = json.loads((Path(__file__).parent / "fixtures/music.json").read_text())
    sources = tuple(Source(**source) for source in data)
    return Analyzer(
        sources,
        {s.source_id for s in sources}
        | {
            "binary_sensor.wall_button",
            "media_player.speaker",
            "media_player.tablet",
            "input_boolean.music_enabled",
            "light.desk",
        },
    )


def test_direct_reference_paths_and_confidence(analyzer):
    report = analyzer.analyze("binary_sensor.wall_button")
    assert report["summary"]["references"] == 3
    assert report["summary"]["explicit"] == 2
    assert report["summary"]["template_literal"] == 1
    assert {r["path"] for r in report["references"]} == {
        "triggers[0].entity_id",
        "triggers[0].value_template",
        "views[0].cards[0].entities[1].entity",
    }


def test_recursive_actions_do_not_pull_in_unrelated_readers(analyzer):
    graph = analyzer.analyze("binary_sensor.wall_button")["graph"]
    nodes = {node["id"]: node for node in graph["nodes"]}
    assert nodes["script.music_toggle"]["depth"] == 2
    assert nodes["media_player.speaker"]["depth"] == 3
    assert "scene.evening" not in nodes  # Reads speaker, but not dependent on the button.
    assert "input_boolean.music_enabled" not in nodes  # A condition, not a downstream target.


def test_array_nested_script_and_scene_references(analyzer):
    refs = analyzer.analyze("media_player.speaker")["references"]
    assert any(r["path"] == "entities.media_player.speaker" for r in refs)
    assert any(r["path"] == "sequence[0].choose[0].sequence[0].target.entity_id[0]" for r in refs)
    assert not any(r.target == "media_player.media_pause" for r in analyzer.references)


@pytest.mark.parametrize(
    "template,target",
    [
        ("{{ states('sensor.foo') }}", "sensor.foo"),
        ("{{ state_attr('climate.room', 'temperature') }}", "climate.room"),
        ("{{ is_state('binary_sensor.window', 'on') }}", "binary_sensor.window"),
        ("{{ states.sensor.foo.state }}", "sensor.foo"),
        ("{{ states['sensor.foo'].state }}", "sensor.foo"),
        ("{{ expand('group.lights') }}", "group.lights"),
    ],
)
def test_template_literals(template, target):
    assert target in inspect_template(template).literals


@pytest.mark.parametrize(
    "template",
    [
        "{{ states('light.' ~ room) }}",
        "{{ states(entity) }}",
        "{{ states.sensor | list }}",
        "{{ expand(area_entities('office')) }}",
        "{{ this.state }}",
        "{{ malformed(",
    ],
)
def test_dynamic_templates_not_guessed(template):
    assert inspect_template(template).dynamic
    assert "light.room" not in inspect_template(template).literals


def test_comments_and_urls_do_not_make_fake_references():
    result = inspect_template("{# states('sensor.ignored') #} {{ states('sensor.real') }}")
    assert result.literals == ("sensor.real",)
    source = Source(
        "automation.test",
        "automation",
        "Test",
        {
            "alias": "sensor.foo",
            "url": "https://sensor.foo/path",
            "description": "sensor.foo",
            "unknown": "sensor.foo",
        },
    )
    scan = scan_sources((source,), {"sensor.foo"})
    assert len(scan.references) == 1
    assert scan.references[0].confidence == Confidence.UNKNOWN


def test_cycles_and_duplicates():
    refs = (
        Reference(
            "script.a", "script", "script.b", "sequence[0].action", Confidence.EXPLICIT, Role.CALL
        ),
        Reference(
            "script.b", "script", "script.a", "sequence[0].action", Confidence.EXPLICIT, Role.CALL
        ),
    )
    graph = DependencyGraph(refs + refs).impact("script.a")
    assert len(graph["edges"]) == 2
    assert len(graph["nodes"]) == 2
    assert graph["cycles"] == [["script.a", "script.b", "script.a"]]


def test_depth_limit(analyzer):
    graph = analyzer.analyze("binary_sensor.wall_button", 1)["graph"]
    assert graph["truncated"]
    assert all(n["depth"] <= 1 for n in graph["nodes"])
    with pytest.raises(ValueError):
        analyzer.analyze("light.desk", 0)


def test_rename_and_delete_never_mutate(analyzer):
    original = copy.deepcopy(analyzer.sources)
    before = analyzer.analyze("binary_sensor.wall_button")
    rename = analyzer.preview("binary_sensor.wall_button", "rename", "binary_sensor.music_button")
    delete = analyzer.preview("binary_sensor.wall_button", "delete")
    assert rename["preview"]["changes_applied"] is False
    assert delete["preview"]["affected_sources"] == {"automation": 2, "dashboard": 1}
    assert analyzer.sources == original
    assert analyzer.analyze("binary_sensor.wall_button") == before
    assert rename["references"] == delete["references"]


@pytest.mark.parametrize(
    "operation,replacement",
    [
        ("rename", None),
        ("rename", "invalid"),
        ("rename", "light.desk"),
        ("rename", "binary_sensor.wall_button"),
        ("delete", "sensor.foo"),
        ("execute", None),
    ],
)
def test_invalid_previews(analyzer, operation, replacement):
    with pytest.raises(ValueError):
        analyzer.preview("binary_sensor.wall_button", operation, replacement)


def test_collision(analyzer):
    with pytest.raises(ValueError, match="already exists"):
        analyzer.preview("media_player.tablet", "rename", "media_player.speaker")


def test_missing_entity_still_reports_stale_references():
    analyzer = Analyzer(
        (
            Source(
                "script.test",
                "script",
                "Test",
                {"sequence": [{"action": "light.turn_on", "target": {"entity_id": "light.old"}}]},
            ),
        ),
        set(),
    )
    report = analyzer.analyze("light.old")
    assert not report["exists"]
    assert len(report["references"]) == 1
    assert report["warnings"]
    with pytest.raises(ValueError):
        analyzer.analyze("invalid")


def test_unresolved_are_not_attached_to_every_entity(analyzer):
    relevant = analyzer.analyze("binary_sensor.wall_button")
    unrelated = analyzer.analyze("light.desk")
    assert relevant["unresolved_total"] == unrelated["unresolved_total"] == 1
    assert len(relevant["uncertain_references"]) == 1
    assert unrelated["uncertain_references"] == []


def test_multiple_paths_preserved_but_identical_sources_deduplicated():
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
    )
    assert len(scan_sources((source, source), set()).references) == 2


def test_target_expansion_is_uncertain():
    source = Source(
        "script.test",
        "script",
        "Test",
        {
            "sequence": [
                {
                    "target": {
                        "entity_id": "light.a, light.b",
                        "area_id": "office",
                        "device_id": ["device"],
                    }
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert {r.target for r in refs} == {"light.a", "light.b", None}
    assert len([r for r in refs if r.confidence == Confidence.DYNAMIC]) == 2


def test_exports_and_empty_state(analyzer):
    markdown = markdown_report(analyzer.preview("binary_sensor.wall_button", "delete"))
    assert "triggers[0].entity_id" in markdown
    assert "No changes" in markdown
    assert "room" not in markdown  # Never export raw template text.
    empty = markdown_report(analyzer.analyze("light.unused"))
    assert "not a guarantee" in empty


def test_limits_produce_coverage_warnings(monkeypatch):
    import br_analysis.references as references

    monkeypatch.setattr(references, "MAX_REFERENCES", 1)
    source = Source("script.test", "script", "Test", {"entities": ["light.a", "light.b"]})
    scan = scan_sources((source,), set())
    assert len(scan.references) == 1
    assert scan.warnings
    monkeypatch.setattr(references, "MAX_REFERENCES", 50_000)
    monkeypatch.setattr(references, "MAX_NESTING", 1)
    assert scan_sources((source,), set()).warnings


def test_template_reads_in_action_data_are_not_downstream_writes():
    source = Source(
        "script.notify",
        "script",
        "Notify",
        {
            "sequence": [
                {
                    "action": "notify.send_message",
                    "data": {"message": "{{ states('sensor.temperature') }}"},
                    "target": {"entity_id": "{{ states('input_text.notification_target') }}"},
                }
            ]
        },
    )
    analyzer = Analyzer((source,), {"sensor.temperature", "input_text.notification_target"})
    assert analyzer.analyze("script.notify")["summary"]["downstream"] == 0
    assert len(analyzer.analyze("sensor.temperature")["references"]) == 1
    assert all(ref.role == Role.READ for ref in analyzer.references if ref.target)
