#!/usr/bin/env python3
"""Render the deterministic audio-brief listening page from a JSON contract."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path


PLACEHOLDERS = {
    "PAGE_TITLE",
    "SHORT_TITLE",
    "SOURCE_LABEL",
    "TITLE",
    "SUBTITLE",
    "CONTEXT_AND_OVERVIEW_PARAGRAPHS",
    "THE_STORY_PARAGRAPHS",
    "ATTENTION_AREAS_PARAGRAPHS",
    "TAKEAWAY_PARAGRAPHS",
    "SOURCE_NOTE",
    "DURATION_LABEL",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render publish/index.html for an agent audio brief."
    )
    parser.add_argument("contract", help="Path to the JSON page contract")
    parser.add_argument("output", help="Path to write index.html")
    parser.add_argument(
        "--template",
        default=str(
            Path(__file__).resolve().parents[1]
            / "references"
            / "listening-page-template.md"
        ),
        help="Path to references/listening-page-template.md",
    )
    return parser.parse_args()


def load_template(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"```html\n(.*?)\n```", text, re.DOTALL)
    if not match:
        raise SystemExit(f"No HTML template block found in {path}")
    return match.group(1)


def required_string(data: dict, path: tuple[str, ...]) -> str:
    current = data
    for key in path:
        if not isinstance(current, dict) or key not in current:
            joined = ".".join(path)
            raise SystemExit(f"Missing required page contract field: {joined}")
        current = current[key]
    if not isinstance(current, str):
        joined = ".".join(path)
        raise SystemExit(f"Expected string page contract field: {joined}")
    return current


def paragraph_html(text: str) -> str:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text.strip())]
    paragraphs = [part for part in paragraphs if part]
    if not paragraphs:
        return "<p></p>"
    return "\n        ".join(f"<p>{html.escape(part)}</p>" for part in paragraphs)


def render(template: str, data: dict) -> str:
    replacements = {
        "PAGE_TITLE": html.escape(required_string(data, ("pageTitle",))),
        "SHORT_TITLE": html.escape(data.get("shortTitle", "Audio Brief")),
        "SOURCE_LABEL": html.escape(required_string(data, ("source", "label"))),
        "TITLE": html.escape(required_string(data, ("title",))),
        "SUBTITLE": html.escape(required_string(data, ("subtitle",))),
        "CONTEXT_AND_OVERVIEW_PARAGRAPHS": paragraph_html(
            required_string(data, ("brief", "contextAndOverview"))
        ),
        "THE_STORY_PARAGRAPHS": paragraph_html(
            required_string(data, ("brief", "theStory"))
        ),
        "ATTENTION_AREAS_PARAGRAPHS": paragraph_html(
            required_string(data, ("brief", "attentionAreas"))
        ),
        "TAKEAWAY_PARAGRAPHS": paragraph_html(
            required_string(data, ("brief", "takeaway"))
        ),
        "SOURCE_NOTE": html.escape(required_string(data, ("brief", "sourceNote"))),
        "DURATION_LABEL": html.escape(required_string(data, ("audio", "durationLabel"))),
    }

    missing = PLACEHOLDERS - set(replacements)
    if missing:
        raise SystemExit(f"Renderer missing placeholders: {', '.join(sorted(missing))}")

    rendered = template
    for key, value in replacements.items():
        rendered = rendered.replace("{{" + key + "}}", value)

    unresolved = sorted(set(re.findall(r"{{([A-Z0-9_]+)}}", rendered)))
    if unresolved:
        raise SystemExit(f"Unresolved template placeholders: {', '.join(unresolved)}")

    return rendered


def main() -> int:
    args = parse_args()
    contract_path = Path(args.contract)
    output_path = Path(args.output)
    template_path = Path(args.template)

    data = json.loads(contract_path.read_text(encoding="utf-8"))
    rendered = render(load_template(template_path), data)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(rendered + "\n", encoding="utf-8")
    print(f"page_result.status=ready")
    print(f"page_result.output={output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
