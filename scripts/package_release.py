"""Create a reproducible manual-install ZIP from tracked integration files."""

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output", type=Path, help="New ZIP path; existing files are not overwritten"
    )
    args = parser.parse_args()
    subprocess.run([sys.executable, str(ROOT / "scripts/check_package.py")], check=True)
    manifest = json.loads((ROOT / "custom_components/blast_radius/manifest.json").read_text())
    output = args.output or ROOT / "dist" / f"ha-blast-radius-v{manifest['version']}.zip"
    paths = (
        subprocess.check_output(
            ["git", "ls-files", "-z", "--", "custom_components/blast_radius"], cwd=ROOT
        )
        .decode()
        .split("\0")[:-1]
    )
    if not paths or "custom_components/blast_radius/manifest.json" not in paths:
        raise SystemExit("No tracked integration files found")
    entries = {name: ROOT / name for name in paths}
    entries.update({"LICENSE": ROOT / "LICENSE", "INSTALL.md": ROOT / "docs/installation.md"})
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "x", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, path in sorted(entries.items()):
            if path.is_symlink() or path.suffix not in {".py", ".json", ".js", ".png", ".md", ""}:
                raise SystemExit(f"Unexpected release file: {name}")
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == set(entries)
        assert json.loads(archive.read("custom_components/blast_radius/manifest.json")) == manifest
    print(f"{output}: {len(entries)} files")
    print(f"SHA256 {hashlib.sha256(output.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    main()
