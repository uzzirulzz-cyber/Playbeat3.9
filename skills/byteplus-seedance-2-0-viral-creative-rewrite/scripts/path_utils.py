"""Normalize user-supplied media paths coming from agent clients.

Agent clients (Claude Code, Codex Desktop, etc.) inject attached-file paths in
several shapes: raw absolute path, `file://` URL, URL-encoded spaces or CJK,
paths wrapped in quotes/backticks/angle brackets by markdown-quoting agents.
This helper normalizes all of those into a plain filesystem path string so the
downstream logic (`Path(...).expanduser()` + existence check) works.

Leaves http/https URLs untouched.
"""

from __future__ import annotations

from urllib.parse import unquote


_WRAP_PAIRS = ('""', "''", "``", "<>", "()", "[]")


def normalize_media_input(value: str) -> str:
    if not value:
        return value
    text = value.strip()
    for _ in range(2):
        for pair in _WRAP_PAIRS:
            if len(text) >= 2 and text[0] == pair[0] and text[-1] == pair[1]:
                text = text[1:-1].strip()
                break
        else:
            break
    lower = text.lower()
    if lower.startswith("http://") or lower.startswith("https://"):
        return text
    if lower.startswith("file:///"):
        text = text[7:]
    elif lower.startswith("file://"):
        text = text[7:]
    elif lower.startswith("file:/"):
        text = text[5:]
    if "%" in text:
        try:
            text = unquote(text)
        except Exception:
            pass
    return text
