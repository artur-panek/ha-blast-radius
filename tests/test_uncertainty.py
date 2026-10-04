"""Uncertainty remains visible without attributing a whole dashboard to one entity."""

import pytest
from br_analysis.analyzer import Analyzer, markdown_report
from br_analysis.models import Source
from br_analysis.references import scan_sources
from br_analysis.templates import inspect_template


@pytest.mark.parametrize(
    "template",
    [
        "{% set active = is_state('light.kitchen', 'on') %}{{ 'red' if active else 'grey' }}",
        "{% set t = states('sensor.temperature') | float(0) %}{{ t | round(1) }}",
        "{% set values = ['red', 'blue'] %}{{ values | join(', ') }}",
        "{% for color in ['red', 'blue'] %}{{ loop.index }}: {{ color }}{% endfor %}",
        "{% set label = 'Ready' %}{{ label if label is defined else '' }}",
    ],
)
def test_local_value_templates_do_not_invent_unknown_entity_dependencies(template):
    assert not inspect_template(template).dynamic


@pytest.mark.parametrize(
    "template,reason",
    [
        ("{{ label }}{% set label = 'Ready' %}", "External template variable"),
        ("{% if true %}{% set v = 1 %}{% endif %}{{ v }}", "External template variable"),
        ("{{ states(entity) }}", "Computed entity lookup"),
        ("{{ states.sensor }}", "State collection or computed lookup"),
        ("{{ states | list | count }}", "State collection or computed lookup"),
        ("{% for state in states.sensor %}{{ state.state }}{% endfor %}", "State collection"),
        ("{{ area_entities('office') }}", "Template helper or macro"),
        ("{{ 'light.kitchen' is is_state('on') }}", "Unsupported template filter or test"),
        ("{{ states('sensor.room') | custom_filter }}", "Unsupported template filter or test"),
        ("{% include 'other.jinja' %}", "Template import"),
        ("{% for v in ['red'] %}{{ v }}{% endfor %}{{ v }}", "External template variable"),
    ],
)
def test_dynamic_dependencies_remain_visible_with_a_reason(template, reason):
    result = inspect_template(template)
    assert result.dynamic and reason in result.reason


def test_local_literal_state_read_is_retained_without_extra_unresolved_entry():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "card_mod": {
                                "style": "{% set on = is_state('light.kitchen', 'on') %}"
                                "{{ 'red' if on else 'grey' }}"
                            }
                        }
                    ]
                }
            ]
        },
    )
    refs = scan_sources((source,), {"light.kitchen"}).references
    assert len(refs) == 1
    assert refs[0].target == "light.kitchen"


def test_even_local_constant_entity_target_is_not_rendered_or_guessed(monkeypatch):
    from br_analysis.templates import _ENV
    from jinja2 import Environment

    def forbidden(*args, **kwargs):
        pytest.fail("Analysis must not compile, render or execute filters")

    monkeypatch.setattr(Environment, "compile", forbidden)
    monkeypatch.setattr(Environment, "from_string", forbidden)
    monkeypatch.setitem(_ENV.filters, "upper", forbidden)
    result = inspect_template("{% set color = 'red' %}{{ color | upper }}")
    assert not result.dynamic
    source = Source(
        "script.test",
        "script",
        "Test",
        {"sequence": [{"target": {"entity_id": "{% set e = 'light.kitchen' %}{{ e }}"}}]},
    )
    refs = scan_sources((source,), set()).references
    assert {ref.target for ref in refs} == {"light.kitchen", None}
    assert next(ref for ref in refs if ref.target is None).reason == "Templated target"


def test_fifty_unrelated_dashboard_expressions_are_separated_not_discarded():
    cards = [{"entity": "light.kitchen", "secondary": "{{ states(entity) }}"}]
    cards += [{"secondary": "{{ states(other_entity) }}"} for _ in range(50)]
    source = Source("dashboard.home", "dashboard", "Home", {"views": [{"cards": cards}]})
    engine = Analyzer((source,), {"light.kitchen", "light.unrelated"})
    report = engine.analyze("light.kitchen")
    assert report["summary"]["references"] == 1
    assert report["unresolved_total"] == 51
    assert len(report["uncertain_references"]) == 1
    assert report["uncertain_references"][0]["path"] == "views[0].cards[0].secondary"
    assert len(report["other_dashboard_references"]) == 50
    assert report["source_names"] == {"dashboard.home": "Home"}
    markdown = markdown_report(report)
    assert "Elsewhere in linked dashboards" in markdown
    assert "views[0].cards[50].secondary" in markdown
    assert "other_entity" not in markdown  # Template bodies remain private.
    preview = engine.preview("light.kitchen", "delete")
    assert preview["other_dashboard_references"] == report["other_dashboard_references"]
    unrelated = engine.analyze("light.unrelated")
    assert unrelated["uncertain_references"] == unrelated["other_dashboard_references"] == []
    assert unrelated["unresolved_total"] == 51


def test_nested_card_boundaries_and_dashboard_level_context():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "background": "{{ background_entity }}",
            "views": [
                {
                    "sections": [
                        {
                            "cards": [
                                {
                                    "card_mod": {"style": "{{ parent_style }}"},
                                    "cards": [
                                        {
                                            "entity": "light.kitchen",
                                            "card": {"secondary": "{{ entity }}"},
                                        },
                                        {
                                            "entity": "light.bedroom",
                                            "secondary": "{{ other_entity }}",
                                        },
                                    ],
                                }
                            ]
                        }
                    ]
                }
            ],
        },
    )
    report = Analyzer((source,), {"light.kitchen", "light.bedroom"}).analyze("light.kitchen")
    assert {ref["path"] for ref in report["uncertain_references"]} == {
        "views[0].sections[0].cards[0].card_mod.style",
        "views[0].sections[0].cards[0].cards[0].card.secondary",
    }
    assert {ref["path"] for ref in report["other_dashboard_references"]} == {
        "background",
        "views[0].sections[0].cards[0].cards[1].secondary",
    }


def test_patterns_and_area_selectors_explain_why_they_are_unresolved():
    source = Source(
        "dashboard.home",
        "dashboard",
        "Home",
        {
            "views": [
                {
                    "cards": [
                        {
                            "entity": "light.kitchen",
                            "filter": {
                                "include": [{"entity_id": "light.*"}, {"area_id": "office"}],
                            },
                        }
                    ]
                }
            ],
        },
    )
    report = Analyzer((source,), {"light.kitchen"}).analyze("light.kitchen")
    assert {ref["reason"] for ref in report["uncertain_references"]} == {
        "Entity pattern",
        "Unexpanded area_id target",
    }
