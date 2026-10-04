"""Group review locations without inventing shared targets or dropping evidence."""

from collections import Counter
from typing import Any


def resolution(ref: dict[str, Any]) -> str:
    """Accept older reports, where all literal selectors shared one category."""
    return str(
        ref.get("resolution")
        or (
            "entity"
            if ref.get("target") is not None
            else "selector"
            if ref.get("selector")
            else "unresolved"
        )
    )


def review_groups(refs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[tuple[Any, ...], dict[str, Any]] = {}
    for ref in refs:
        selector = ref.get("selector") or {}
        key = (
            ref["source_id"],
            ref["source_type"],
            ref["role"],
            ref["confidence"],
            ref["reason"],
            resolution(ref),
            selector.get("kind"),
            selector.get("value"),
            selector.get("exists"),
        )
        if key not in groups:
            groups[key] = {"reference": ref, "paths": []}
        groups[key]["paths"].append(ref["path"])
    return list(groups.values())


def review_summary(refs: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(resolution(ref) for ref in refs)
    return {
        "locations": len(refs),
        "groups": len(review_groups(refs)),
        "device_locations": counts["device"],
        "selector_locations": counts["selector"],
        "unresolved_locations": counts["unresolved"],
    }


def review_markdown(refs: list[dict[str, Any]]) -> list[str]:
    labels = {
        "device": "Device reference",
        "selector": "Entity set not expanded",
        "unresolved": "Dynamic or unrecognized target",
    }
    lines: list[str] = []
    for group in review_groups(refs):
        ref, paths = group["reference"], group["paths"]
        lines.append(
            f"- **{labels[resolution(ref)]}** — `{ref['source_id']}` "
            f"({ref['role']}; {len(paths)} location(s)): {ref['reason']}"
        )
        if selector := ref.get("selector"):
            presence = {True: "found", False: "not found", None: "not checked"}[selector["exists"]]
            lines.append(
                f"  - `{selector['kind']}: {selector['value']}`; registry identity {presence}. "
                "This does not establish an entity dependency or runtime execution."
            )
        lines.extend(f"  - `{path}`" for path in paths)
    return lines
