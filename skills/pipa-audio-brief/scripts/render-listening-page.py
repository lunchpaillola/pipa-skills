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
    "AUDIO_DOCK",
    "BROWSER_SPEECH_SCRIPT",
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


def split_paragraphs(text: str) -> list[str]:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text.strip())]
    return [part for part in paragraphs if part]


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if part.strip()]


def sentence_segments(paragraphs: list[str]) -> list[list[str]]:
    return [split_sentences(paragraph) or [paragraph] for paragraph in paragraphs]


def paragraph_html(
    paragraphs: list[str],
    section_segments: list[list[str]] | None = None,
    start_index: int | None = None,
) -> str:
    if not paragraphs:
        return "<p></p>"

    rendered = []
    segment_index = start_index or 0
    for paragraph_index, paragraph in enumerate(paragraphs):
        if section_segments is None or start_index is None:
            rendered.append(f"<p>{html.escape(paragraph)}</p>")
            continue

        spans = []
        for sentence in section_segments[paragraph_index]:
            spans.append(
                f'<span data-speech-segment="{segment_index}">{html.escape(sentence)}</span>'
            )
            segment_index += 1
        rendered.append(f"<p>{' '.join(spans)}</p>")
    return "\n        ".join(rendered)


def browser_speech_dock(segment_count: int = 0) -> str:
    return f"""<nav class=\"audio-dock speech-dock\" aria-label=\"Browser speech controls\">
    <div class=\"speech-status\" aria-live=\"polite\">
      <span id="speech-status" class="duration">Playing 0 of {segment_count}</span>
      <div class=\"speech-progress\" aria-hidden=\"true\"><span id=\"speech-progress-fill\"></span></div>
    </div>
    <div class=\"speech-controls\">
      <button id=\"speech-back\" class=\"icon-only\" type=\"button\" aria-label=\"Back one sentence\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M11 6 5 12l6 6\"/><path d=\"M19 6 13 12l6 6\"/></svg><span>Back</span></button>
      <button id=\"speech-toggle\" class=\"primary\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path data-play-icon d=\"M8 5v14l11-7Z\"/><path data-pause-icon d=\"M8 5v14\" style=\"display:none\"/><path data-pause-icon d=\"M16 5v14\" style=\"display:none\"/></svg><span>Play</span></button>
      <button id=\"speech-forward\" class=\"icon-only\" type=\"button\" aria-label=\"Forward one sentence\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m13 6 6 6-6 6\"/><path d=\"m5 6 6 6-6 6\"/></svg><span>Forward</span></button>
      <button id=\"speech-restart\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 7v6h6\"/><path d=\"M20 17a8 8 0 0 0-14-5.3L4 13\"/></svg><span>Replay</span></button>
      <details id=\"settings-menu\" class=\"speech-menu settings-menu\">
        <summary aria-label=\"Open settings\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 7h10\"/><path d=\"M18 7h2\"/><path d=\"M16 5v4\"/><path d=\"M4 17h2\"/><path d=\"M10 17h10\"/><path d=\"M8 15v4\"/></svg><span>Settings</span></summary>
        <div class=\"speech-panel settings-panel\">
          <div class=\"settings-field\">
            <label for=\"speech-rate\">Speed</label>
            <select id=\"speech-rate\">
              <option value=\"0.85\">0.85x</option>
              <option value=\"1\" selected>1x</option>
              <option value=\"1.15\">1.15x</option>
              <option value=\"1.25\">1.25x</option>
              <option value=\"1.5\">1.5x</option>
            </select>
          </div>
          <div class=\"settings-field\">
            <label for=\"speech-voice\">Voice</label>
            <select id=\"speech-voice\"></select>
          </div>
        </div>
      </details>
    </div>
  </nav>"""


def native_audio_dock(duration_label: str) -> str:
    escaped_duration = html.escape(duration_label)
    return f"""<nav class=\"audio-dock\" aria-label=\"Audio controls\">
    <audio controls preload=\"metadata\">
      <source src=\"audio/brief.wav\" type=\"audio/wav\">
    </audio>
    <span class=\"duration\">{escaped_duration}</span>
  </nav>"""


def browser_speech_script(segments: list[str]) -> str:
    segments_json = json.dumps(segments, ensure_ascii=False)
    return f"""<script>
  const segments = {segments_json};
  const toggle = document.getElementById(\"speech-toggle\");
  const toggleLabel = toggle.querySelector(\"span\");
  const playIcon = toggle.querySelector(\"[data-play-icon]\");
  const pauseIcons = toggle.querySelectorAll(\"[data-pause-icon]\");
  const restart = document.getElementById(\"speech-restart\");
  const back = document.getElementById(\"speech-back\");
  const forward = document.getElementById(\"speech-forward\");
  const status = document.getElementById(\"speech-status\");
  const progressFill = document.getElementById(\"speech-progress-fill\");
  const rateSelect = document.getElementById(\"speech-rate\");
  const settingsMenu = document.getElementById(\"settings-menu\");
  const voiceSelect = document.getElementById(\"speech-voice\");
  let currentIndex = 0;
  let speaking = false;
  let paused = false;
  let runId = 0;
  let voices = [];

  function setToggle(label, icon) {{
    toggleLabel.textContent = label;
    playIcon.style.display = icon === \"play\" ? \"\" : \"none\";
    pauseIcons.forEach((node) => {{ node.style.display = icon === \"pause\" ? \"\" : \"none\"; }});
  }}

  function setActive(index) {{
    document.querySelectorAll(\"[data-speech-segment]\").forEach((node) => {{
      node.classList.toggle(\"is-speaking\", Number(node.dataset.speechSegment) === index);
    }});
    const active = document.querySelector(`[data-speech-segment=\"${{index}}\"]`);
    if (active) active.scrollIntoView({{ block: \"center\", behavior: \"smooth\" }});
    progressFill.style.width = index >= 0 ? `${{Math.min(100, ((index + 1) / segments.length) * 100)}}%` : \"0%\";
  }}

  function loadVoices() {{
    const selectedVoice = voiceSelect.value;
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = \"\";
    const defaultOption = document.createElement(\"option\");
    defaultOption.value = \"\";
    defaultOption.textContent = \"Browser default\";
    voiceSelect.appendChild(defaultOption);
    voices.forEach((voice) => {{
      const option = document.createElement(\"option\");
      option.value = voice.name;
      option.textContent = `${{voice.name}} (${{voice.lang || \"unknown\"}})`;
      voiceSelect.appendChild(option);
    }});
    voiceSelect.value = voices.some((voice) => voice.name === selectedVoice) ? selectedVoice : \"\";
    voiceSelect.disabled = voices.length === 0;
  }}

  function selectVoice() {{
    if (!voiceSelect.value) return null;
    return voices.find((voice) => voice.name === voiceSelect.value) || null;
  }}

  function selectedRate() {{
    return Number.parseFloat(rateSelect.value) || 1.0;
  }}

  function speakFrom(index) {{
    runId += 1;
    const token = runId;
    window.speechSynthesis.cancel();
    if (index >= segments.length) {{
      speaking = false;
      paused = false;
      currentIndex = 0;
      setToggle("Play", "play");
      status.textContent = `Playing 0 of ${{segments.length}}`;
      setActive(-1);
      return;
    }}

    currentIndex = Math.max(0, index);
    const utterance = new SpeechSynthesisUtterance(segments[currentIndex]);
    const voice = selectVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = selectedRate();
    utterance.pitch = 1;
    utterance.onstart = () => {{
      if (token === runId) setActive(currentIndex);
    }};
    utterance.onend = () => {{
      if (token === runId) speakFrom(currentIndex + 1);
    }};
    utterance.onerror = () => {{
      if (token !== runId) return;
      speaking = false;
      paused = false;
      setToggle("Play", "play");
      status.textContent = `Playing 0 of ${{segments.length}}`;
    }};
    speaking = true;
    paused = false;
    setToggle(\"Pause\", \"pause\");
    status.textContent = `Playing ${{currentIndex + 1}} of ${{segments.length}}`;
    window.speechSynthesis.speak(utterance);
  }}

  if (!(\"speechSynthesis\" in window)) {{
    [toggle, restart, back, forward, rateSelect, voiceSelect].forEach((control) => {{ control.disabled = true; }});
    status.textContent = "Speech unavailable";
  }} else {{
    status.textContent = `Playing 0 of ${{segments.length}}`;
    loadVoices();
    window.speechSynthesis.addEventListener(\"voiceschanged\", loadVoices);
  }}

  // Click transcript sentences to jump playback
  document.querySelectorAll(\"[data-speech-segment]\").forEach((node) => {{
    node.addEventListener(\"click\", () => {{
      const index = Number(node.dataset.speechSegment);
      if (!isNaN(index)) speakFrom(index);
    }});
  }});

  // Keyboard shortcuts
  document.addEventListener(\"keydown\", (e) => {{
    if (e.target && [\"BUTTON\", \"INPUT\", \"SELECT\", \"SUMMARY\", \"TEXTAREA\"].includes(e.target.tagName)) return;
    if (e.key === \" \" || e.code === \"Space\") {{
      e.preventDefault();
      toggle.click();
      return;
    }}
    if (e.key === \"ArrowLeft\") {{
      e.preventDefault();
      back.click();
      return;
    }}
    if (e.key === \"ArrowRight\") {{
      e.preventDefault();
      forward.click();
      return;
    }}
    if (e.key === \"Escape\") {{
      e.preventDefault();
      if (settingsMenu.open) {{
        settingsMenu.open = false;
        return;
      }}
      runId += 1;
      window.speechSynthesis.cancel();
      speaking = false;
      paused = false;
      currentIndex = 0;
      setToggle("Play", "play");
      status.textContent = `Playing 0 of ${{segments.length}}`;
      setActive(-1);
    }}
  }});

  document.addEventListener(\"click\", (e) => {{
    if (settingsMenu.open && !settingsMenu.contains(e.target)) settingsMenu.open = false;
  }});

  toggle.addEventListener(\"click\", () => {{
    if (!speaking) {{
      speakFrom(currentIndex);
      return;
    }}
    if (paused) {{
      window.speechSynthesis.resume();
      paused = false;
      setToggle(\"Pause\", \"pause\");
      status.textContent = `Playing ${{currentIndex + 1}} of ${{segments.length}}`;
      return;
    }}
    window.speechSynthesis.pause();
    paused = true;
    setToggle("Resume", "play");
    status.textContent = `Paused at ${{currentIndex + 1}} of ${{segments.length}}`;
  }});

  restart.addEventListener(\"click\", () => speakFrom(0));
  back.addEventListener(\"click\", () => speakFrom(Math.max(0, currentIndex - 1)));
  forward.addEventListener(\"click\", () => speakFrom(Math.min(segments.length - 1, currentIndex + 1)));
  rateSelect.addEventListener(\"change\", () => {{
    if (speaking) speakFrom(currentIndex);
  }});
  voiceSelect.addEventListener(\"change\", () => {{
    if (speaking) speakFrom(currentIndex);
  }});

  window.addEventListener(\"beforeunload\", () => {{
    runId += 1;
    window.speechSynthesis.cancel();
  }});
</script>"""


def render(template: str, data: dict) -> str:
    sections = [
        split_paragraphs(required_string(data, ("brief", "contextAndOverview"))),
        split_paragraphs(required_string(data, ("brief", "theStory"))),
        split_paragraphs(required_string(data, ("brief", "attentionAreas"))),
        split_paragraphs(required_string(data, ("brief", "takeaway"))),
    ]
    segmented_sections = [sentence_segments(section) for section in sections]
    audio_mode = data.get("audio", {}).get("mode", "browser_speech")
    speech_enabled = audio_mode == "browser_speech"

    speech_segments = []
    section_indexes: list[int | None] = []
    for section in segmented_sections:
        if speech_enabled:
            section_indexes.append(len(speech_segments))
            speech_segments.extend(sentence for paragraph in section for sentence in paragraph)
        else:
            section_indexes.append(None)

    if audio_mode == "browser_speech":
        audio_dock = browser_speech_dock(len(speech_segments))
        speech_script = browser_speech_script(speech_segments)
        duration_label = data.get("audio", {}).get("durationLabel", "Browser speech")
    elif audio_mode in {"kokoro", "piper"}:
        duration_label = required_string(data, ("audio", "durationLabel"))
        audio_dock = native_audio_dock(duration_label)
        speech_script = ""
    else:
        raise SystemExit("Expected audio.mode to be browser_speech, kokoro, or piper")

    replacements = {
        "PAGE_TITLE": html.escape(required_string(data, ("pageTitle",))),
        "SHORT_TITLE": html.escape(data.get("shortTitle", "Audio Brief")),
        "SOURCE_LABEL": html.escape(required_string(data, ("source", "label"))),
        "TITLE": html.escape(required_string(data, ("title",))),
        "SUBTITLE": html.escape(required_string(data, ("subtitle",))),
        "CONTEXT_AND_OVERVIEW_PARAGRAPHS": paragraph_html(
            sections[0], segmented_sections[0], section_indexes[0]
        ),
        "THE_STORY_PARAGRAPHS": paragraph_html(
            sections[1], segmented_sections[1], section_indexes[1]
        ),
        "ATTENTION_AREAS_PARAGRAPHS": paragraph_html(
            sections[2], segmented_sections[2], section_indexes[2]
        ),
        "TAKEAWAY_PARAGRAPHS": paragraph_html(
            sections[3], segmented_sections[3], section_indexes[3]
        ),
        "SOURCE_NOTE": html.escape(required_string(data, ("brief", "sourceNote"))),
        "DURATION_LABEL": html.escape(duration_label),
        "AUDIO_DOCK": audio_dock,
        "BROWSER_SPEECH_SCRIPT": speech_script,
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
