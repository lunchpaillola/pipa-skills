# Dogfood Implementation Playbook

Use this fast path when the user asks to actually generate a local audio brief and there is no project-specific wrapper already available.

## Fast Path

1. Create a safe artifact directory, for example `.artifacts/audio-briefs/<slug>/`.
2. Draft transcript/script and page-contract data in memory or a temporary generation directory.
3. Do not make transcript or page-contract files part of the final successful bundle.
4. Generate audio with local Kokoro using `af_heart` by default.
5. Validate audio duration and file type before creating the final page status.
6. Generate one `index.html` with inline CSS/JS and relative audio path.
7. If cross-device viewing is needed, serve the artifact directory over HTTP and return that URL first.
8. Clean temporary dependency folders, lockfiles, logs, helper scripts, symlinks, test audio, chunk audio, transcript files, page-contract files, and provenance files before final handoff.

Aim for the smallest useful final directory. A successful local bundle should usually contain only `index.html` and the final audio file.

## Kokoro JS Fallback Notes

If no `kokoro` or `kokoro-tts` command exists but npm is available, `kokoro-js` can be a practical local fallback.

Known defaults:

```js
import { KokoroTTS } from "kokoro-js";

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
  dtype: "q8",
  device: "cpu"
});

const audio = await tts.generate(textChunk, { voice: "af_heart" });
await audio.save("audio/chunk-001.wav");
```

Practical cautions:

- Do not pass a long multi-minute script as one text input. Chunk first.
- Some package versions resolve voices from a parent `voices/` directory. If `af_heart.bin` is reported missing, use a temporary symlink to `node_modules/kokoro-js/voices` or adjust the working directory, then clean up.
- First model download may fail transiently. Retry once before reporting a blocker.
- Keep dependency installs out of the final user bundle when possible.

## Chunking Rule

Split on paragraph boundaries first, then sentence boundaries if a paragraph is still long.

Target chunks:

- 300-700 characters for reliable generation
- no more than roughly 1,000 characters unless the selected Kokoro wrapper is known to handle longer text

After generating chunks, concatenate with an available local audio tool when possible. If no concat tool is available, either use a wrapper that supports streaming/chunk assembly or report the missing assembly step as the blocker.

## Duration Sanity Check

Use any available local metadata tool:

- `ffprobe`
- `afinfo` on macOS
- `soxi`
- library-provided duration metadata

Minimum check:

- A standard 3-7 minute script should not produce a 20-30 second file.
- A generated file under one minute for a multi-paragraph standard brief is suspicious unless the user requested a quick listen or the source was very short.

If suspicious, regenerate with smaller chunks before returning success.

## HTTP/Tailscale Serving

For phone or Tailscale review, prefer HTTP over `file://`.

Pattern:

```bash
python3 -m http.server <port> --bind 0.0.0.0
```

Return:

```text
http://<tailscale-ip-or-hostname>:<port>/index.html
```

Verify with a HEAD or GET request when possible. If the server process cannot persist in the current harness, say so and return the durable local `index.html` path.

## Final Handoff Checklist

Before final response, verify:

- `index.html` exists
- final audio file exists and has a real audio file type
- audio duration passes sanity check
- page references the final audio path correctly
- transcript, provenance, source coverage, privacy posture, and follow-up prompts are embedded in `index.html`
- no separate transcript, page-contract, or provenance file remains after success
- temporary generation dependencies are cleaned or clearly marked as ephemeral
- chunk files, test audio, helper scripts, logs, and temporary symlinks are removed after successful generation
- any preserved debug artifacts live under `debug/` and are mentioned only if they matter
- final response leads with one URL/path
