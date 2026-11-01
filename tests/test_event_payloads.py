"""Custom event payloads describe entities without proving actions or state reads."""

import json
from pathlib import Path

import pytest
from br_analysis.analyzer import Analyzer
from br_analysis.models import Confidence, Resolution, Role, Source
from br_analysis.references import scan_sources


@pytest.fixture
def event_sources():
    data = json.loads((Path(__file__).parent / "fixtures/event_payloads.json").read_text())
    return tuple(Source(**source) for source in data)


@pytest.mark.parametrize("known", [False, True])
def test_event_payload_mentions_do_not_become_effects(event_sources, known):
    reporter, shutdown = event_sources
    engine = Analyzer(event_sources, {"light.reported", "script.shutdown"} if known else set())
    report = engine.analyze(reporter.source_id)
    assert [node["id"] for node in report["graph"]["nodes"]] == [reporter.source_id]
    mentions = [
        ref
        for ref in engine.preview("light.reported", "delete")["references"]
        if ref["source_id"] == reporter.source_id
    ]
    literals = [ref for ref in mentions if ref["confidence"] != "template_literal"]
    assert {ref["path"] for ref in literals} == {
        "sequence[0].event_data.entity_id",
        "sequence[0].event_data.actions[0].target.entity_id",
        "sequence[0].event_data.entities.light.reported",
    }
    assert all(
        ref["confidence"] == "unknown"
        and ref["role"] == "read"
        and ref["reason"] == "Literal in event payload"
        for ref in literals
    )
    assert len(mentions) == 4
    # A genuine service action still has an explicit write to the same entity.
    writes = [
        ref
        for ref in engine.analyze(shutdown.source_id)["graph"]["edges"]
        if ref["source_id"] == shutdown.source_id
    ]
    assert len(writes) == 1
    assert writes[0]["role"] == "write" and writes[0]["confidence"] == "explicit"


@pytest.mark.parametrize("data_key", ["event_data", "event_data_template"])
@pytest.mark.parametrize("entity_key", ["entity_id", "entity", "entities", "entity_ids"])
def test_entity_payload_fields_remain_visible_as_mentions(data_key, entity_key):
    source = Source(
        "script.report",
        "script",
        "Report",
        {
            "sequence": [
                {
                    "event": "custom_status",
                    data_key: {
                        "sequence": [{"target": {entity_key: ["light.room", "light.missing"]}}]
                    },
                }
            ]
        },
    )
    refs = scan_sources((source,), {"light.room"}).references
    assert {ref.target for ref in refs} == {"light.room", "light.missing"}
    assert all(ref.role == Role.READ and ref.confidence == Confidence.UNKNOWN for ref in refs)


@pytest.mark.parametrize("key", ["entity_id", "action", "service", "area_id"])
def test_templates_in_event_payloads_are_not_action_targets(key):
    source = Source(
        "script.report",
        "script",
        "Report",
        {
            "sequence": [
                {
                    "event": "custom_status",
                    "event_data": {key: "{{ states('sensor.temperature') }}"},
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert len(refs) == 1
    assert refs[0].target == "sensor.temperature"
    assert refs[0].role == Role.READ and refs[0].confidence == Confidence.TEMPLATE_LITERAL


def test_dynamic_event_payload_keeps_uncertainty_without_effects():
    source = Source(
        "script.report",
        "script",
        "Report",
        {
            "sequence": [
                {
                    "event": "custom_status",
                    "event_data": {"actions": [{"target": {"entity_id": "{{ states(entity) }}"}}]},
                }
            ]
        },
    )
    report = Analyzer((source,), set()).analyze(source.source_id)
    refs = report["uncertain_references"]
    assert len(refs) == 1 and refs[0]["role"] == "read"
    assert "Computed entity lookup" in refs[0]["reason"]
    assert report["summary"]["downstream"] == 0


def test_entity_shaped_event_mapping_keeps_nested_template_reads():
    source = Source(
        "script.report",
        "script",
        "Report",
        {
            "sequence": [
                {
                    "event": "custom_status",
                    "event_data": {
                        "entities": {
                            "light.room": {"temperature": "{{ states('sensor.temperature') }}"}
                        }
                    },
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert [(ref.target, ref.confidence, ref.role) for ref in refs] == [
        ("light.room", Confidence.UNKNOWN, Role.READ),
        ("sensor.temperature", Confidence.TEMPLATE_LITERAL, Role.READ),
    ]


@pytest.mark.parametrize(
    "config,path",
    [
        (
            {"actions": [{"event": "report", "event_data": {"entity_id": "light.room"}}]},
            "actions[0].event_data.entity_id",
        ),
        (
            {
                "sequence": [
                    {
                        "choose": [],
                        "default": [{"event": "report", "event_data": {"entity_id": "light.room"}}],
                    }
                ]
            },
            "sequence[0].default[0].event_data.entity_id",
        ),
        (
            {
                "sequence": [
                    {"parallel": [[{"event": "report", "event_data": {"entity_id": "light.room"}}]]}
                ]
            },
            "sequence[0].parallel[0][0].event_data.entity_id",
        ),
    ],
)
def test_event_actions_in_nested_native_sequences(config, path):
    source = Source("script.report", "script", "Report", config)
    refs = scan_sources((source,), set()).references
    assert len(refs) == 1 and refs[0].path == path
    assert refs[0].role == Role.READ and refs[0].confidence == Confidence.UNKNOWN


@pytest.mark.parametrize("discriminator", ["trigger", "platform"])
def test_event_trigger_filters_preserve_their_existing_semantics(discriminator):
    source = Source(
        "automation.listen",
        "automation",
        "Listen",
        {
            "triggers": [
                {
                    discriminator: "event",
                    "event_type": "custom_status",
                    "event_data": {"entity_id": "light.room", "device_id": "device"},
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert refs[0].target == "light.room"
    assert refs[0].role == Role.READ and refs[0].confidence == Confidence.EXPLICIT
    assert refs[1].resolution == Resolution.DEVICE and refs[1].role == Role.READ


def test_event_shaped_service_data_does_not_change_service_targets():
    source = Source(
        "script.action",
        "script",
        "Action",
        {
            "sequence": [
                {
                    "action": "light.turn_on",
                    "target": {"entity_id": "light.target"},
                    "data": {"entity_id": "light.data", "event": "custom_status"},
                }
            ]
        },
    )
    refs = scan_sources((source,), set()).references
    assert {ref.target for ref in refs} == {"light.target", "light.data"}
    assert all(ref.role == Role.WRITE and ref.confidence == Confidence.EXPLICIT for ref in refs)
