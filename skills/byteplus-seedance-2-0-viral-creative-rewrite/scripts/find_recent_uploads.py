#!/usr/bin/env python3
"""Scan common macOS/Linux locations for recently modified image or video files.

Use when the user says something like "the image I just uploaded / downloaded /
saved" but no filesystem path was exposed by the agent client (e.g. Claude Code
TUI, where inline-pasted images have no path). The agent runs this script and
presents the top candidates for the user to confirm which is theirs.

Prints one candidate per line, newest first:
  <mtime ISO>  <size bytes>  <absolute path>

Options:
  --kind image|video|any   (default: any)
  --minutes N              only show files modified within the last N minutes (default: 30)
  --limit N                cap results (default: 10)
  --keyword STR            case-insensitive substring filter on basename
  --dir PATH               add extra directory to scan (can repeat)
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime
from pathlib import Path


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}

DEFAULT_DIRS = [
    Path.home() / "Downloads",
    Path.home() / "Desktop",
    Path.home() / "Pictures",
    Path.home() / "Movies",
    Path("/tmp"),
    Path("/private/tmp"),
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Find recent image/video uploads.")
    p.add_argument("--kind", choices=["image", "video", "any"], default="any")
    p.add_argument("--minutes", type=int, default=30)
    p.add_argument("--limit", type=int, default=10)
    p.add_argument("--keyword", default="")
    p.add_argument("--dir", action="append", default=[])
    return p.parse_args()


def allowed_exts(kind: str) -> set[str]:
    if kind == "image":
        return IMAGE_EXTS
    if kind == "video":
        return VIDEO_EXTS
    return IMAGE_EXTS | VIDEO_EXTS


def scan(directory: Path, exts: set[str], cutoff: float, keyword: str) -> list[tuple[float, int, Path]]:
    results: list[tuple[float, int, Path]] = []
    if not directory.exists():
        return results
    try:
        for root, _dirs, files in os.walk(directory):
            for name in files:
                if name.startswith("."):
                    continue
                if keyword and keyword.lower() not in name.lower():
                    continue
                path = Path(root) / name
                if path.suffix.lower() not in exts:
                    continue
                try:
                    st = path.stat()
                except OSError:
                    continue
                if st.st_mtime < cutoff:
                    continue
                results.append((st.st_mtime, st.st_size, path))
            _dirs[:] = [d for d in _dirs if not d.startswith(".")]
    except PermissionError:
        pass
    return results


def main() -> None:
    args = parse_args()
    exts = allowed_exts(args.kind)
    cutoff = time.time() - args.minutes * 60
    dirs = list(DEFAULT_DIRS) + [Path(d).expanduser() for d in args.dir]
    seen: set[Path] = set()
    dedup_dirs: list[Path] = []
    for d in dirs:
        resolved = d.resolve() if d.exists() else d
        if resolved in seen:
            continue
        seen.add(resolved)
        dedup_dirs.append(d)

    all_hits: list[tuple[float, int, Path]] = []
    seen_files: set[Path] = set()
    for d in dedup_dirs:
        for mtime, size, path in scan(d, exts, cutoff, args.keyword):
            try:
                key = path.resolve()
            except OSError:
                key = path
            if key in seen_files:
                continue
            seen_files.add(key)
            all_hits.append((mtime, size, path))

    all_hits.sort(key=lambda t: t[0], reverse=True)
    if not all_hits:
        print(f"(no {args.kind} files modified in the last {args.minutes} minutes"
              + (f" matching '{args.keyword}'" if args.keyword else "")
              + " under " + ", ".join(str(d) for d in dedup_dirs) + ")", file=sys.stderr)
        sys.exit(1)

    for mtime, size, path in all_hits[: args.limit]:
        stamp = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M")
        print(f"{stamp}\t{size}\t{path}")


if __name__ == "__main__":
    main()
