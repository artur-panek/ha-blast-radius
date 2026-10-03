"""Publish an unreleased manifest version after Quality passes on trusted main.

Uses only the job-scoped GitHub token. Published releases and tags are never moved
or overwritten. Assets are uploaded to a draft before it becomes visible to HACS.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = "artur-panek/ha-blast-radius"


def version_tuple(value):
    if not re.fullmatch(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", value):
        raise ValueError("Release versions must use three numeric components")
    return tuple(map(int, value.split(".")))


def release_notes(changelog, version):
    version_tuple(version)
    match = re.search(
        rf"^## {re.escape(version)} — [^\n]+\n(.*?)(?=^## |\Z)",
        changelog,
        re.MULTILINE | re.DOTALL,
    )
    if match is None or not match[1].strip():
        raise ValueError("A non-empty changelog section is required for this version")
    return (
        "## Experimental alpha\n\n"
        "Read-only dependency inspection for Home Assistant. Tested with Core 2026.9.4; "
        "other versions and every custom configuration are not guaranteed.\n\n"
        "This numbered release uses the standard HACS update channel, but the project "
        "remains an experimental alpha. HACS discovers updates; installation and the "
        "Home Assistant restart stay under your control.\n\n"
        "### Changes\n\n" + match[1].strip() + "\n\n"
        "### Updating\n\n"
        "For an existing `main` installation, use HACS → HA Blast Radius → Redownload "
        f"once and select `v{version}` instead of `main`. Then restart Home Assistant "
        "and reload the browser. Future numbered versions use HACS update checks.\n\n"
        "The attached ZIP is for manual installation; HACS reads the tagged integration "
        "folder directly. See [installation and rollback]"
        f"(https://github.com/{REPOSITORY}/blob/v{version}/docs/installation.md).\n"
    )


class GitHub:
    def __init__(self, token):
        self.token = token

    def request(self, path, method="GET", data=None, missing_ok=False, upload=False):
        host = "uploads.github.com" if upload else "api.github.com"
        body = data if upload else json.dumps(data).encode() if data is not None else None
        request = Request(
            f"https://{host}/repos/{REPOSITORY}/{path}",
            data=body,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/octet-stream" if upload else "application/json",
                "X-GitHub-Api-Version": "2026-03-10",
                "User-Agent": "ha-blast-radius-release",
            },
        )
        try:
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            if missing_ok and error.code == 404:
                return None
            # Never print request headers or tokens, including on permission failures.
            raise RuntimeError(f"GitHub {method} {path}: HTTP {error.code}") from None


def find_release(api, tag):
    page = 1
    while True:
        releases = api.request(f"releases?per_page=100&page={page}")
        for release in releases:
            if release["tag_name"] == tag:
                return release
        if len(releases) < 100:
            return None
        page += 1


def check_target(api, tag, sha):
    if api.request("git/ref/heads/main")["object"]["sha"] != sha:
        raise ValueError("main advanced; only the current, tested main commit may publish")
    ref = api.request(f"git/ref/tags/{tag}", missing_ok=True)
    if ref is None:
        return
    obj = ref["object"]
    for _ in range(8):
        if obj["type"] != "tag":
            break
        obj = api.request(f"git/tags/{obj['sha']}")["object"]
    if obj["type"] != "commit" or obj["sha"] != sha:
        raise ValueError("Existing tag points elsewhere; refusing to move or reuse it")


def publish(api, version, sha, notes, assets):
    current = version_tuple(version)
    tag = f"v{version}"
    release = find_release(api, tag)
    if release and not release["draft"]:
        print(f"{tag} is already published; no changes made")
        return None
    latest = api.request("releases/latest", missing_ok=True)
    if latest and version_tuple(latest["tag_name"].removeprefix("v")) >= current:
        raise ValueError("Refusing to publish an older version as latest")
    check_target(api, tag, sha)
    if release and release["target_commitish"] != sha:
        raise ValueError("An existing draft belongs to a different commit; inspect it manually")
    if release is None:
        release = api.request(
            "releases",
            "POST",
            {
                "tag_name": tag,
                "target_commitish": sha,
                "name": f"{tag} — experimental alpha",
                "body": notes,
                "draft": True,
                "prerelease": False,
            },
        )
    existing = {asset["name"]: asset for asset in release["assets"]}
    if existing.keys() - assets.keys():
        raise ValueError("Draft contains unexpected assets; inspect it manually")
    for name, content in assets.items():
        digest = f"sha256:{hashlib.sha256(content).hexdigest()}"
        if name in existing:
            if existing[name].get("digest") != digest:
                raise ValueError(f"Draft asset differs: {name}; refusing to overwrite it")
            continue
        uploaded = api.request(
            f"releases/{release['id']}/assets?name={quote(name, safe='')}",
            "POST",
            content,
            upload=True,
        )
        if uploaded.get("digest") != digest:
            raise ValueError(f"Uploaded asset checksum mismatch: {name}; draft not published")
    check_target(api, tag, sha)
    result = api.request(
        f"releases/{release['id']}",
        "PATCH",
        {"draft": False, "prerelease": False, "make_latest": "true"},
    )
    print(f"Published {tag}: {result['html_url']}")
    return result


def main():
    if (
        os.environ.get("GITHUB_REPOSITORY") != REPOSITORY
        or os.environ.get("GITHUB_REF") != "refs/heads/main"
        or os.environ.get("GITHUB_EVENT_NAME") not in {"push", "workflow_dispatch"}
    ):
        raise SystemExit("Publishing is allowed only by the trusted main Quality workflow")
    sha = os.environ["GITHUB_SHA"]
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip()
    if head != sha:
        raise SystemExit("Checkout does not match the tested workflow commit")
    version = json.loads((ROOT / "custom_components/blast_radius/manifest.json").read_text())[
        "version"
    ]
    notes = release_notes((ROOT / "CHANGELOG.md").read_text(), version)
    with TemporaryDirectory(prefix="blast-radius-release-") as temporary:
        archive = Path(temporary) / f"ha-blast-radius-v{version}.zip"
        subprocess.run(
            [sys.executable, str(ROOT / "scripts/package_release.py"), "--output", str(archive)],
            check=True,
        )
        content = archive.read_bytes()
        checksum = f"{hashlib.sha256(content).hexdigest()}  {archive.name}\n".encode()
        publish(
            GitHub(os.environ["GITHUB_TOKEN"]),
            version,
            sha,
            notes,
            {archive.name: content, "SHA256SUMS": checksum},
        )


if __name__ == "__main__":
    main()
