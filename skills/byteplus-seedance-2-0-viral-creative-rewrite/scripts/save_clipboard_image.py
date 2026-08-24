#!/usr/bin/env python3
"""Extract a bitmap image from the system clipboard and save it to a file.

Solves the Claude Code TUI (and similar) problem where inline-pasted or
dragged images arrive as vision content only, with no filesystem path.
The user can `Cmd+C` (or Ctrl+C) an image in any application; running this
script writes it out and prints the absolute path so the skill can use it.

Usage:
  save_clipboard_image.py [--output PATH]

Defaults to `~/Downloads/clipboard_<timestamp>.png`.
Exits 0 with the absolute path on stdout when successful, exits 1 on error.

Supported platforms:
  - macOS: pure `osascript`, no dependencies
  - Linux (Wayland): `wl-paste --type image/png`
  - Linux (X11): `xclip -selection clipboard -t image/png -o`
"""

from __future__ import annotations

import argparse
import os
import platform
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def default_output_path() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return Path.home() / "Downloads" / f"clipboard_{stamp}.png"


def extract_macos(dest: Path) -> None:
    dest_posix = str(dest)
    script = (
        'try\n'
        '  set imgData to (the clipboard as «class PNGf»)\n'
        f'  set fp to open for access POSIX file "{dest_posix}" with write permission\n'
        '  set eof fp to 0\n'
        '  write imgData to fp\n'
        '  close access fp\n'
        '  return "OK"\n'
        'on error errMsg\n'
        '  return "ERR: " & errMsg\n'
        'end try'
    )
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True, text=True, check=False,
    )
    output = (result.stdout or "").strip()
    if result.returncode != 0 or not output.startswith("OK"):
        detail = output or (result.stderr or "").strip() or "no image in clipboard"
        raise SystemExit(
            "Clipboard has no image content. Copy an image first (Cmd+C in Preview, "
            "a browser, Finder, or take a screenshot), then rerun.\n"
            f"osascript detail: {detail}"
        )


def extract_linux(dest: Path) -> None:
    if shutil.which("wl-paste"):
        cmd = ["wl-paste", "--type", "image/png"]
    elif shutil.which("xclip"):
        cmd = ["xclip", "-selection", "clipboard", "-t", "image/png", "-o"]
    else:
        raise SystemExit(
            "Neither wl-paste (Wayland) nor xclip (X11) is installed. "
            "Install one, or save the image to a file and pass its path directly."
        )
    with open(dest, "wb") as fh:
        result = subprocess.run(cmd, stdout=fh, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0 or dest.stat().st_size == 0:
        try:
            dest.unlink()
        except OSError:
            pass
        raise SystemExit(
            "Clipboard has no image content. Copy an image first (Ctrl+C in an image "
            "viewer, a browser, or a file manager), then rerun."
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Save clipboard image to a file.")
    parser.add_argument("--output", "-o", help="Output PNG path (default: ~/Downloads/clipboard_<ts>.png)")
    args = parser.parse_args()

    dest = Path(args.output).expanduser().resolve() if args.output else default_output_path()
    dest.parent.mkdir(parents=True, exist_ok=True)

    system = platform.system()
    if system == "Darwin":
        extract_macos(dest)
    elif system == "Linux":
        extract_linux(dest)
    else:
        raise SystemExit(
            f"Clipboard image extraction not implemented for {system!r}. "
            "Save the image to a file and pass its path directly."
        )

    if not dest.exists() or dest.stat().st_size == 0:
        raise SystemExit(f"Failed to write clipboard image to {dest}")

    print(str(dest))


if __name__ == "__main__":
    main()
