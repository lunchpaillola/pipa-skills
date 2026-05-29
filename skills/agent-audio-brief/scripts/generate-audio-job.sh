#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE_ROOT="${AGENT_AUDIO_BRIEF_CACHE:-$HOME/.cache/agent-audio-brief}"
JOB_ROOT="${AGENT_AUDIO_BRIEF_JOB_DIR:-$CACHE_ROOT/jobs}"

usage() {
  printf 'usage: %s start <brief-script.txt> <output.wav> [voice]\n' "$0" >&2
  printf '       %s status <job-id>\n' "$0" >&2
  printf '       %s wait <job-id> [poll-seconds]\n' "$0" >&2
  printf '       %s stop <job-id>\n' "$0" >&2
  exit 64
}

log_kv() {
  printf 'audio_job.%s=%s\n' "$1" "$2"
}

absolute_path() {
  local path="$1"
  local dir
  local base
  dir="$(dirname "$path")"
  base="$(basename "$path")"
  mkdir -p "$dir"
  printf '%s/%s\n' "$(cd "$dir" && pwd)" "$base"
}

job_dir_for() {
  local job_id="$1"
  case "$job_id" in
    *[!A-Za-z0-9._-]*|'')
      printf 'audio_job.status=blocked\n' >&2
      printf 'audio_job.reason=invalid job id: %s\n' "$job_id" >&2
      exit 1
      ;;
  esac
  printf '%s/%s\n' "$JOB_ROOT" "$job_id"
}

read_field() {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  while IFS='=' read -r current_key current_value; do
    if [[ "$current_key" == "$key" ]]; then
      printf '%s\n' "$current_value"
      return 0
    fi
  done < "$file"
  return 1
}

write_status() {
  local job_dir="$1"
  local status="$2"
  local reason="${3:-}"
  {
    printf 'status=%s\n' "$status"
    printf 'updated_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    if [[ -n "$reason" ]]; then
      printf 'reason=%s\n' "$reason"
    fi
  } > "$job_dir/status"
}

find_python() {
  for python_bin in python3.12 python3.11 python3.10 python3 python; do
    if command -v "$python_bin" >/dev/null 2>&1; then
      printf '%s\n' "$python_bin"
      return 0
    fi
  done
  return 1
}

run_generation() {
  if [[ $# -lt 2 || $# -gt 3 ]]; then
    usage
  fi

  local script_input="$1"
  local output_wav="$2"
  local voice="${3:-af_heart}"
  local venv_dir="${AGENT_AUDIO_BRIEF_KOKORO_VENV:-$CACHE_ROOT/kokoro-onnx-venv}"
  local model_variant="${AGENT_AUDIO_BRIEF_MODEL_VARIANT:-int8}"
  local model_dir="${AGENT_AUDIO_BRIEF_MODEL_DIR:-$CACHE_ROOT/kokoro-models/v1.0-$model_variant}"
  local model_file="${AGENT_AUDIO_BRIEF_MODEL_FILE:-$model_dir/kokoro-v1.0.$model_variant.onnx}"
  if [[ "$model_variant" == "fp32" || "$model_variant" == "full" ]]; then
    model_file="${AGENT_AUDIO_BRIEF_MODEL_FILE:-$model_dir/kokoro-v1.0.onnx}"
  fi
  local voices_file="$model_dir/voices-v1.0.bin"
  local max_phonemes="${AGENT_AUDIO_BRIEF_MAX_PHONEMES:-100}"
  local max_words="${AGENT_AUDIO_BRIEF_MAX_WORDS:-500}"
  local generation_timeout_seconds="${AGENT_AUDIO_BRIEF_GENERATION_TIMEOUT_SECONDS:-600}"

  export OMP_NUM_THREADS="${OMP_NUM_THREADS:-1}"
  export OPENBLAS_NUM_THREADS="${OPENBLAS_NUM_THREADS:-1}"
  export MKL_NUM_THREADS="${MKL_NUM_THREADS:-1}"
  export NUMEXPR_NUM_THREADS="${NUMEXPR_NUM_THREADS:-1}"

  if [[ ! -f "$script_input" ]]; then
    printf 'audio_result.status=blocked\n' >&2
    printf 'audio_result.reason=input script not found: %s\n' "$script_input" >&2
    exit 1
  fi

  local system_python
  system_python="$(find_python || true)"
  if [[ -z "$system_python" ]]; then
    printf 'audio_result.status=blocked\n' >&2
    printf 'audio_result.reason=Python 3 is required to validate the script before audio generation\n' >&2
    exit 1
  fi

  local word_count
  word_count="$($system_python - "$script_input" <<'PY'
import re
import sys
from pathlib import Path

text = Path(sys.argv[1]).read_text(encoding="utf-8")
print(len(re.findall(r"\b\w+\b", text)))
PY
)"

  if [[ "$word_count" -gt "$max_words" ]]; then
    printf 'audio_result.status=blocked\n' >&2
    printf 'audio_result.reason=script has %s words; trim to %s words or less before Kokoro generation\n' "$word_count" "$max_words" >&2
    printf 'audio_result.word_count=%s\n' "$word_count" >&2
    printf 'audio_result.max_words=%s\n' "$max_words" >&2
    exit 1
  fi

  printf 'audio_result.preflight=ok\n' >&2
  printf 'audio_result.word_count=%s\n' "$word_count" >&2

  if [[ ! -x "$venv_dir/bin/python" || ! -s "$model_file" || ! -s "$voices_file" ]]; then
    printf 'audio_result.progress=setting_up_kokoro\n' >&2
    "$SCRIPT_DIR/setup-kokoro.sh"
  fi

  local python_bin="$venv_dir/bin/python"
  printf 'audio_result.progress=generating_audio\n' >&2
  local generate_command=("$python_bin" "$SCRIPT_DIR/kokoro_onnx_generate.py" "$script_input" "$output_wav" "$model_file" "$voices_file" --voice "$voice" --max-phonemes "$max_phonemes")
  if command -v timeout >/dev/null 2>&1; then
    timeout "$generation_timeout_seconds" "${generate_command[@]}"
  elif command -v gtimeout >/dev/null 2>&1; then
    gtimeout "$generation_timeout_seconds" "${generate_command[@]}"
  else
    printf 'audio_result.progress=no_timeout_command_available\n' >&2
    "${generate_command[@]}"
  fi
  printf 'audio_result.progress=checking_duration\n' >&2

  local duration
  if command -v ffprobe >/dev/null 2>&1; then
    duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$output_wav")"
  else
    duration="$($system_python - "$output_wav" <<'PY'
import sys
import wave

with wave.open(sys.argv[1], "rb") as audio:
    print(audio.getnframes() / audio.getframerate())
PY
)"
  fi

  "$system_python" - "$duration" "$word_count" <<'PY'
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
  printf 'audio_result.model_variant=%s\n' "$model_variant"
  printf 'audio_result.max_phonemes=%s\n' "$max_phonemes"
  printf 'audio_result.max_words=%s\n' "$max_words"
  printf 'audio_result.generation_timeout_seconds=%s\n' "$generation_timeout_seconds"
  printf 'audio_result.voice=%s\n' "$voice"
  printf 'audio_result.duration_seconds=%s\n' "$duration"
  printf 'audio_result.word_count=%s\n' "$word_count"
}

start_job() {
  if [[ $# -lt 2 || $# -gt 3 ]]; then
    usage
  fi

  local input="$1"
  local output="$2"
  local voice="${3:-af_heart}"

  if [[ ! -f "$input" ]]; then
    printf 'audio_job.status=blocked\n' >&2
    printf 'audio_job.reason=input script not found: %s\n' "$input" >&2
    exit 1
  fi

  mkdir -p "$JOB_ROOT"

  local job_id
  job_id="job-$(date -u +%Y%m%dT%H%M%SZ)-$$-$RANDOM"
  local job_dir="$JOB_ROOT/$job_id"
  mkdir -p "$job_dir"

  local input_abs
  local output_abs
  input_abs="$(absolute_path "$input")"
  output_abs="$(absolute_path "$output")"

  {
    printf 'job_id=%s\n' "$job_id"
    printf 'input=%s\n' "$input_abs"
    printf 'output=%s\n' "$output_abs"
    printf 'voice=%s\n' "$voice"
    printf 'started_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf 'generator=%s/generate-audio-job.sh\n' "$SCRIPT_DIR"
  } > "$job_dir/metadata"

  write_status "$job_dir" "running"

  nohup bash -c '
    set +e
    job_dir="$1"
    generator="$2"
    input="$3"
    output="$4"
    voice="$5"

    "$generator" _run "$input" "$output" "$voice" > "$job_dir/stdout.log" 2> "$job_dir/stderr.log"
    exit_code=$?
    printf "exit_code=%s\n" "$exit_code" > "$job_dir/exit_code"
    printf "finished_at=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$job_dir/finished_at"
    if [[ "$exit_code" -eq 0 ]]; then
      {
        printf "status=ready\n"
        printf "updated_at=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      } > "$job_dir/status"
    else
      reason="generation failed with exit code $exit_code"
      if [[ -s "$job_dir/stderr.log" ]]; then
        while IFS="=" read -r key value; do
          if [[ "$key" == "audio_result.reason" ]]; then
            reason="$value"
            break
          fi
        done < "$job_dir/stderr.log"
      fi
      {
        printf "status=failed\n"
        printf "updated_at=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        printf "reason=%s\n" "$reason"
      } > "$job_dir/status"
    fi
  ' _ "$job_dir" "$SCRIPT_DIR/generate-audio-job.sh" "$input_abs" "$output_abs" "$voice" >/dev/null 2>&1 &

  local pid="$!"
  printf '%s\n' "$pid" > "$job_dir/pid"

  log_kv status "running"
  log_kv job_id "$job_id"
  log_kv pid "$pid"
  log_kv job_dir "$job_dir"
  log_kv output "$output_abs"
  log_kv status_command "$0 status $job_id"
}

status_job() {
  if [[ $# -ne 1 ]]; then
    usage
  fi

  local job_id="$1"
  local job_dir
  job_dir="$(job_dir_for "$job_id")"
  if [[ ! -d "$job_dir" ]]; then
    log_kv status "missing"
    log_kv job_id "$job_id"
    exit 1
  fi

  local status="unknown"
  status="$(read_field "$job_dir/status" status || printf 'unknown')"

  if [[ "$status" == "running" && -f "$job_dir/pid" ]]; then
    local pid
    pid="$(cat "$job_dir/pid")"
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      if [[ -f "$job_dir/exit_code" ]]; then
        :
      else
        write_status "$job_dir" "failed" "generation process exited without writing a result"
        status="failed"
      fi
    fi
  fi

  log_kv status "$status"
  log_kv job_id "$job_id"
  log_kv job_dir "$job_dir"

  if [[ -f "$job_dir/pid" ]]; then
    log_kv pid "$(cat "$job_dir/pid")"
  fi
  if [[ -f "$job_dir/metadata" ]]; then
    while IFS='=' read -r key value; do
      case "$key" in
        output|voice|started_at)
          log_kv "$key" "$value"
          ;;
      esac
    done < "$job_dir/metadata"
  fi
  if [[ -f "$job_dir/status" ]]; then
    while IFS='=' read -r key value; do
      case "$key" in
        updated_at|reason)
          log_kv "$key" "$value"
          ;;
      esac
    done < "$job_dir/status"
  fi
  if [[ -f "$job_dir/exit_code" ]]; then
    log_kv exit_code "$(read_field "$job_dir/exit_code" exit_code || true)"
  fi
  if [[ -f "$job_dir/stdout.log" ]]; then
    log_kv stdout_log "$job_dir/stdout.log"
  fi
  if [[ -f "$job_dir/stderr.log" ]]; then
    log_kv stderr_log "$job_dir/stderr.log"
  fi
}

wait_job() {
  if [[ $# -lt 1 || $# -gt 2 ]]; then
    usage
  fi

  local job_id="$1"
  local poll_seconds="${2:-5}"
  local status
  local status_output

  while true; do
    status_output="$(status_job "$job_id")"
    printf '%s\n' "$status_output"
    status="$(printf '%s\n' "$status_output" | while IFS='=' read -r key value; do
      if [[ "$key" == "audio_job.status" ]]; then
        printf '%s\n' "$value"
        break
      fi
    done)"
    if [[ "$status" != "running" ]]; then
      break
    fi
    sleep "$poll_seconds"
  done
}

stop_job() {
  if [[ $# -ne 1 ]]; then
    usage
  fi

  local job_id="$1"
  local job_dir
  job_dir="$(job_dir_for "$job_id")"
  if [[ ! -d "$job_dir" ]]; then
    log_kv status "missing"
    log_kv job_id "$job_id"
    exit 1
  fi
  if [[ -f "$job_dir/pid" ]]; then
    local pid
    pid="$(cat "$job_dir/pid")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid"
    fi
  fi
  write_status "$job_dir" "stopped"
  status_job "$job_id"
}

if [[ $# -lt 1 ]]; then
  usage
fi

command_name="$1"
shift

case "$command_name" in
  start)
    start_job "$@"
    ;;
  status)
    status_job "$@"
    ;;
  wait)
    wait_job "$@"
    ;;
  stop)
    stop_job "$@"
    ;;
  _run)
    run_generation "$@"
    ;;
  *)
    usage
    ;;
esac
