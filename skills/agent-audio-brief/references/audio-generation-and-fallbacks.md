# Audio Generation And Fallbacks

Kokoro audio generation is required for success. Script-only output is useful for debugging, but it is not a completed audio brief.

## Golden Path: Managed `kokoro-onnx`

Use one managed local backend by default: cached `kokoro-onnx` in `~/.cache/agent-audio-brief/`.

Do not explore a long fallback ladder during a normal brief request. The user asked for a listening artifact, not a dependency debugging session.

Default flow:

1. Write the spoken brief script to a temporary work file outside the publish bundle.
2. Run `scripts/generate-audio.sh <brief-script.txt> <publish-dir>/audio/brief.wav`.
3. If the cached backend is missing, the generation script runs `scripts/setup-kokoro.sh` once.
4. If setup succeeds, generate and validate the WAV.
5. If setup fails, block clearly and ask for `uv` or `python3.12`.

The managed backend uses:

- `kokoro-onnx==0.5.0`
- `soundfile==0.13.1`
- `kokoro-v1.0.onnx`
- `voices-v1.0.bin`

Cache layout:

```text
~/.cache/agent-audio-brief/
  kokoro-onnx-venv/
  kokoro-models/
    v1.0/
      kokoro-v1.0.onnx
      voices-v1.0.bin
```

Do not install Kokoro packages into the system Python. Do not assume `python`, `python3`, or Python 3.14 is usable for Kokoro generation.

## Setup Script Contract

Use `scripts/setup-kokoro.sh` for setup. It should be the only normal install path embedded in the skill.

Setup behavior:

1. If `uv` exists, create the backend with uv-managed Python 3.12.
2. If `uv` is missing but `python3.12` exists, create the backend with `python3.12 -m venv`.
3. If neither exists, stop and ask for `uv` or `python3.12`.
4. Install pinned packages into the cached venv.
5. Download missing model files into the cache.
6. Smoke-test imports and cached model file presence.

This intentionally avoids global `pip install kokoro`, `uv tool install kokoro-tts`, and ad hoc npm installs as normal behavior.

## Generation Script Contract

Use `scripts/generate-audio.sh` for audio generation:

```bash
skills/agent-audio-brief/scripts/generate-audio.sh brief-script.txt publish/audio/brief.wav
```

The script:

- uses `af_heart` by default unless a third voice argument is provided
- creates the cached backend if needed
- writes one final browser-playable WAV at the requested output path
- reports duration and word count
- fails if the output is suspiciously short for the script length

Keep generated audio in the publish bundle at `audio/brief.wav`. Keep scripts, model caches, virtual environments, chunks, helper files, and logs outside the publish bundle.

## Why Not The Other Kokoro Paths

`kokoro-tts` is acceptable only when already installed and explicitly requested for debugging. Do not install it as the normal skill path: current releases require Python 3.11-3.12, include extra EPUB/PDF/audio-device dependencies, and require separate model-file handling.

`pip install kokoro` uses the upstream Python package and may be useful for application development, but it is heavier for this workflow because it pulls Torch/Transformers and still does not support Python 3.14.

`kokoro-js` is a last-resort experimental fallback only. Do not use it during normal brief generation unless the user explicitly asks to debug a Python-free path. If used, install it in a scratch directory outside the publish bundle and pin `kokoro-js@1.2.1`.

## Preferred Behavior

- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Save one final playable audio file for the page.
- Preserve a transcript that matches the spoken script inside the generated `index.html`.
- Name the final audio predictably as `audio/brief.wav` so the deterministic template can reference it.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.
- The brief is not a complete readout of the source, but the audio must be a complete rendering of the generated brief script.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

After generation, verify duration with available local tools such as `ffprobe`, `afinfo`, `soxi`, media metadata, or the TTS library's returned duration. Then compare it with the script length:

- A 400-450 word default brief should usually land around two to three minutes depending on voice speed.
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
