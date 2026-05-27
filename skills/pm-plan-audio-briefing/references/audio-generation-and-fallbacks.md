# Audio Generation And Fallbacks

Kokoro audio generation is required for V1 success. Script-only output is useful, but it is a blocked or partial state, not a completed audio brief.

## Discovery

Before generating audio, discover the available local Kokoro path. Possible environments may expose Kokoro through the `kokoro-tts` CLI, a project script, Python package, local service, or another wrapper. Use the local help/version output when available rather than guessing invocation syntax.

Discovery order:

1. Check for installed `kokoro-tts` and run `kokoro-tts --help` to confirm syntax.
2. Check for project-provided Kokoro scripts or wrappers.
3. Check for installed commands such as `kokoro`.
4. Check Python package or local service options if the environment already uses them.
5. If Node/npm is available and installing an artifact-local dependency is acceptable, `kokoro-js` can be used as a local fallback. In Node, prefer `device: "cpu"`; `device: "wasm"` may be browser-only depending on the Transformers.js version.

Use `af_heart` as the default Kokoro voice. It should appear in the generated page metadata and final status unless the user requested another voice.

## Preferred CLI Backend: `kokoro-tts`

Prefer `kokoro-tts` because it gives agents a stable local command surface, supports file input and stdin, can emit WAV or MP3, includes voice and speed options, and has chunk-oriented behavior for longer inputs.

Expected happy path:

```bash
kokoro-tts brief-script.txt audio/brief.wav --voice af_heart --lang en-us --format wav
```

If `kokoro-tts` is missing but the user wants setup guidance, suggest installing it with `uv` rather than adding repo-local dependencies:

```bash
uv tool install kokoro-tts
```

Known setup caveat: `kokoro-tts` currently documents Python 3.11-3.12 support. If the machine's default Python is newer, use `uv` or another Python version manager to run it with a supported interpreter. The CLI may also require `kokoro-v1.0.onnx` and `voices-v1.0.bin` in the command's working directory; check the installed CLI help and project README before reporting success.

If using `kokoro-js`, install it outside the final bundle or clean `node_modules` before returning. The final user-facing bundle should contain the page, audio, transcript, and small metadata files, not hundreds of megabytes of temporary dependencies.

Known `kokoro-js` notes from dogfooding:

- Node generation may require `device: "cpu"`.
- Prefer `tts.stream()` with `TextSplitterStream` for multi-sentence or multi-paragraph scripts. Dogfooding found `tts.generate()` can hit a fixed per-call output ceiling and truncate the end of a chunk, even when extra trailing text is added.
- Voice files may be resolved relative to the parent output directory in some package versions. If `voices/af_heart.bin` is missing, point the package at its bundled voices or create a temporary symlink during generation, then clean it up.
- Model downloads can fail transiently with network errors. Retry once before reporting a setup/network blocker.
- Avoid dumping binary/minified package output into the user response. Capture errors to a log and summarize the relevant line.

Report clearly if discovery fails:

```md
- **Blocked at:** Kokoro audio
- **Why:** no `kokoro-tts`, Kokoro command, wrapper, or local service was available in this environment
- **What worked:** script generated
- **Next:** install/configure `kokoro-tts` or provide the available Kokoro command path
```

## Preferred Behavior

- Prefer local `kokoro-tts` for privacy, repeatability, and faster subsequent runs after setup.
- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Use CLI-supported chunking/merge behavior when available. Otherwise chunk scripts before TTS when they are longer than a short paragraph. Some Kokoro wrappers can truncate or fail silently on long single inputs. For `kokoro-js`, use the streaming API for chunking instead of large manual `generate()` calls.
- Save one final playable audio file for the page, even if generation required multiple chunks internally.
- Re-encode the final assembled audio to a browser-friendly format such as mono 24 kHz 16-bit PCM WAV rather than relying on stream-copy concatenation of generated WAV chunks.
- Preserve a transcript that matches the spoken script.
- Name output files predictably so the single page can reference them.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.
- Keep temporary generation scripts separate from the final bundle or remove them before returning the user-facing link.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

After generation, verify duration with available local tools such as `ffprobe`, `afinfo`, `soxi`, media metadata, or the TTS library's returned duration. Then compare it with the expected listening depth:

- `quick listen`: usually 1-2 minutes unless the source is very short
- `standard brief`: usually around 3 minutes when the source supports it
- `deep listen`: usually 7-12 minutes when requested

Also sanity-check duration against script length. A multi-paragraph standard brief that generates only a few seconds of audio is likely truncated. If an individual generated chunk repeatedly has the same duration despite adding trailing text, treat that as a TTS per-call ceiling and switch to sentence-level streaming or smaller generated units before reporting success.

If duration remains suspicious after retry:

```md
- **Blocked at:** Kokoro audio completeness
- **What worked:** script generated; audio file created
- **Why:** generated audio duration was <duration>, which is too short for the requested <mode>
- **Next:** regenerate with smaller chunks or provide a working Kokoro wrapper that supports long input
```

## Required Status Fields

Track these states independently:

- `script generated`
- `audio generated`
- `page generated`
- `blocked`

Examples:

- `script generated`, `audio generated`, `page generated`: success
- `script generated`, `blocked at Kokoro audio`: partial, not success
- `audio generated`, `blocked at page generation`: partial, user-facing page missing

## Privacy Rules

- Do not use cloud TTS unless the user explicitly approves sending source-derived script text to that service.
- If the user asks for no paid APIs or no tokens, use local Kokoro only and block if local Kokoro is unavailable.
- Do not send full source text to TTS when the generated script is sufficient.

## Failure Handling

When Kokoro fails after script generation:

1. Keep the script/transcript.
2. Report the exact command/service blocker when safe.
3. Do not claim the audio brief is ready.
4. Offer the minimum next action to unblock Kokoro.

When Kokoro creates a too-short or truncated audio file:

1. Treat it as an audio-generation defect.
2. Retry with smaller chunks.
3. Do not call the page ready until the audio duration passes the sanity check, unless the page clearly shows the blocker.

When audio playback fails after file generation:

1. Keep the audio artifact status separate from page/player status.
2. Report the generated file path internally or in the page if useful.
3. Fix or report page-generation/player blockers before calling the single page ready.

## Pipecat Boundary

Pipecat is the future live voice path. Do not introduce Pipecat into the V1 static audio-generation workflow unless the user explicitly asks for live voice behavior and accepts the extra runtime complexity.
