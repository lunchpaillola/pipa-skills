# Audio Generation And Fallbacks

Kokoro audio generation is required for V1 success. Script-only output is useful, but it is a blocked or partial state, not a completed audio brief.

## Discovery

Before generating audio, discover the available local Kokoro path. Possible environments may expose Kokoro through a CLI, script, Python package, local service, or another wrapper. Use the local help/version output when available rather than guessing invocation syntax.

Discovery order:

1. Check for project-provided Kokoro scripts or wrappers.
2. Check for installed commands such as `kokoro` or `kokoro-tts`.
3. Check Python package or local service options if the environment already uses them.
4. If Node/npm is available and installing an artifact-local dependency is acceptable, `kokoro-js` can be used as a local fallback. In Node, prefer `device: "cpu"`; `device: "wasm"` may be browser-only depending on the Transformers.js version.

Use `af_heart` as the default Kokoro voice. It should appear in the generated page metadata and final status unless the user requested another voice.

If using `kokoro-js`, install it outside the final bundle or clean `node_modules` before returning. The final user-facing bundle should contain the page, audio, transcript, and small metadata files, not hundreds of megabytes of temporary dependencies.

Known `kokoro-js` notes from dogfooding:

- Node generation may require `device: "cpu"`.
- Voice files may be resolved relative to the parent output directory in some package versions. If `voices/af_heart.bin` is missing, point the package at its bundled voices or create a temporary symlink during generation, then clean it up.
- Model downloads can fail transiently with network errors. Retry once before reporting a setup/network blocker.
- Avoid dumping binary/minified package output into the user response. Capture errors to a log and summarize the relevant line.

Report clearly if discovery fails:

```md
- **Blocked at:** Kokoro audio
- **Why:** no Kokoro command, wrapper, or local service was available in this environment
- **What worked:** script generated
- **Next:** install/configure Kokoro or provide the available command path
```

## Preferred Behavior

- Prefer local Kokoro for privacy and cost control.
- Use the generated script as the TTS input, not the raw source document.
- Use `af_heart` by default.
- Chunk scripts before TTS when they are longer than a short paragraph. Some Kokoro wrappers can truncate or fail silently on long single inputs.
- Save one final playable audio file for the page, even if generation required multiple chunks internally.
- Preserve a transcript that matches the spoken script.
- Name output files predictably so the single page can reference them.
- If first-run model download is needed, report that as setup/wait state rather than a content failure.
- Keep temporary generation scripts separate from the final bundle or remove them before returning the user-facing link.

## Duration And Completeness Checks

Do not treat "audio file exists" as success by itself.

After generation, verify duration with available local tools such as `ffprobe`, `afinfo`, `soxi`, media metadata, or the TTS library's returned duration. Then compare it with the expected listening depth:

- `quick listen`: usually 1-3 minutes unless the source is very short
- `standard brief`: usually 3-7 minutes when the source supports it
- `deep listen`: usually 7-12 minutes when requested

Also sanity-check duration against script length. A multi-paragraph standard brief that generates only a few seconds of audio is likely truncated. Regenerate using smaller chunks before reporting success.

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
