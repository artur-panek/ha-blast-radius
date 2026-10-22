"""Native dashboard calls and scene actions retain their exact reference semantics."""

import copy
import json
from dataclasses import replace
from pathlib import Path

import pytest
from br_analysis.analyzer import Analyzer
from br_analysis.models import Confidence, Role, Source
from br_analysis.references import scan_sources


@pytest.fixture
def action_sources():
    data = json.loads((Path(__file__).parent / "fixtures/native_actions.json").read_text())
    return tuple(Source(**source) for source in data)


@pytest.mark.parametrize("action_key", ["tap_action", "hold_action", "double_tap_action"])
@pytest.mark.parametrize("known", [False, True])
def test_dashboard_script_calls_keep_their_role_and_stale_location(
    action_sources, action_key, known
):
    dashboard = action_sources[0]
    config = copy.deepcopy(dashboard.config)
    card = config["views"][0]["cards"][1]
    card[action_key] = card.pop("tap_action")
    engine = Analyzer((replace(dashboard, config=config),), {"script.wake_up"} if known else set())

    report = engine.analyze("script.wake_up")
    assert report["exists"] is known
    assert len(report["references"]) == 1
    ref = report["references"][0]
    assert ref["path"] == f"views[0].cards[1].{action_key}.perform_action"
    assert ref["role"] == "call"
    assert ref["confidence"] == "explicit"
    assert report["unresolved_total"] == 0


@pytest.mark.parametrize(
    "config,path",
    [
        ({"views": [{"sections": [{"cards": [{}]}]}]}, "views[0].sections[0].cards[0]"),
        ({"views": [{"cards": [{"cards": [{}]}]}]}, "views[0].cards[0].cards[0]"),
        ({"views": [{"cards": [{"card": {}}]}]}, "views[0].cards[0].card"),
        ({"views": [{"cards": [{"entities": [{}]}]}]}, "views[0].cards[0].entities[0]"),
        ({"views": [{"cards": [{"elements": [{}]}]}]}, "views[0].cards[0].elements[0]"),
        ({"views": [{"badges": [{}]}]}, "views[0].badges[0]"),
    ],
)
def test_dashboard_calls_in_native_nested_items(config, path):
    item = config["views"][0]
    while item:
        value = next(iter(item.values()))
        item = value[0] if isinstance(value, list) else value
    item["tap_action"] = {"action": "perform-action", "perform_action": "script.nested"}
    source = Source("dashboard.home", "dashboard", "Home", config)
    ref = scan_sources((source,), set()).references[0]
    assert ref.path == f"{path}.tap_action.perform_action"
    assert ref.target == "script.nested" and ref.role == Role.CALL


@pytest.mark.parametrize("action", ["perform-action", "call-service"])
def test_dashboard_perform_action_takes_precedence_over_legacy_service(action):
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "tap_action": {
                                "action": action,
                                "perform_action": "script.current",
                                "service": "script.previous",
                            }
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), {"script.current", "script.previous"}).references
    assert len(refs) == 1
    assert refs[0].target == "script.current" and refs[0].role == Role.CALL


def test_empty_dashboard_perform_action_keeps_legacy_service_fallback():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "tap_action": {
                                "action": "call-service",
                                "perform_action": "",
                                "service": "script.fallback",
                            }
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert len(refs) == 1
    assert refs[0].target == "script.fallback"
    assert refs[0].path.endswith(".service")


@pytest.mark.parametrize(
    "service",
    ["script.turn_on", "script.turn_off", "script.toggle", "script.reload", "light.turn_on"],
)
def test_dashboard_generic_services_do_not_become_script_entities(service):
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "tap_action": {
                                "action": "perform-action",
                                "perform_action": service,
                                "target": {"entity_id": "script.actual_target"},
                            }
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), {service}).references
    assert [ref.target for ref in refs] == ["script.actual_target"]


@pytest.mark.parametrize("action_key", ["tap_action", "hold_action", "double_tap_action"])
@pytest.mark.parametrize(
    "action,service_field,target_field",
    [
        ("perform-action", "perform_action", "target"),
        ("perform-action", "perform_action", "data"),
        ("call-service", "service", "service_data"),
    ],
)
def test_dashboard_action_targets_are_not_display_references(
    action_key, action, service_field, target_field
):
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "type": "button",
                            "entity": "light.office",
                            action_key: {
                                "action": action,
                                service_field: "light.turn_on",
                                target_field: {"entity_id": "light.office"},
                            },
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), {"light.office"}).references
    assert {ref.path: ref.role for ref in refs} == {
        "views[0].cards[0].entity": Role.DISPLAY,
        f"views[0].cards[0].{action_key}.{target_field}.entity_id": Role.WRITE,
    }
    assert all(ref.confidence == Confidence.EXPLICIT for ref in refs)


@pytest.mark.parametrize("data", [{}, {"entity_id": "light.current"}])
def test_dashboard_data_overrides_legacy_service_data(data):
    action = {
        "action": "perform-action",
        "perform_action": "light.turn_on",
        "data": data,
        "service_data": {"entity_id": "light.previous"},
    }
    source = Source(
        "dashboard.home", "dashboard", "Home", {"views": [{"cards": [{"tap_action": action}]}]}
    )
    refs = scan_sources((source,), {"light.current", "light.previous"}).references
    assert [(ref.target, ref.role) for ref in refs] == (
        [("light.current", Role.WRITE)] if data else []
    )


@pytest.mark.parametrize(
    "card_type,action", [("custom:example", "perform-action"), ("button", "none")]
)
def test_untyped_dashboard_targets_keep_their_existing_role(card_type, action):
    card = {
        "type": card_type,
        "tap_action": {
            "action": action,
            "perform_action": "light.turn_on",
            "target": {"entity_id": "light.office"},
        },
    }
    source = Source("dashboard.home", "dashboard", "Home", {"views": [{"cards": [card]}]})
    refs = scan_sources((source,), {"light.office"}).references
    assert [(ref.target, ref.role) for ref in refs] == [("light.office", Role.DISPLAY)]


def test_templated_dashboard_target_keeps_reads_and_an_unresolved_write():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "tap_action": {
                                "action": "perform-action",
                                "perform_action": "light.turn_on",
                                "target": {"entity_id": "{{ states('input_text.target') }}"},
                            }
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert [(ref.target, ref.role) for ref in refs] == [
        ("input_text.target", Role.READ),
        (None, Role.WRITE),
    ]


@pytest.mark.parametrize(
    "card",
    [
        {
            "type": "custom:example",
            "tap_action": {"action": "perform-action", "perform_action": "script.example"},
        },
        {
            "type": "custom:example",
            "cards": [
                {
                    "type": "button",
                    "tap_action": {"action": "perform-action", "perform_action": "script.example"},
                }
            ],
        },
        {
            "type": "button",
            "data": {
                "tap_action": {"action": "perform-action", "perform_action": "script.example"}
            },
        },
        {"type": "button", "tap_action": {"action": "none", "perform_action": "script.example"}},
    ],
)
def test_untyped_dashboard_values_do_not_gain_call_semantics(card):
    source = Source("dashboard.home", "dashboard", "Home", {"views": [{"cards": [card]}]})
    assert scan_sources((source,), set()).references == ()
    refs = scan_sources((source,), {"script.example"}).references
    assert len(refs) == 1
    assert refs[0].confidence == Confidence.UNKNOWN and refs[0].role == Role.READ


def test_scene_shorthand_follows_scene_membership_without_metadata_duplicates(action_sources):
    script = replace(action_sources[1], native_entities=frozenset({"scene.morning"}))
    engine = Analyzer((script, action_sources[2]), {"scene.morning"})
    refs = engine.analyze("scene.morning")["references"]
    assert len(refs) == 1
    assert refs[0]["path"] == "sequence[0].scene"
    assert refs[0]["confidence"] == "explicit" and refs[0]["role"] == "write"
    nodes = {node["id"]: node for node in engine.analyze("script.wake_up")["graph"]["nodes"]}
    assert set(nodes) == {"script.wake_up", "scene.morning", "light.bedroom"}
    assert nodes["scene.morning"]["relationship"] == "downstream"
    assert nodes["light.bedroom"]["depth"] == 2


@pytest.mark.parametrize(
    "config,path",
    [
        ({"action": {"scene": "scene.missing"}}, "action.scene"),
        ({"actions": [{"scene": "scene.missing"}]}, "actions[0].scene"),
        (
            {
                "sequence": [
                    {"choose": [{"conditions": [], "sequence": [{"scene": "scene.missing"}]}]}
                ]
            },
            "sequence[0].choose[0].sequence[0].scene",
        ),
        (
            {"sequence": [{"if": [], "then": [{"scene": "scene.missing"}]}]},
            "sequence[0].then[0].scene",
        ),
        (
            {"sequence": [{"choose": [], "default": [{"scene": "scene.missing"}]}]},
            "sequence[0].default[0].scene",
        ),
        (
            {"sequence": [{"repeat": {"count": 2, "sequence": [{"scene": "scene.missing"}]}}]},
            "sequence[0].repeat.sequence[0].scene",
        ),
        (
            {"sequence": [{"parallel": [{"sequence": [{"scene": "scene.missing"}]}]}]},
            "sequence[0].parallel[0].sequence[0].scene",
        ),
    ],
)
def test_scene_shorthand_retains_stale_destinations_in_native_steps(config, path):
    source = Source("script.example", "script", "Example", config)
    refs = scan_sources((source,), set()).references
    assert len(refs) == 1
    assert refs[0].target == "scene.missing" and refs[0].path == path
    assert refs[0].confidence == Confidence.EXPLICIT and refs[0].role == Role.WRITE


@pytest.mark.parametrize("wrapper", ["variables", "data", "event_data"])
def test_scene_fields_in_payloads_remain_untyped(wrapper):
    source = Source(
        "script.example",
        "script",
        "Example",
        {
            "sequence": [{wrapper: {"sequence": [{"scene": "scene.example"}]}}],
        },
    )
    assert scan_sources((source,), set()).references == ()
    refs = scan_sources((source,), {"scene.example"}).references
    assert len(refs) == 1
    assert refs[0].confidence == Confidence.UNKNOWN and refs[0].role == Role.READ


def test_scene_fields_in_dashboards_remain_untyped():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [{"cards": [{"sequence": [{"scene": "scene.example"}]}]}],
        },
    )
    assert scan_sources((source,), set()).references == ()


@pytest.mark.parametrize("value", ["light.not_a_scene", "scene.*", "not an entity"])
def test_invalid_scene_shorthand_does_not_create_effect_edges(value):
    source = Source("script.example", "script", "Example", {"sequence": [{"scene": value}]})
    report = Analyzer((source,), {value}).analyze("script.example")
    assert report["summary"]["downstream"] == 0
    assert report["uncertain_references"][0]["target"] is None


@pytest.mark.parametrize(
    "source_type,key,target",
    [("script", "scene", "scene.example"), ("dashboard", "perform_action", "script.example")],
)
def test_templated_action_values_remain_reads_and_unresolved(source_type, key, target):
    action = {key: "{{ '" + target + "' }}"}
    config = {"sequence": [action]}
    if source_type == "dashboard":
        action["action"] = "perform-action"
        config = {"views": [{"cards": [{"tap_action": action}]}]}
    source = Source(f"{source_type}.test", source_type, "Test", config)
    refs = scan_sources((source,), set()).references
    assert len(refs) == 2
    assert refs[0].target == target and refs[0].role == Role.READ
    assert refs[0].confidence == Confidence.TEMPLATE_LITERAL
    assert refs[1].target is None and refs[1].reason == "Templated target"


def test_modern_dashboard_calls_do_not_connect_unrelated_cards(action_sources):
    engine = Analyzer(action_sources, {"light.kitchen", "light.bedroom"})
    kitchen = engine.analyze("light.kitchen")
    assert {node["id"] for node in kitchen["graph"]["nodes"]} == {"light.kitchen", "dashboard.home"}
    script = engine.analyze("script.wake_up")
    assert {node["id"] for node in script["graph"]["nodes"]} == {
        "script.wake_up",
        "dashboard.home",
        "scene.morning",
        "light.bedroom",
    }


@pytest.mark.parametrize("known", [False, True])
def test_script_names_in_variables_and_event_data_do_not_create_calls(known):
    data = json.loads((Path(__file__).parent / "fixtures/script_call_fields.json").read_text())
    description, shutdown = (Source(**source) for source in data)
    entities = {shutdown.source_id} if known else set()
    refs = scan_sources((description,), entities).references
    if known:
        assert {ref.path for ref in refs} == {
            "sequence[0].variables.service",
            "sequence[0].variables.action",
            "sequence[1].event_data.service",
            "sequence[1].event_data.action",
            "sequence[1].event_data.sequence[0].service",
            "sequence[1].event_data.sequence[0].action",
        }
        assert all(ref.confidence == Confidence.UNKNOWN and ref.role == Role.READ for ref in refs)
    else:
        assert refs == ()

    report = Analyzer((description, shutdown), entities).analyze(description.source_id)
    assert [node["id"] for node in report["graph"]["nodes"]] == [description.source_id]
    assert report["summary"]["downstream"] == 0


@pytest.mark.parametrize("field", ["action", "service"])
@pytest.mark.parametrize(
    "sequence,path",
    [
        ([{}], "sequence[0]"),
        (
            [{"choose": [{"conditions": [], "sequence": [{}]}]}],
            "sequence[0].choose[0].sequence[0]",
        ),
        (
            [{"choose": [], "default": [{}]}],
            "sequence[0].default[0]",
        ),
        (
            [{"repeat": {"count": 2, "sequence": [{}]}}],
            "sequence[0].repeat.sequence[0]",
        ),
        (
            [{"parallel": [{"sequence": [{}]}]}],
            "sequence[0].parallel[0].sequence[0]",
        ),
        ([{"parallel": [{}]}], "sequence[0].parallel[0]"),
        ([{"parallel": [[{}]]}], "sequence[0].parallel[0][0]"),
        ([{"if": [], "then": [{}]}], "sequence[0].then[0]"),
        ([{"if": [], "then": [], "else": [{}]}], "sequence[0].else[0]"),
    ],
)
def test_native_script_calls_keep_nested_paths_and_effects(field, sequence, path):
    config = {"sequence": copy.deepcopy(sequence)}
    item = config
    for part in path.split("."):
        key, *indexes = part.replace("]", "").split("[")
        item = item[key]
        for index in indexes:
            item = item[int(index)]
    item[field] = "script.shutdown"
    caller = Source("script.caller", "script", "Caller", config)
    shutdown = Source(
        "script.shutdown",
        "script",
        "Shutdown",
        {"sequence": [{"action": "light.turn_off", "target": {"entity_id": "light.office"}}]},
    )
    engine = Analyzer((caller, shutdown), set())
    refs = engine.analyze(shutdown.source_id)["references"]
    assert len(refs) == 1
    assert refs[0]["path"] == f"{path}.{field}"
    assert refs[0]["confidence"] == "explicit" and refs[0]["role"] == "call"
    nodes = {node["id"]: node for node in engine.analyze(caller.source_id)["graph"]["nodes"]}
    assert nodes[shutdown.source_id]["relationship"] == "downstream"
    assert nodes["light.office"]["depth"] == 2


@pytest.mark.parametrize(
    "card",
    [
        {"type": "custom:example", "tap_action": {"action": "script.example"}},
        {
            "type": "custom:example",
            "tap_action": {"action": "call-service", "service": "script.example"},
        },
        {"type": "button", "tap_action": {"action": "none", "service": "script.example"}},
        {"type": "button", "data": {"service": "script.example"}},
    ],
)
def test_untyped_legacy_dashboard_fields_do_not_create_script_calls(card):
    source = Source("dashboard.home", "dashboard", "Home", {"views": [{"cards": [card]}]})
    assert scan_sources((source,), set()).references == ()
    refs = scan_sources((source,), {"script.example"}).references
    assert len(refs) == 1
    assert refs[0].confidence == Confidence.UNKNOWN and refs[0].role == Role.READ
