"""Normalized, immutable input and reference records."""

from collections.abc import Mapping
from dataclasses import asdict, dataclass
from enum import StrEnum
from typing import Any

BASE_COVERAGE_NOTE = (
    "Coverage excludes helper configuration without exposed membership, template "
    "integration definitions, external integrations and unexpanded "
    "device/area/floor/label targets."
)


class InvalidInput(ValueError):
    """A validated request error whose message is safe to return to the client."""


class Confidence(StrEnum):
    EXPLICIT = "explicit"
    TEMPLATE_LITERAL = "template_literal"
    DYNAMIC = "dynamic"
    UNKNOWN = "unknown"


class Role(StrEnum):
    READ = "read"
    WRITE = "write"
    CALL = "call"
    MEMBER = "member"
    DISPLAY = "display"


class Resolution(StrEnum):
    """What a reference identifies, independently of entity-edge confidence."""

    ENTITY = "entity"
    DEVICE = "device"
    SELECTOR = "selector"
    UNRESOLVED = "unresolved"


@dataclass(frozen=True)
class Source:
    source_id: str
    source_type: str
    name: str
    config: dict[str, Any]
    native_entities: frozenset[str] = frozenset()
    native_selectors: frozenset[tuple[str, str]] = frozenset()
    selector_registry: frozenset[tuple[str, str]] | None = None
    blueprint: bool = False
    entity_registry: Mapping[str, str] | None = None


@dataclass(frozen=True)
class Selector:
    """A literal selector, never an inferred set of entity targets."""

    kind: str
    value: str
    exists: bool | None


@dataclass(frozen=True)
class Reference:
    source_id: str
    source_type: str
    target: str | None
    path: str
    confidence: Confidence
    role: Role
    reason: str = ""
    selector: Selector | None = None
    resolution: Resolution | None = None

    def as_dict(self) -> dict[str, Any]:
        result = asdict(self)
        if self.selector is None:
            result.pop("selector")
        result["resolution"] = self.resolution or (
            Resolution.ENTITY
            if self.target is not None
            else Resolution.SELECTOR
            if self.selector is not None
            else Resolution.UNRESOLVED
        )
        return result


@dataclass(frozen=True)
class Scan:
    references: tuple[Reference, ...]
    warnings: tuple[str, ...] = ()
