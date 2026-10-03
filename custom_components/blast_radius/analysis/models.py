"""Normalized, immutable input and reference records."""

from dataclasses import asdict, dataclass
from enum import StrEnum
from typing import Any


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


@dataclass(frozen=True)
class Source:
    source_id: str
    source_type: str
    name: str
    config: dict[str, Any]


@dataclass(frozen=True)
class Reference:
    source_id: str
    source_type: str
    target: str | None
    path: str
    confidence: Confidence
    role: Role
    reason: str = ""

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Scan:
    references: tuple[Reference, ...]
    warnings: tuple[str, ...] = ()
