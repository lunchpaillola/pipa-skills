#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  printf 'usage: %s <brief-script.txt> <output.wav> [voice]\n' "$0" >&2
  exit 64
fi

SCRIPT_INPUT="$1"
OUTPUT_WAV="$2"
VOICE="${3:-af_heart}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE_ROOT="${AGENT_AUDIO_BRIEF_CACHE:-$HOME/.cache/agent-audio-brief}"
VENV_DIR="${AGENT_AUDIO_BRIEF_KOKORO_VENV:-$CACHE_ROOT/kokoro-onnx-venv}"
MODEL_DIR="${AGENT_AUDIO_BRIEF_MODEL_DIR:-$CACHE_ROOT/kokoro-models/v1.0}"
MODEL_FILE="$MODEL_DIR/kokoro-v1.0.onnx"
VOICES_FILE="$MODEL_DIR/voices-v1.0.bin"

if [[ ! -f "$SCRIPT_INPUT" ]]; then
  printf 'audio_result.status=blocked\n' >&2
  printf 'audio_result.reason=input script not found: %s\n' "$SCRIPT_INPUT" >&2
  exit 1
fi

if [[ ! -x "$VENV_DIR/bin/python" || ! -s "$MODEL_FILE" || ! -s "$VOICES_FILE" ]]; then
  "$SCRIPT_DIR/setup-kokoro.sh"
fi

PYTHON_BIN="$VENV_DIR/bin/python"
"$PYTHON_BIN" "$SCRIPT_DIR/kokoro_onnx_generate.py" "$SCRIPT_INPUT" "$OUTPUT_WAV" "$MODEL_FILE" "$VOICES_FILE" --voice "$VOICE"

if command -v ffprobe >/dev/null 2>&1; then
  duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUTPUT_WAV")"
else
  duration="$("$PYTHON_BIN" - "$OUTPUT_WAV" <<'PY'
import sys
import soundfile as sf

info = sf.info(sys.argv[1])
print(info.duration)
PY
)"
fi

word_count="$("$PYTHON_BIN" - "$SCRIPT_INPUT" <<'PY'
import re
import sys
from pathlib import Path

text = Path(sys.argv[1]).read_text(encoding="utf-8")
print(len(re.findall(r"\b\w+\b", text)))
PY
)"

"$PYTHON_BIN" - "$duration" "$word_count" <<'PY'
import sys

duration = float(sys.argv[1])
word_count = int(sys.argv[2])

if word_count >= 350 and duration < 90:
    raise SystemExit(
        f"audio duration {duration:.1f}s is suspiciously short for {word_count} words"
    )

if word_count >= 150 and duration < 30:
    raise SystemExit(
        f"audio duration {duration:.1f}s is suspiciously short for {word_count} words"
    )
PY

printf 'audio_result.status=ready\n'
printf 'audio_result.backend=kokoro-onnx\n'
printf 'audio_result.voice=%s\n' "$VOICE"
printf 'audio_result.duration_seconds=%s\n' "$duration"
printf 'audio_result.word_count=%s\n' "$word_count"
