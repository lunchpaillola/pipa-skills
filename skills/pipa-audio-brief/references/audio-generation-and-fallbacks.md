# Audio Generation And Fallbacks

Browser SpeechSynthesis is the default audio path for success. Script-only output is useful for debugging, but it is not a completed audio brief. Kokoro audio generation is an optional polished preset when the user explicitly asks for it and accepts the setup, time, and memory tradeoff.

## Golden Path: Browser SpeechSynthesis

Use browser speech by default, especially in sandboxed or resource-constrained environments. The product promise is fast orientation to a work artifact, not premium narration. Browser speech keeps the skill portable and avoids making audio brief generation depend on a large local model runtime.

Default flow:

1. Write the spoken brief script as the page transcript.
2. Render the listening page with `"audio.mode": "browser_speech"`.
3. Let `scripts/render-listening-page.py` generate the browser speech controls, sentence highlighting, pause/resume, restart, back, forward, and voice selection behavior.
4. Publish the page. Do not create or require `audio/brief.wav`.

Browser speech page contract:

```json
"audio": {
  "mode": "browser_speech",
  "durationLabel": "Browser speech",
  "status": "browser_speech"
}
```

Browser speech quality guidance:

- Use the generated script as the speech input, not the raw source document.
- Keep sentences short and plain so browser voices sound less robotic.
- Use punctuation for natural pauses, especially after transitions and before the takeaway.
- Avoid Markdown, bullets, table syntax, raw URLs, code fences, dense labels, and punctuation-heavy phrases in speakable text.
- Prefer a compact two-minute orientation over long passive narration; browser voices fatigue listeners faster than polished generated audio.
- Let the page UI create value through responsiveness, sentence highlighting, pause/resume, restart, skip controls, and a voice selector.
- Prefer Daniel (`en-GB`) when available because it sounds best in current testing. Otherwise prefer English Chrome/Google voices, then natural or enhanced English voices, then the browser default.

## Optional Preset: Managed `kokoro-onnx`

Use one managed local backend when the user asks for polished generated audio: cached `kokoro-onnx` in `~/.cache/pipa-audio-brief/`.

Do not explore a long fallback ladder during a normal brief request. The user asked for a listening artifact, not a dependency debugging session. Browser speech is the normal path. Kokoro is a preset, not a prerequisite.

Default flow:

1. Write the spoken brief script to a temporary work file outside the publish bundle.
2. Run `scripts/generate-audio-job.sh start <brief-script.txt> <publish-dir>/audio/brief.wav`.
3. Run `scripts/generate-audio-job.sh wait <job-id>` and continue only when it reports `ready`.
4. If the cached backend is missing, the async job runs `scripts/setup-kokoro.sh` once.
5. If setup succeeds, generate and validate the WAV.
6. If setup or generation fails because the machine cannot run Kokoro, use browser speech mode unless the user explicitly required Kokoro-only output.

The managed backend uses:

- `kokoro-onnx==0.5.0`
- `soundfile==0.13.1`
- `kokoro-v1.0.int8.onnx` by default
- `voices-v1.0.bin`

Cache layout:

```text
~/.cache/pipa-audio-brief/
  kokoro-onnx-venv/
  kokoro-models/
    v1.0-int8/
      kokoro-v1.0.int8.onnx
      voices-v1.0.bin
```

Do not install Kokoro packages into the system Python. Do not assume `python`, `python3`, or Python 3.14 is usable for Kokoro generation.

## Setup Script Contract

Use `scripts/setup-kokoro.sh` for setup. It should be the only normal install path embedded in the skill.

Setup behavior:

1. If `uv` exists, create the backend with uv-managed Python 3.12.
2. If `uv` is missing, create the backend with the first available supported executable from `python3.12`, `python3.11`, `python3.10`, `python3`, or `python`.
3. If no Python 3.10-3.13 executable exists, stop and ask for `uv` or Python 3.10-3.13.
4. Install pinned packages into the cached venv.
5. Download missing model files into the cache.
6. Smoke-test imports and cached model file presence.

This intentionally avoids global or ad hoc package installs as normal behavior.

## Generation Script Contract

Use `scripts/generate-audio-job.sh` for normal audio generation so Kokoro does not block the agent shell command:

```bash
skills/pipa-audio-brief/scripts/generate-audio-job.sh start brief-script.txt publish/audio/brief.wav
skills/pipa-audio-brief/scripts/generate-audio-job.sh wait <job-id>
```

The async job:

- uses `af_heart` by default unless a third voice argument is provided
- validates script word count before setup or generation and blocks default briefs over `PIPA_AUDIO_BRIEF_MAX_WORDS=350`
- creates the cached backend if needed
- uses the INT8 Kokoro ONNX model by default
- defaults to `PIPA_AUDIO_BRIEF_MAX_PHONEMES=100`
- wraps generation with `PIPA_AUDIO_BRIEF_GENERATION_TIMEOUT_SECONDS=1200` when `timeout` or `gtimeout` is available
- streams audio to `audio/brief.wav.partial` instead of building one full audio buffer in memory
- phonemizes and renders punctuation-delimited text chunks one at a time, with `PIPA_AUDIO_BRIEF_MAX_PHONEMES` as an additional per-inference safety cap
- checks duration with Python's standard WAV reader, then renames the partial file to one final browser-playable WAV at the requested output path
- reports progress, duration, duration label, sanity check status, and word count
- fails if the output is suspiciously short for the script length

Keep `PIPA_AUDIO_BRIEF_MAX_PHONEMES=100` as the default. Higher values can smooth prosody but increase ONNX Runtime workspace memory. Only change it when the user explicitly asks to test that tradeoff.

## Async Generation Contract

Always use `scripts/generate-audio-job.sh` for skill execution:

```bash
skills/pipa-audio-brief/scripts/generate-audio-job.sh start brief-script.txt publish/audio/brief.wav
skills/pipa-audio-brief/scripts/generate-audio-job.sh wait <job-id>
skills/pipa-audio-brief/scripts/generate-audio-job.sh status <job-id>
```

The job wrapper starts a detached Kokoro generation process with `nohup`, stores job state under `~/.cache/pipa-audio-brief/jobs/` by default, and returns immediately with an `audio_job.job_id`. Prefer `wait` for normal runs because it polls and emits progress until the job reaches a terminal state. `wait` accepts optional `poll-seconds` and `timeout-seconds` arguments, and also respects `PIPA_AUDIO_BRIEF_WAIT_TIMEOUT_SECONDS` with a default of 900 seconds. Use `status` for debugging, progress checks, or when the caller's command timeout is shorter than the expected generation time.

If `wait` reaches its own timeout, it exits `124` and emits `audio_job.wait_status=timed_out` on stdout and stderr. That does not mean Kokoro failed; it means the wrapper stopped waiting. Call `status <job-id>` and continue polling. `status` reports whether the final output exists as `audio_job.output_ready=true|false` and whether a `.partial` output is still being written.

When `wait` or `status` reports `audio_job.status=ready`, it also reports `audio_job.duration_seconds`, `audio_job.duration_label`, `audio_job.sanity_check`, and `audio_job.word_count` when those values were produced by the generation run. Use these fields directly in the page contract. Do not run a separate WAV duration command unless the fields are missing or suspicious.

`status` reconciles common async races. If the background process has exited but the status file still says `running`, `status` uses the recorded exit code to report `ready` or `failed` instead of leaving agents stuck on a stale running state.

Do not treat command silence, file size, or any partial file as success while the job is still `running`. The generator writes `audio/brief.wav.partial` during rendering and renames it to `audio/brief.wav` only after duration validation passes. Only proceed when `wait` or `status` reports `audio_job.status=ready`, `audio_job.output_ready=true`, and `audio_job.sanity_check=passed`.

Run `scripts/test-generate-audio-job.sh` after changing the async wrapper. It uses synthetic job directories so timeout handling and process-exit races can be tested without running Kokoro.

If Kokoro still cannot run in a compute-constrained environment, generate the default browser SpeechSynthesis page unless the user explicitly required Kokoro-only output. Use the browser speech variant in `references/listening-page-template.md`; do not invent a new page design.

Keep generated audio in the publish bundle at `audio/brief.wav`. Keep scripts, model caches, virtual environments, chunks, helper files, partial files, and logs outside the publish bundle.

## Preferred Behavior

- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Prefer concise spoken sentences with natural punctuation so Kokoro can render one short chunk at a time without obvious seams.
- In browser speech mode, do not save an audio file.
- In Kokoro mode, save one final playable audio file for the page.
- Preserve a transcript that matches the spoken script inside the generated `index.html`.
- Name the final Kokoro audio predictably as `audio/brief.wav` so the deterministic template can reference it.
- Never publish `audio/brief.wav.partial`; it is a transient generation file, not a success artifact.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.
- The brief is not a complete readout of the source, but the audio must be a complete rendering of the generated brief script.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

The generation job verifies duration using the generated WAV's frame count and sample rate through Python's standard `wave` module. Do not require or install `ffprobe`, `soxi`, `mediainfo`, or other media metadata tools for this skill's normal path. Then compare duration with the script length:

- A 300-350 word default brief should usually land around two minutes depending on voice speed.
- A default brief over 350 words should be trimmed before TTS generation unless the user explicitly requested a deeper listen.
- A generated file under 90 seconds for a 350+ word script is suspicious.
- A generated file under 30 seconds for a 150+ word script is suspicious.
- A generated file that cuts off before the final section is not complete, even if its duration is plausible.

If duration remains suspicious after retry:

```md
Audio brief blocked.

- **Blocked at:** Kokoro audio completeness
- **What worked:** script generated; audio file created
- **Why:** generated audio duration was <duration>, which is too short for the script
- **Next:** run `skills/pipa-audio-brief/scripts/setup-kokoro.sh` after installing `uv` or `python3.12`, then retry generation
```

## Failure Handling

When Kokoro fails after script generation:

1. Preserve only the minimal script/log debug artifact needed to retry.
2. Report the exact command/service blocker when safe.
3. Generate the browser speech page instead, unless the user explicitly required Kokoro-only output.
4. Do not claim polished generated audio is ready.

When audio playback fails after file generation:

1. Keep the audio artifact status separate from page/player status.
2. Fix the page reference if possible.
3. If it cannot be fixed, report the page/player blocker before publishing.
