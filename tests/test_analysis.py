import copy
import json
from pathlib import Path

import pytest
from br_analysis.analyzer import Analyzer, markdown_report
from br_analysis.graph import MAX_EDGES, MAX_NODES, DependencyGraph
from br_analysis.models import BASE_COVERAGE_NOTE, Confidence, Reference, Role, Source
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


@pytest.fixture
def dashboard_analyzer():
    data = json.loads((Path(__file__).parent / "fixtures/dashboard_actions.json").read_text())
    sources = tuple(Source(**source) for source in data)
    return Analyzer(
        sources,
        {s.source_id for s in sources}
        | {"light.kitchen", "binary_sensor.kitchen_presence", "button.computer_power"},
    )


def test_shared_dashboard_does_not_connect_unrelated_card_actions(dashboard_analyzer):
    report = dashboard_analyzer.preview("light.kitchen", "delete", max_depth=12)
    assert {node["id"] for node in report["graph"]["nodes"]} == {
        "light.kitchen",
        "automation.kitchen",
        "dashboard.home",
    }
    assert report["summary"]["downstream"] == 0
    assert report["preview"]["affected_sources"] == {"automation": 1, "dashboard": 1}
    assert {ref["path"] for ref in report["references"]} == {
        "actions[0].target.entity_id",
        "views[0].cards[0].entity",
        "views[0].cards[1].entity",
    }
    assert all(ref["target"] == "light.kitchen" for ref in report["graph"]["edges"])
    assert not report["graph"]["truncated"]


def test_dashboard_script_reference_and_script_effects_remain_visible(dashboard_analyzer):
    report = dashboard_analyzer.analyze("script.power_off")
    nodes = {node["id"]: node for node in report["graph"]["nodes"]}
    assert set(nodes) == {"script.power_off", "dashboard.home", "button.computer_power"}
    assert nodes["button.computer_power"]["relationship"] == "downstream"
    assert report["references"][0]["path"] == "views[1].cards[0].tap_action.service"
    assert report["references"][0]["role"] == Role.CALL


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
    report = analyzer.analyze("binary_sensor.wall_button", 1)
    graph = report["graph"]
    assert graph["truncated"]
    assert graph["limits_reached"] == ["depth"]
    assert "Results are incomplete" in markdown_report(report)
    assert "depth limit (1)" in markdown_report(report)
    assert all(n["depth"] <= 1 for n in graph["nodes"])
    with pytest.raises(ValueError):
        analyzer.analyze("light.desk", 0)


@pytest.mark.parametrize("limit", ["nodes", "edges"])
@pytest.mark.parametrize("overflow", [0, 1])
def test_graph_size_limits_distinguish_exact_boundary_from_omitted_links(limit, overflow):
    count = (MAX_NODES - 1 if limit == "nodes" else MAX_EDGES) + overflow
    source = Source(
        "script.large",
        "script",
        "Large synthetic script",
        {
            "sequence": [
                {
                    "target": {
                        "entity_id": [
                            f"light.target_{index if limit == 'nodes' else 0}"
                            for index in range(count)
                        ]
                    }
                }
            ]
        },
    )
    report = Analyzer((source,), {source.source_id}).analyze(source.source_id, 1)
    graph = report["graph"]
    assert graph["truncated"] == bool(overflow)
    assert graph["limits_reached"] == ([limit] if overflow else [])
    assert len(graph["nodes"]) <= MAX_NODES
    assert len(graph["edges"]) <= MAX_EDGES
    exported = markdown_report(report)
    assert ("Results are incomplete" in exported) == bool(overflow)
    if overflow:
        assert ("node limit (500)" if limit == "nodes" else "edge limit (2000)") in exported


def test_coverage_gaps_remain_separate_from_routine_static_analysis_note():
    warning = "dashboard.broken: configuration unavailable or generated automatically."
    complete = Analyzer((), {"light.desk"}, (BASE_COVERAGE_NOTE,)).analyze("light.desk")
    partial = Analyzer((), {"light.desk"}, (BASE_COVERAGE_NOTE, warning)).preview(
        "light.desk", "delete"
    )
    assert not complete["coverage"]["warnings"]
    assert "Results are incomplete" not in markdown_report(complete)
    assert partial["coverage"]["warnings"] == [warning]
    assert BASE_COVERAGE_NOTE in partial["warnings"]
    assert not partial["graph"]["truncated"]
    assert "Results are incomplete" in markdown_report(partial)
    assert warning in markdown_report(partial)


def test_scanner_limit_is_a_coverage_gap_even_without_graph_truncation(monkeypatch):
    monkeypatch.setattr("br_analysis.references.MAX_REFERENCES", 1)
    source = Source("scene.test", "scene", "Test", {"entity_id": ["light.a", "light.b"]})
    report = Analyzer((source,), {"light.b"}).analyze("light.b")
    assert not report["references"]
    assert not report["graph"]["truncated"]
    assert report["coverage"]["warnings"] == ["Reference limit reached; analysis is incomplete."]
    assert "Results are incomplete" in markdown_report(report)


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


@pytest.mark.parametrize(
    "template",
    [
        "{{ 'red' }}",
        "{{ 1 + 2 }}",
        "{# a comment #}",
        "{% if true %}red{% else %}blue{% endif %}",
        "{{ states('sensor.temperature') | float(0) | round(1) }}",
        "{{ states['sensor.temperature'].state }}",
    ],
)
def test_resolved_templates_do_not_invent_dynamic_dependencies(template):
    assert not inspect_template(template).dynamic


@pytest.mark.parametrize("key", ["entity_id", "action", "service"])
def test_templated_targets_remain_unresolved_without_rendering(key):
    source = Source(
        "script.test", "script", "Test", {"sequence": [{key: "{{ states('input_text.target') }}"}]}
    )
    refs = scan_sources((source,), {"input_text.target"}).references
    assert any(ref.target == "input_text.target" and ref.role == Role.READ for ref in refs)
    assert any(ref.target is None and ref.confidence == Confidence.DYNAMIC for ref in refs)


def test_graph_expands_shortest_path_before_longer_dependent_path():
    def ref(source, target, role):
        return Reference(source, source.split(".")[0], target, "test", Confidence.EXPLICIT, role)

    graph = DependencyGraph(
        (
            ref("automation.z", "sensor.root", Role.READ),
            ref("script.a", "automation.z", Role.READ),
            ref("script.b", "script.a", Role.READ),
            ref("script.c", "script.b", Role.READ),
            ref("automation.z", "script.c", Role.CALL),
            ref("script.c", "script.effect", Role.CALL),
            ref("script.effect", "fan.office", Role.WRITE),
        )
    ).impact("sensor.root", 4)
    nodes = {node["id"]: node for node in graph["nodes"]}
    assert nodes["script.effect"]["depth"] == 3
    assert nodes["fan.office"]["depth"] == 4
    assert not graph["truncated"]
    assert not graph["limits_reached"]


def test_closed_cycle_at_depth_limit_is_not_incomplete():
    graph = DependencyGraph(
        tuple(
            Reference(a, "script", b, "sequence[0].action", Confidence.EXPLICIT, Role.CALL)
            for a, b in [("script.a", "script.b"), ("script.b", "script.a")]
        )
    ).impact("script.a", 1)
    assert len(graph["edges"]) == 2
    assert graph["cycles"]
    assert not graph["truncated"]


def test_local_variables_are_not_downstream_action_targets():
    source = Source(
        "script.test",
        "script",
        "Test",
        {"sequence": [{"variables": {"entity_id": "light.office"}}]},
    )
    report = Analyzer((source,), {"light.office"}).analyze("script.test")
    assert report["summary"]["downstream"] == 0


def test_deep_template_cannot_abort_other_reference_discovery():
    source = Source(
        "script.test",
        "script",
        "Test",
        {
            "sequence": [
                {"value": "{{ " + "(" * 1500 + "0" + ")" * 1500 + " }}"},
                {"target": {"entity_id": "light.office"}},
            ]
        },
    )
    refs = scan_sources((source,), {"light.office"}).references
    assert any(ref.target == "light.office" for ref in refs)
    assert any(ref.target is None for ref in refs)


@pytest.mark.parametrize("reverse", [False, True])
def test_graph_prefers_explicit_reference_for_a_source_with_mixed_fields(reverse):
    actions = [
        {"data": {"lights": ["light.example"]}},
        {"target": {"entity_id": "light.example"}},
    ]
    if reverse:
        actions.reverse()
    source = Source("automation.example", "automation", "Example", {"actions": actions})
    report = Analyzer((source,), {"light.example"}).analyze("light.example")
    node = next(n for n in report["graph"]["nodes"] if n["id"] == source.source_id)
    assert node["confidence"] == Confidence.EXPLICIT
    assert node["path"].endswith("target.entity_id")
    assert node["via"] == "light.example"
    assert len(report["graph"]["edges"]) == len(report["references"]) == 2


@pytest.mark.parametrize("reverse", [False, True])
@pytest.mark.parametrize(
    ("weaker", "stronger"),
    [
        (Confidence.UNKNOWN, Confidence.TEMPLATE_LITERAL),
        (Confidence.TEMPLATE_LITERAL, Confidence.EXPLICIT),
    ],
)
def test_graph_prefers_stronger_reference_without_losing_alternative_edges(
    reverse, weaker, stronger
):
    refs = [
        Reference("script.a", "script", "sensor.root", "weaker", weaker, Role.READ),
        Reference("script.a", "script", "sensor.root", "stronger", stronger, Role.READ),
    ]
    graph = DependencyGraph(tuple(reversed(refs) if reverse else refs)).impact("sensor.root")
    node = next(n for n in graph["nodes"] if n["id"] == "script.a")
    assert (node["confidence"], node["path"], node["depth"]) == (stronger, "stronger", 1)
    assert len(graph["edges"]) == 2


def test_graph_upgrades_path_and_predecessor_together_at_equal_depth():
    refs = (
        Reference("script.a", "script", "sensor.root", "root.a", Confidence.EXPLICIT, Role.READ),
        Reference("script.b", "script", "sensor.root", "root.b", Confidence.EXPLICIT, Role.READ),
        Reference("script.c", "script", "script.a", "weak", Confidence.UNKNOWN, Role.READ),
        Reference("script.c", "script", "script.b", "strong", Confidence.EXPLICIT, Role.READ),
    )
    graph = DependencyGraph(refs).impact("sensor.root")
    node = next(n for n in graph["nodes"] if n["id"] == "script.c")
    assert (node["via"], node["path"], node["depth"]) == ("script.b", "strong", 2)
    assert node["confidence"] == Confidence.EXPLICIT
    assert len(graph["edges"]) == 4


def test_stronger_evidence_does_not_replace_a_shorter_path():
    graph = DependencyGraph(
        (
            Reference("script.a", "script", "sensor.root", "short", Confidence.UNKNOWN, Role.READ),
            Reference("script.b", "script", "sensor.root", "other", Confidence.EXPLICIT, Role.READ),
            Reference("script.a", "script", "script.b", "longer", Confidence.EXPLICIT, Role.READ),
        )
    ).impact("sensor.root")
    node = next(n for n in graph["nodes"] if n["id"] == "script.a")
    assert (node["confidence"], node["depth"], node["path"]) == (Confidence.UNKNOWN, 1, "short")


def test_confidence_upgrade_does_not_reclassify_a_dependent_or_selected_node():
    graph = DependencyGraph(
        (
            Reference("script.a", "script", "script.root", "read", Confidence.UNKNOWN, Role.READ),
            Reference("script.root", "script", "script.a", "call", Confidence.EXPLICIT, Role.CALL),
        )
    ).impact("script.root")
    nodes = {node["id"]: node for node in graph["nodes"]}
    assert nodes["script.a"]["relationship"] == "dependent"
    assert nodes["script.a"]["path"] == "read"
    assert nodes["script.root"] == {"id": "script.root", "depth": 0, "relationship": "selected"}
    assert len(graph["edges"]) == 2 and graph["cycles"]
