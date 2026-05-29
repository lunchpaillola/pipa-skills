# Audio Generation And Fallbacks

Kokoro audio generation is required for success. Script-only output is useful for debugging, but it is not a completed audio brief.

## Golden Path: Managed `kokoro-onnx`

Use one managed local backend by default: cached `kokoro-onnx` in `~/.cache/agent-audio-brief/`.

Do not explore a long fallback ladder during a normal brief request. The user asked for a listening artifact, not a dependency debugging session. There is one degraded fallback: browser SpeechSynthesis preview when local Kokoro is blocked by setup, memory, or compute constraints.

Default flow:

1. Write the spoken brief script to a temporary work file outside the publish bundle.
2. Run `scripts/generate-audio-job.sh start <brief-script.txt> <publish-dir>/audio/brief.wav`.
3. Poll `scripts/generate-audio-job.sh status <job-id>` until it reports `ready` or `failed`.
4. If the cached backend is missing, the async job runs `scripts/setup-kokoro.sh` once.
5. If setup succeeds, generate and validate the WAV.
5. If setup or generation fails because the machine cannot run Kokoro, block clearly and offer a browser speech preview as the only fallback.

The managed backend uses:

- `kokoro-onnx==0.5.0`
- `soundfile==0.13.1`
- `kokoro-v1.0.int8.onnx` by default
- `voices-v1.0.bin`

Cache layout:

```text
~/.cache/agent-audio-brief/
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
skills/agent-audio-brief/scripts/generate-audio-job.sh start brief-script.txt publish/audio/brief.wav
skills/agent-audio-brief/scripts/generate-audio-job.sh status <job-id>
```

The async job:

- uses `af_heart` by default unless a third voice argument is provided
- validates script word count before setup or generation and blocks default briefs over `AGENT_AUDIO_BRIEF_MAX_WORDS=500`
- creates the cached backend if needed
- uses the INT8 Kokoro ONNX model by default
- defaults to `AGENT_AUDIO_BRIEF_MAX_PHONEMES=100`
- wraps generation with `AGENT_AUDIO_BRIEF_GENERATION_TIMEOUT_SECONDS=600` when `timeout` or `gtimeout` is available
- streams the final WAV to disk instead of building one full audio buffer in memory
- phonemizes and renders punctuation-delimited text chunks one at a time, with `AGENT_AUDIO_BRIEF_MAX_PHONEMES` as an additional per-inference safety cap
- writes one final browser-playable WAV at the requested output path
- reports progress, duration, and word count
- fails if the output is suspiciously short for the script length

Keep `AGENT_AUDIO_BRIEF_MAX_PHONEMES=100` as the default. Higher values can smooth prosody but increase ONNX Runtime workspace memory. Only change it when the user explicitly asks to test that tradeoff.

## Async Generation Contract

Always use `scripts/generate-audio-job.sh` for skill execution:

```bash
skills/agent-audio-brief/scripts/generate-audio-job.sh start brief-script.txt publish/audio/brief.wav
skills/agent-audio-brief/scripts/generate-audio-job.sh status <job-id>
skills/agent-audio-brief/scripts/generate-audio-job.sh wait <job-id>
```

The job wrapper starts a detached Kokoro generation process with `nohup`, stores job state under `~/.cache/agent-audio-brief/jobs/` by default, and returns immediately with an `audio_job.job_id`. Poll `status` until it reports `ready` or `failed`. Use `wait` only when the caller's command timeout is long enough for repeated polling.

If Kokoro still cannot run in a compute-constrained environment, block clearly and offer browser SpeechSynthesis as the single degraded preview fallback. When the user accepts it, generate the fallback using the browser speech preview variant in `references/listening-page-template.md`; do not invent a new page design.

Keep generated audio in the publish bundle at `audio/brief.wav`. Keep scripts, model caches, virtual environments, chunks, helper files, and logs outside the publish bundle.

## Preferred Behavior

- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Prefer concise spoken sentences with natural punctuation so Kokoro can render one short chunk at a time without obvious seams.
- Save one final playable audio file for the page.
- Preserve a transcript that matches the spoken script inside the generated `index.html`.
- Name the final audio predictably as `audio/brief.wav` so the deterministic template can reference it.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.
- The brief is not a complete readout of the source, but the audio must be a complete rendering of the generated brief script.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

After generation, verify duration with available local tools such as `ffprobe`, `afinfo`, `soxi`, media metadata, or the TTS library's returned duration. Then compare it with the script length:

- A 400-450 word default brief should usually land around two to three minutes depending on voice speed.
- A default brief over 500 words should be trimmed before TTS generation unless the user explicitly requested a deeper listen.
- A generated file under 90 seconds for a 350+ word script is suspicious.
- A generated file under 30 seconds for a 150+ word script is suspicious.
- A generated file that cuts off before the final section is not complete, even if its duration is plausible.

If duration remains suspicious after retry:

```md
Audio brief blocked.

- **Blocked at:** Kokoro audio completeness
- **What worked:** script generated; audio file created
- **Why:** generated audio duration was <duration>, which is too short for the script
- **Next:** run `skills/agent-audio-brief/scripts/setup-kokoro.sh` after installing `uv` or `python3.12`, then retry generation
```

## Failure Handling

When Kokoro fails after script generation:

1. Preserve only the minimal script/log debug artifact needed to retry.
2. Report the exact command/service blocker when safe.
3. Say plainly that the audio brief cannot be generated.
4. Do not claim the page or published brief is ready.

When audio playback fails after file generation:

1. Keep the audio artifact status separate from page/player status.
2. Fix the page reference if possible.
3. If it cannot be fixed, report the page/player blocker before publishing.
