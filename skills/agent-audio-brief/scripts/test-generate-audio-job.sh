#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATOR="$SCRIPT_DIR/generate-audio-job.sh"

TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/agent-audio-brief-job-test.XXXXXX")"
trap 'rm -rf "$TMP_ROOT"' EXIT

export AGENT_AUDIO_BRIEF_JOB_DIR="$TMP_ROOT/jobs"
mkdir -p "$AGENT_AUDIO_BRIEF_JOB_DIR"

fail() {
  printf 'not ok - %s\n' "$1" >&2
  exit 1
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"

  if [[ "$haystack" != *"$needle"* ]]; then
    fail "$label: expected to find $needle in: $haystack"
  fi
}

dead_pid() {
  (exit 0) &
  local pid="$!"
  wait "$pid" || true
  printf '%s\n' "$pid"
}

make_job() {
  local job_id="$1"
  local status="$2"
  local pid="$3"
  local output="$TMP_ROOT/$job_id/brief.wav"
  local job_dir="$AGENT_AUDIO_BRIEF_JOB_DIR/$job_id"

  mkdir -p "$(dirname "$output")" "$job_dir"
  {
    printf 'job_id=%s\n' "$job_id"
    printf 'input=%s\n' "$TMP_ROOT/$job_id/script.txt"
    printf 'output=%s\n' "$output"
    printf 'voice=af_heart\n'
    printf 'started_at=2026-05-29T00:00:00Z\n'
    printf 'generator=%s\n' "$GENERATOR"
  } > "$job_dir/metadata"
  {
    printf 'status=%s\n' "$status"
    printf 'updated_at=2026-05-29T00:00:00Z\n'
  } > "$job_dir/status"
  printf '%s\n' "$pid" > "$job_dir/pid"
  printf '%s\n' "$output"
}

test_wait_timeout_is_structured() {
  local output stderr_file rc
  make_job "running-timeout" "running" "$$" >/dev/null
  stderr_file="$TMP_ROOT/wait-timeout.stderr"

  set +e
  output="$($GENERATOR wait "running-timeout" 1 0 2>"$stderr_file")"
  rc="$?"
  set -e

  [[ "$rc" -eq 124 ]] || fail "wait timeout should exit 124, got $rc"
  assert_contains "$output" "audio_job.status=running" "timeout stdout includes current status"
  assert_contains "$output" "audio_job.wait_status=timed_out" "timeout stdout includes timed_out"
  assert_contains "$(<"$stderr_file")" "audio_job.wait_status=timed_out" "timeout stderr includes timed_out"
}

test_status_reconciles_failed_exit_race() {
  local pid output status
  pid="$(dead_pid)"
  output="$(make_job "dead-failed" "running" "$pid")"
  printf 'exit_code=1\n' > "$AGENT_AUDIO_BRIEF_JOB_DIR/dead-failed/exit_code"
  printf 'audio_result.reason=kokoro setup failed\n' > "$AGENT_AUDIO_BRIEF_JOB_DIR/dead-failed/stderr.log"

  status="$($GENERATOR status "dead-failed")"
  assert_contains "$status" "audio_job.status=failed" "dead failed job reconciles to failed"
  assert_contains "$status" "audio_job.reason=kokoro setup failed" "failed race preserves stderr reason"
  [[ ! -f "$output" ]] || fail "test fixture should not create output"
}

test_status_reconciles_successful_exit_race() {
  local pid output status
  pid="$(dead_pid)"
  output="$(make_job "dead-ready" "running" "$pid")"
  printf 'RIFFstub' > "$output"
  printf 'exit_code=0\n' > "$AGENT_AUDIO_BRIEF_JOB_DIR/dead-ready/exit_code"

  status="$($GENERATOR status "dead-ready")"
  assert_contains "$status" "audio_job.status=ready" "dead successful job reconciles to ready"
  assert_contains "$status" "audio_job.output_ready=true" "ready job reports final output"
}

test_status_reports_ready_audio_metadata() {
  local output status
  output="$(make_job "ready-metadata" "ready" "$$")"
  printf 'RIFFstub' > "$output"
  {
    printf 'audio_result.status=ready\n'
    printf 'audio_result.duration_seconds=165.70\n'
    printf 'audio_result.duration_label=2:45\n'
    printf 'audio_result.sanity_check=passed\n'
    printf 'audio_result.word_count=416\n'
  } > "$AGENT_AUDIO_BRIEF_JOB_DIR/ready-metadata/stdout.log"

  status="$($GENERATOR status "ready-metadata")"
  assert_contains "$status" "audio_job.duration_seconds=165.70" "ready job reports duration seconds"
  assert_contains "$status" "audio_job.duration_label=2:45" "ready job reports duration label"
  assert_contains "$status" "audio_job.sanity_check=passed" "ready job reports sanity check"
  assert_contains "$status" "audio_job.word_count=416" "ready job reports word count"
}

test_status_does_not_treat_partial_as_ready_output() {
  local output status
  output="$(make_job "partial-only" "running" "$$")"
  printf 'RIFFpartial' > "$output.partial"

  status="$($GENERATOR status "partial-only")"
  assert_contains "$status" "audio_job.status=running" "partial-only job stays running"
  assert_contains "$status" "audio_job.output_ready=false" "partial-only job reports no final output"
  assert_contains "$status" "audio_job.partial_output=$output.partial" "partial path is visible"
}

test_wait_timeout_is_structured
test_status_reconciles_failed_exit_race
test_status_reconciles_successful_exit_race
test_status_reports_ready_audio_metadata
test_status_does_not_treat_partial_as_ready_output

printf 'ok - generate-audio-job wrapper tests passed\n'
