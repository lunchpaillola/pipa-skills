#!/usr/bin/env bash
set -euo pipefail

CACHE_ROOT="${PIPA_AUDIO_BRIEF_CACHE:-$HOME/.cache/pipa-audio-brief}"
VENV_DIR="${PIPA_AUDIO_BRIEF_PIPER_VENV:-$CACHE_ROOT/piper-venv}"
MODEL_NAME="${PIPA_AUDIO_BRIEF_PIPER_MODEL_NAME:-en_US-libritts_r-medium}"
MODEL_DIR="${PIPA_AUDIO_BRIEF_PIPER_MODEL_DIR:-$CACHE_ROOT/piper-models/$MODEL_NAME}"
MODEL_FILE="${PIPA_AUDIO_BRIEF_PIPER_MODEL_FILE:-$MODEL_DIR/$MODEL_NAME.onnx}"
CONFIG_FILE="${PIPA_AUDIO_BRIEF_PIPER_CONFIG_FILE:-$MODEL_DIR/$MODEL_NAME.onnx.json}"
PIPER_TTS_VERSION="${PIPA_AUDIO_BRIEF_PIPER_TTS_VERSION:-1.4.2}"

DEFAULT_MODEL_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx?download=true"
DEFAULT_CONFIG_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx.json?download=true"
MODEL_URL="${PIPA_AUDIO_BRIEF_PIPER_MODEL_URL:-$DEFAULT_MODEL_URL}"
CONFIG_URL="${PIPA_AUDIO_BRIEF_PIPER_CONFIG_URL:-$DEFAULT_CONFIG_URL}"

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
    log "setup_result.reason=curl is required to download Piper model files"
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

    if [[ -n "${PIPA_AUDIO_BRIEF_PIPER_VENV:-}" ]]; then
      log "setup_result.status=blocked"
      log "setup_result.reason=PIPA_AUDIO_BRIEF_PIPER_VENV points to an unsupported Python. Use Python 3.10-3.13, preferably Python 3.12."
      exit 1
    fi

    log "Removing unsupported cached Piper venv..."
    rm -rf "$VENV_DIR"
  fi

  mkdir -p "$(dirname "$VENV_DIR")"

  if has_command uv; then
    log "Creating Piper venv with uv-managed Python 3.12..."
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
      log "Creating Piper venv with $python_bin..."
      "$python_bin" -m venv "$VENV_DIR"
      return 0
    fi
  done

  log "setup_result.status=blocked"
  log "setup_result.reason=Install uv or Python 3.10-3.13 to create the managed Piper backend. Do not use Python 3.14 for Piper generation."
  exit 1
}

create_venv

PYTHON_BIN="$VENV_DIR/bin/python"
PIPER_BIN="$VENV_DIR/bin/piper"

log "Installing pinned Piper backend..."
"$PYTHON_BIN" -m pip install --upgrade pip
"$PYTHON_BIN" -m pip install "piper-tts==$PIPER_TTS_VERSION"

mkdir -p "$MODEL_DIR" "$(dirname "$MODEL_FILE")" "$(dirname "$CONFIG_FILE")"
download_if_missing "$MODEL_URL" "$MODEL_FILE"
download_if_missing "$CONFIG_URL" "$CONFIG_FILE"

"$PIPER_BIN" --help >/dev/null

for value in "$MODEL_FILE" "$CONFIG_FILE"; do
  if [[ ! -s "$value" ]]; then
    log "setup_result.status=blocked"
    log "setup_result.reason=missing or empty Piper asset: $value"
    exit 1
  fi
done

printf 'setup_result.status=ready\n'
printf 'setup_result.backend=piper\n'
printf 'setup_result.venv=%s\n' "$VENV_DIR"
printf 'setup_result.model=%s\n' "$MODEL_FILE"
printf 'setup_result.config=%s\n' "$CONFIG_FILE"
