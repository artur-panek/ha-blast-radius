"""Device identities, entity targets and repeated review locations stay distinct."""

from dataclasses import replace

import pytest
from br_analysis.analyzer import Analyzer, markdown_report
from br_analysis.models import Source
from br_analysis.review import review_groups, review_summary


def keypad_source():
    return Source(
        "automation.keypad",
        "automation",
        "Synthetic keypad",
        {
            "triggers": [
                {
                    "trigger": "event",
                    "event_type": "key_press",
                    "event_data": {"device_id": "keypad", "key": index},
                }
                for index in range(16)
            ],
            "actions": [
                {
                    "choose": [
                        {
                            "conditions": [],
                            "sequence": [
                                {
                                    "device_id": "actuator",
                                    "domain": "cover",
                                    "type": "open",
                                    "entity_id": f"{index:032x}",
                                }
                            ],
                        }
                        for index in range(9)
                    ],
                    "default": [
                        {"action": "cover.close_cover", "target": {"entity_id": "cover.example"}}
                    ],
                }
            ],
        },
        selector_registry=frozenset({("device_id", "keypad"), ("device_id", "actuator")}),
    )


def test_keypad_has_three_review_groups_instead_of_34_undifferentiated_unknowns():
    report = Analyzer((keypad_source(),), {"cover.example"}).analyze("cover.example")
    assert report["summary"]["references"] == 1
    assert report["unresolved_total"] == 34  # Original API count is retained.
    assert report["review_summary"]["linked"] == {
        "locations": 34,
        "groups": 3,
        "device_locations": 25,
        "selector_locations": 0,
        "unresolved_locations": 9,
    }
    groups = review_groups(report["uncertain_references"])
    assert sorted(len(group["paths"]) for group in groups) == [9, 9, 16]
    assert report["summary"]["downstream"] == 0
    markdown = markdown_report(report)
    assert markdown.count("**Device reference**") == 2
    for ref in report["uncertain_references"]:
        assert f"`{ref['path']}`" in markdown
    assert "not a count of dependencies on the selected entity" in markdown
    assert (
        Analyzer((keypad_source(),), set()).preview("cover.example", "delete")["review_summary"]
        == report["review_summary"]
    )


def test_device_entity_registry_ids_resolve_without_expanding_device_membership():
    source = replace(
        keypad_source(), entity_registry={f"{i:032x}": f"cover.example_{i}" for i in range(9)}
    )
    engine = Analyzer((source,), {"cover.unreferenced_member"})
    report = engine.analyze("cover.example")
    assert report["review_summary"]["linked"]["unresolved_locations"] == 0
    assert report["review_summary"]["linked"]["device_locations"] == 25
    assert "cover.unreferenced_member" not in {n["id"] for n in report["graph"]["nodes"]}
    direct = engine.analyze("cover.example_4")["references"]
    assert len(direct) == 1
    assert direct[0]["path"] == "actions[0].choose[4].sequence[0].entity_id"
    assert direct[0]["confidence"] == "explicit"
    assert direct[0]["reason"] == "Entity registry ID resolved"
    assert direct[0]["role"] == "write"


@pytest.mark.parametrize(
    "field,config,role",
    [
        ("triggers", {"trigger": "device"}, "read"),
        ("trigger", {"platform": "device"}, "read"),
        ("conditions", {"condition": "device"}, "read"),
        ("sequence", {}, "write"),
        ("sequence", {"condition": "device"}, "read"),
    ],
)
def test_native_device_nodes_preserve_read_and_write_roles(field, config, role):
    source = Source(
        "automation.example",
        "automation",
        "Example",
        {
            field: [
                {
                    **config,
                    "device_id": "device",
                    "domain": "light",
                    "type": "on",
                    "entity_id": "a" * 32,
                }
            ],
        },
        entity_registry={"a" * 32: "light.example"},
    )
    ref = Analyzer((source,), set()).analyze("light.example")["references"][0]
    assert ref["role"] == role and ref["resolution"] == "entity"


@pytest.mark.parametrize(
    "config",
    [
        {"variables": {"entity_id": "a" * 32}},
        {"sequence": [{"action": "light.turn_on", "data": {"entity_id": "a" * 32}}]},
        {"sequence": [{"target": {"device_id": "device", "entity_id": "a" * 32}}]},
        {
            "sequence": [
                {
                    "device_id": "device",
                    "domain": "light",
                    "type": "on",
                    "entity_id": "{{ '" + "a" * 32 + "' }}",
                }
            ]
        },
    ],
)
def test_registry_ids_are_not_resolved_in_templates_or_untyped_fields(config):
    source = Source(
        "script.example", "script", "Example", config, entity_registry={"a" * 32: "light.example"}
    )
    report = Analyzer((source,), set()).analyze("light.example")
    assert report["references"] == []


def test_custom_card_cannot_impersonate_a_native_device_action():
    config = {
        "actions": [{"device_id": "device", "domain": "light", "type": "on", "entity_id": "a" * 32}]
    }
    source = Source(
        "dashboard.home", "dashboard", "Home", config, entity_registry={"a" * 32: "light.example"}
    )
    assert Analyzer((source,), set()).analyze("light.example")["references"] == []


@pytest.mark.parametrize("wrapper", ["variables", "data", "event_data"])
def test_device_shaped_service_payload_is_not_a_native_device_node(wrapper):
    source = Source(
        "script.example",
        "script",
        "Example",
        {
            "sequence": [
                {
                    wrapper: {
                        "actions": [
                            {
                                "device_id": "device",
                                "domain": "light",
                                "type": "on",
                                "entity_id": "a" * 32,
                            }
                        ]
                    }
                }
            ]
        },
        entity_registry={"a" * 32: "light.example"},
    )
    report = Analyzer((source,), set()).analyze("light.example")
    assert report["references"] == []


def test_nested_wait_condition_and_parallel_device_actions_keep_their_roles():
    device = {"device_id": "device", "domain": "light", "type": "on", "entity_id": "a" * 32}
    source = Source(
        "script.example",
        "script",
        "Example",
        {
            "sequence": [
                {
                    "repeat": {
                        "while": [{**device, "condition": "device"}],
                        "sequence": [
                            {"wait_for_trigger": [{**device, "trigger": "device"}]},
                            {"parallel": [{"sequence": [device]}, device]},
                        ],
                    }
                },
            ]
        },
        entity_registry={"a" * 32: "light.example"},
    )
    refs = Analyzer((source,), set()).analyze("light.example")["references"]
    assert len(refs) == 4
    assert [ref["role"] for ref in refs] == ["read", "read", "write", "write"]


def test_missing_registry_id_is_unresolved_without_exporting_arbitrary_field_content():
    source = replace(keypad_source(), entity_registry={})
    report = Analyzer((source,), set()).analyze("cover.example")
    missing = [r for r in report["uncertain_references"] if r["resolution"] == "unresolved"]
    assert len(missing) == 9
    assert {ref["reason"] for ref in missing} == {"Entity registry ID not found"}
    assert "00000000000000000000000000000008" not in str(report)


@pytest.mark.parametrize("kind", ["device_id", "area_id", "floor_id", "label_id"])
@pytest.mark.parametrize("registry,exists", [(None, None), (frozenset(), False), (True, True)])
def test_literal_selectors_keep_identity_status_and_no_entity_edges(kind, registry, exists):
    source = Source(
        "script.example",
        "script",
        "Example",
        {
            "sequence": [{"action": "light.turn_on", "target": {kind: "example"}}],
        },
        selector_registry=frozenset({(kind, "example")}) if registry is True else registry,
    )
    report = Analyzer((source,), {"light.member"}).analyze("script.example")
    ref = report["uncertain_references"][0]
    assert ref["resolution"] == "selector" and ref["selector"]["exists"] is exists
    assert report["summary"]["downstream"] == 0
    assert report["review_summary"]["linked"]["selector_locations"] == 1


def test_grouping_preserves_sources_roles_identity_status_and_every_branch_location():
    base = {
        "source_id": "script.a",
        "source_type": "script",
        "target": None,
        "role": "read",
        "confidence": "dynamic",
        "reason": "Device identity reference",
        "resolution": "device",
        "selector": {"kind": "device_id", "value": "a", "exists": True},
    }
    refs = [
        dict(base, path="triggers[0].device_id"),
        dict(base, path="triggers[1].device_id"),
        dict(base, path="sequence[0].device_id", role="write"),
        dict(base, path="triggers[0].device_id", source_id="script.b"),
        dict(base, path="triggers[2].device_id", selector={**base["selector"], "value": "b"}),
        dict(base, path="triggers[3].device_id", selector={**base["selector"], "exists": False}),
        dict(base, path="triggers[4].device_id", selector={**base["selector"], "exists": None}),
    ]
    groups = review_groups(refs)
    assert len(groups) == 6
    assert sum(len(g["paths"]) for g in groups) == len(refs)
    assert groups[0]["paths"] == ["triggers[0].device_id", "triggers[1].device_id"]
    assert review_summary([])["groups"] == 0


def test_dashboard_and_unrelated_sources_do_not_inflate_linked_review_count():
    dashboard = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {"entity": "cover.example"},
                        {"secondary": "{{ states(other_entity) }}"},
                    ]
                }
            ]
        },
    )
    unrelated = Source(
        "script.unrelated",
        "script",
        "Other",
        {
            "sequence": [
                {"target": {"area_id": "elsewhere"}},
            ]
        },
    )
    report = Analyzer((keypad_source(), dashboard, unrelated), set()).analyze("cover.example")
    assert report["review_summary"]["linked"]["locations"] == 34
    assert report["review_summary"]["other_dashboard"]["locations"] == 1
    assert report["review_summary"]["snapshot"]["locations"] == 36
    assert report["review_summary"]["snapshot"]["selector_locations"] == 1
    assert "script.unrelated" not in markdown_report(report)


def test_legacy_report_groups_keep_selectors_separate_from_dynamic_expressions():
    report = Analyzer((keypad_source(),), set()).analyze("cover.example")
    refs = [
        {k: v for k, v in ref.items() if k != "resolution"}
        for ref in report["uncertain_references"]
    ]
    assert review_summary(refs)["selector_locations"] == 25
    assert review_summary(refs)["unresolved_locations"] == 9
