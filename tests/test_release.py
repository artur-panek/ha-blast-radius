"""Release automation tests: no network access, no real tokens or GitHub writes."""

import hashlib
import importlib.util
from pathlib import Path
from urllib.error import HTTPError

import pytest

SCRIPT = Path(__file__).parents[1] / "scripts/publish_release.py"
SPEC = importlib.util.spec_from_file_location("publish_release", SCRIPT)
assert SPEC and SPEC.loader
publisher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(publisher)
SHA = "a" * 40
ASSETS = {"ha-blast-radius-v0.1.3.zip": b"synthetic archive", "SHA256SUMS": b"checksum"}


class FakeGitHub:
    def __init__(self):
        self.releases = []
        self.latest = None
        self.head = SHA
        self.tag = None
        self.annotated_target = SHA
        self.calls = []
        self.corrupt_upload = False

    @property
    def writes(self):
        return [call for call in self.calls if call[1] != "GET"]

    def request(self, path, method="GET", data=None, missing_ok=False, upload=False):
        self.calls.append((path, method, data))
        if method == "GET":
            if path.startswith("releases?per_page="):
                return self.releases
            if path == "releases/latest":
                return self.latest
            if path == "git/ref/heads/main":
                return {"object": {"sha": self.head}}
            if path.startswith("git/ref/tags/"):
                return self.tag
            if path.startswith("git/tags/"):
                return {"object": {"type": "commit", "sha": self.annotated_target}}
        if method == "POST" and path == "releases":
            self.releases = [{"id": 7, "assets": [], **data}]
            return self.releases[0]
        if upload:
            digest = "bad" if self.corrupt_upload else hashlib.sha256(data).hexdigest()
            return {"digest": f"sha256:{digest}"}
        if method == "PATCH" and path == "releases/7":
            return {"html_url": "https://github.com/example/repo/releases/tag/v0.1.3", **data}
        raise AssertionError((path, method))


def draft(**kwargs):
    return {
        "id": 7,
        "tag_name": "v0.1.3",
        "draft": True,
        "target_commitish": SHA,
        "assets": [],
        **kwargs,
    }


def test_new_release_stays_draft_until_assets_are_verified():
    api = FakeGitHub()
    result = publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert result["draft"] is False
    assert api.writes[0][2]["draft"] is True
    assert api.writes[0][2]["prerelease"] is False
    assert api.writes[0][2]["target_commitish"] == SHA
    assert [call[1] for call in api.writes] == ["POST", "POST", "POST", "PATCH"]
    assert sum(call[0] == "git/ref/heads/main" for call in api.calls) == 2


def test_published_version_is_never_overwritten():
    api = FakeGitHub()
    api.releases = [draft(draft=False)]
    assert publisher.publish(api, "0.1.3", "b" * 40, "changed notes", ASSETS) is None
    assert api.writes == []


@pytest.mark.parametrize("failure", ["stale_head", "wrong_tag", "wrong_draft", "downgrade"])
def test_conflicts_block_publication_before_any_write(failure):
    api = FakeGitHub()
    if failure == "stale_head":
        api.head = "b" * 40
    elif failure == "wrong_tag":
        api.tag = {"object": {"type": "commit", "sha": "b" * 40}}
    elif failure == "wrong_draft":
        api.releases = [draft(target_commitish="b" * 40)]
    else:
        api.latest = {"tag_name": "v0.1.4"}
    with pytest.raises(ValueError):
        publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert api.writes == []


def test_annotated_tag_is_checked_against_the_commit():
    api = FakeGitHub()
    api.tag = {"object": {"type": "tag", "sha": "c" * 40}}
    assert publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)["draft"] is False


def test_interrupted_draft_resumes_without_reuploading_matching_assets():
    api = FakeGitHub()
    name, content = next(iter(ASSETS.items()))
    api.releases = [
        draft(assets=[{"name": name, "digest": f"sha256:{hashlib.sha256(content).hexdigest()}"}])
    ]
    publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert [call[1] for call in api.writes] == ["POST", "PATCH"]


def test_different_draft_asset_is_not_overwritten():
    api = FakeGitHub()
    api.releases = [draft(assets=[{"name": next(iter(ASSETS)), "digest": "wrong"}])]
    with pytest.raises(ValueError, match="refusing to overwrite"):
        publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert api.writes == []


def test_bad_upload_checksum_leaves_release_unpublished():
    api = FakeGitHub()
    api.corrupt_upload = True
    with pytest.raises(ValueError, match="checksum mismatch"):
        publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert all(call[1] != "PATCH" for call in api.writes)


def test_unexpected_draft_assets_block_publication():
    api = FakeGitHub()
    api.releases = [draft(assets=[{"name": "unexpected.zip"}])]
    with pytest.raises(ValueError, match="unexpected assets"):
        publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert api.writes == []


def test_main_advancing_during_upload_leaves_only_a_draft():
    api = FakeGitHub()
    request = api.request

    def advance_on_upload(*args, **kwargs):
        result = request(*args, **kwargs)
        if kwargs.get("upload"):
            api.head = "b" * 40
        return result

    api.request = advance_on_upload
    with pytest.raises(ValueError, match="main advanced"):
        publisher.publish(api, "0.1.3", SHA, "notes", ASSETS)
    assert all(call[1] != "PATCH" for call in api.writes)


@pytest.mark.parametrize("version", ["1.2", "v1.2.3", "01.2.3", "1.2.3-beta", "1.2.3\n"])
def test_invalid_versions_are_rejected(version):
    with pytest.raises(ValueError):
        publisher.version_tuple(version)


def test_notes_use_only_matching_changelog_section():
    notes = publisher.release_notes(
        "# Changelog\n\n## 0.1.3 — 2026-10-04\n\n- New fix\n\n## 0.1.2 — 2026-10-03\n\n- Old fix\n",
        "0.1.3",
    )
    assert "New fix" in notes and "Old fix" not in notes
    assert "experimental alpha" in notes and "`v0.1.3`" in notes
    with pytest.raises(ValueError, match="changelog"):
        publisher.release_notes("# Changelog\n", "0.1.3")


def test_main_rejects_untrusted_workflow_context(monkeypatch):
    monkeypatch.setenv("GITHUB_REPOSITORY", "someone/else")
    with pytest.raises(SystemExit, match="trusted main"):
        publisher.main()


@pytest.mark.parametrize("status", [403, 404, 500])
def test_api_errors_fail_closed_without_exposing_tokens(monkeypatch, status):
    def fail(request, timeout):
        raise HTTPError(request.full_url, status, "private detail", {}, None)

    monkeypatch.setattr(publisher, "urlopen", fail)
    api = publisher.GitHub("synthetic-token")
    with pytest.raises(RuntimeError, match=f"HTTP {status}") as error:
        api.request("releases")
    assert "synthetic-token" not in str(error.value)
    assert "private detail" not in str(error.value)
    if status == 404:
        assert api.request("releases/latest", missing_ok=True) is None
