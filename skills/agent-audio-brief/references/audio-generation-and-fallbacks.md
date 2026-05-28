# Audio Generation And Fallbacks

Kokoro audio generation is required for success. Script-only output is useful for debugging, but it is not a completed audio brief.

## Deterministic Setup Order

Use `af_heart` as the default Kokoro voice. Track the selected voice internally and mention it in the final status, but do not render the voice, model name, or TTS backend on the listening page.

1. Check for `kokoro-tts` and run `kokoro-tts --help` to confirm syntax.
2. If `kokoro-tts` is missing and `uv` is available, install it:

```bash
uv tool install kokoro-tts
```

3. Retry `kokoro-tts --help` after installation.
4. If `kokoro-tts` is still unavailable, check for project-provided Kokoro wrappers or installed commands such as `kokoro`.
5. If no CLI/wrapper is available and npm is available, install `kokoro-js` in a temporary generation directory and use it as a local fallback.
6. If no local Kokoro path can be installed or run, return that the audio brief cannot be generated.

Known setup caveat: `kokoro-tts` currently documents Python 3.11-3.12 support. If the machine's default Python is newer, use `uv` or another Python version manager rather than `pip install` into the system Python.

## Preferred CLI Backend: `kokoro-tts`

Prefer `kokoro-tts` because it gives agents a stable local command surface, supports file input and stdin, can emit WAV or MP3, includes voice and speed options, and has chunk-oriented behavior for longer inputs.

Expected happy path:

```bash
kokoro-tts brief-script.txt audio/brief.wav --voice af_heart --lang en-us --format wav
```

If the CLI requires model files in the working directory, run it from the temporary generation directory or documented model directory, then move the final `brief.wav` into the page bundle.

## Kokoro JS Fallback

If no `kokoro` or `kokoro-tts` command works but npm is available, `kokoro-js` can be used as a local fallback. Install it outside the final bundle and delete `node_modules`, lockfiles, helper scripts, logs, chunks, and temporary symlinks after successful publish.

Known defaults:

```js
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
  dtype: "q8",
  device: "cpu"
});

const splitter = new TextSplitterStream();
const stream = tts.stream(splitter, { voice: "af_heart" });
```

Practical cautions:

- Prefer `tts.stream()` with `TextSplitterStream` for multi-sentence or multi-paragraph scripts.
- Do not pass a long multi-minute script as one `generate()` input.
- Some package versions resolve voices from a parent `voices/` directory. If `af_heart.bin` is missing, point the package at its bundled voices or create a temporary symlink, then clean it up.
- Model downloads can fail transiently with network errors. Retry once before reporting a setup/network blocker.
- Avoid dumping binary/minified package output into the user response. Capture errors to a log and summarize the relevant line.

## Preferred Behavior

- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Save one final playable audio file for the page, even if generation required multiple chunks internally.
- Re-encode the final assembled audio to a browser-friendly format such as mono 24 kHz 16-bit PCM WAV rather than relying on stream-copy concatenation of generated WAV chunks.
- Preserve a transcript that matches the spoken script inside the generated `index.html`.
- Name the final audio predictably as `audio/brief.wav` so the deterministic template can reference it.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

After generation, verify duration with available local tools such as `ffprobe`, `afinfo`, `soxi`, media metadata, or the TTS library's returned duration. Then compare it with the script length:

- A 400-450 word default brief should usually land around three minutes.
- A generated file under one minute for a 400-450 word script is suspicious.
- A generated file that cuts off words at chunk boundaries is not complete.

If duration remains suspicious after retry:

```md
Audio brief blocked.

- **Blocked at:** Kokoro audio completeness
- **What worked:** script generated; audio file created
- **Why:** generated audio duration was <duration>, which is too short for the script
- **Next:** regenerate with smaller chunks or provide a working Kokoro wrapper that supports long input
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
