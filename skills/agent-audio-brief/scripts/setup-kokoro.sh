#!/usr/bin/env bash
set -euo pipefail

CACHE_ROOT="${AGENT_AUDIO_BRIEF_CACHE:-$HOME/.cache/agent-audio-brief}"
VENV_DIR="${AGENT_AUDIO_BRIEF_KOKORO_VENV:-$CACHE_ROOT/kokoro-onnx-venv}"
MODEL_VARIANT="${AGENT_AUDIO_BRIEF_MODEL_VARIANT:-int8}"
MODEL_DIR="${AGENT_AUDIO_BRIEF_MODEL_DIR:-$CACHE_ROOT/kokoro-models/v1.0-$MODEL_VARIANT}"
MODEL_FILE="${AGENT_AUDIO_BRIEF_MODEL_FILE:-$MODEL_DIR/kokoro-v1.0.$MODEL_VARIANT.onnx}"
VOICES_FILE="$MODEL_DIR/voices-v1.0.bin"
KOKORO_ONNX_VERSION="${AGENT_AUDIO_BRIEF_KOKORO_ONNX_VERSION:-0.5.0}"
SOUNDFILE_VERSION="${AGENT_AUDIO_BRIEF_SOUNDFILE_VERSION:-0.13.1}"

case "$MODEL_VARIANT" in
  int8)
    DEFAULT_MODEL_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx"
    ;;
  fp16)
    DEFAULT_MODEL_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.fp16.onnx"
    ;;
  fp32|full)
    DEFAULT_MODEL_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
    MODEL_FILE="${AGENT_AUDIO_BRIEF_MODEL_FILE:-$MODEL_DIR/kokoro-v1.0.onnx}"
    ;;
  *)
    printf 'setup_result.status=blocked\n' >&2
    printf 'setup_result.reason=unsupported AGENT_AUDIO_BRIEF_MODEL_VARIANT: %s\n' "$MODEL_VARIANT" >&2
    exit 1
    ;;
esac

MODEL_URL="${AGENT_AUDIO_BRIEF_MODEL_URL:-$DEFAULT_MODEL_URL}"
VOICES_URL="${AGENT_AUDIO_BRIEF_VOICES_URL:-https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin}"

log() {
  printf '%s\n' "$*" >&2
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

download_if_missing() {
  local url="$1"
  local destination="$2"

  if [[ -s "$destination" ]]; then
    return 0
  fi

  if ! has_command curl; then
    log "setup_result.status=blocked"
    log "setup_result.reason=curl is required to download Kokoro model files"
    exit 1
  fi

  log "Downloading $(basename "$destination")..."
  local tmp_destination
  tmp_destination="$(mktemp "${destination}.tmp.XXXXXX")"
  if ! curl -fL --retry 2 --retry-delay 2 -o "$tmp_destination" "$url"; then
    rm -f "$tmp_destination"
    return 1
  fi
  mv "$tmp_destination" "$destination"
}

venv_python_is_supported() {
  "$VENV_DIR/bin/python" - <<'PY'
import sys

version = sys.version_info[:2]
raise SystemExit(0 if (3, 10) <= version < (3, 14) else 1)
PY
}

create_venv() {
  if [[ -x "$VENV_DIR/bin/python" ]]; then
    if venv_python_is_supported; then
      return 0
    fi

    if [[ -n "${AGENT_AUDIO_BRIEF_KOKORO_VENV:-}" ]]; then
      log "setup_result.status=blocked"
      log "setup_result.reason=AGENT_AUDIO_BRIEF_KOKORO_VENV points to an unsupported Python. Use Python 3.10-3.13, preferably Python 3.12."
      exit 1
    fi

    log "Removing unsupported cached Kokoro venv..."
    rm -rf "$VENV_DIR"
  fi

  mkdir -p "$(dirname "$VENV_DIR")"

  if has_command uv; then
    log "Creating Kokoro venv with uv-managed Python 3.12..."
    uv python install 3.12
    uv venv --python 3.12 "$VENV_DIR"
    return 0
  fi

  for python_bin in python3.12 python3.11 python3.10 python3 python; do
    if ! has_command "$python_bin"; then
      continue
    fi

    if "$python_bin" - <<'PY'
import sys

version = sys.version_info[:2]
raise SystemExit(0 if (3, 10) <= version < (3, 14) else 1)
PY
    then
      log "Creating Kokoro venv with $python_bin..."
      "$python_bin" -m venv "$VENV_DIR"
      return 0
    fi
  done

  log "setup_result.status=blocked"
  log "setup_result.reason=Install uv or Python 3.10-3.13 to create the managed Kokoro backend. Do not use Python 3.14 for Kokoro generation."
  exit 1
}

create_venv

PYTHON_BIN="$VENV_DIR/bin/python"

log "Installing pinned Kokoro backend..."
"$PYTHON_BIN" -m pip install --upgrade pip
"$PYTHON_BIN" -m pip install "kokoro-onnx==$KOKORO_ONNX_VERSION" "soundfile==$SOUNDFILE_VERSION"

mkdir -p "$MODEL_DIR"
download_if_missing "$MODEL_URL" "$MODEL_FILE"
download_if_missing "$VOICES_URL" "$VOICES_FILE"

"$PYTHON_BIN" - "$MODEL_FILE" "$VOICES_FILE" <<'PY'
import pathlib
import sys

from kokoro_onnx import Kokoro
import soundfile  # noqa: F401

for value in sys.argv[1:]:
    path = pathlib.Path(value)
    if not path.is_file() or path.stat().st_size == 0:
        raise SystemExit(f"missing or empty Kokoro asset: {path}")

Kokoro(sys.argv[1], sys.argv[2])
PY

printf 'setup_result.status=ready\n'
printf 'setup_result.backend=kokoro-onnx\n'
printf 'setup_result.venv=%s\n' "$VENV_DIR"
printf 'setup_result.model=%s\n' "$MODEL_FILE"
printf 'setup_result.voices=%s\n' "$VOICES_FILE"
