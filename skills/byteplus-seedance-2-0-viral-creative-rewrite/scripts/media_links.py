#!/usr/bin/env python3
"""Render markdown for a media item under a chosen client style.

Three styles, selected by the launcher per client (see --media-style):

- codex (default): `![alt](forward-slash path)` — Codex Desktop and Claude Code both render
  this as an inline image/video preview. This is the skill's validated default and should
  stay the default in every known agent client.
- link: `[alt](file:// or http url)` — a clickable hyperlink. Only use in clients that
  render `![](path)` as literal plain text and cannot inline-embed local media. `file://`
  links do NOT open by clicking in Claude Code, so do not switch to this style there.
- both: emit both lines (inline preview plus a clickable link, for unknown clients).

Backslash Windows paths are never valid markdown URLs; the link form percent-encodes spaces /
non-ASCII via urllib so paths like ".../a b/草莓.mp4" do not break.
"""

from __future__ import annotations

from urllib.request import pathname2url


def _is_url(target: str) -> bool:
    return target.startswith(("http://", "https://", "file://"))


def _forward_slash(target: str) -> str:
    """Bare path with forward slashes (Codex embed form). No-op on URLs / POSIX paths."""
    return target.replace("\\", "/")


def _href(target: str) -> str:
    """A real URL for the link form: pass through http(s)/file URLs, else build a file:// URL
    with proper percent-encoding for spaces and non-ASCII characters."""
    if _is_url(target):
        return target.replace("\\", "/")
    return "file:" + pathname2url(target)


def media_markdown(alt: str, target, *, style: str = "codex") -> str:
    """Return the markdown snippet (no trailing newline) for one media item."""
    target = str(target)
    embed = f"![{alt}]({_forward_slash(target)})"
    link = f"[{alt}]({_href(target)})"
    if style == "link":
        return link
    if style == "both":
        return f"{embed}\n{link}"
    return embed  # codex (default)
