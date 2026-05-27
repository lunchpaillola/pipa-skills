# Dogfood Implementation Playbook

Use this fast path when the user asks to actually generate a local audio brief and there is no project-specific wrapper already available.

## Fast Path

1. Create a safe artifact directory, for example `.artifacts/audio-briefs/<slug>/`.
2. Draft transcript/script and page-contract data in memory or a temporary generation directory.
3. Do not make transcript or page-contract files part of the final successful bundle.
4. Generate audio with local `kokoro-tts` using `af_heart` by default. If unavailable, use another local Kokoro wrapper or the `kokoro-js` fallback below.
5. Validate audio duration and file type before creating the final page status.
6. Generate one `index.html` with inline CSS/JS, relative audio path, and the low-brand read-along document format from `single-page-ui-contract.md`.
7. Serve the artifact directory over local HTTP bound to `0.0.0.0` and return that URL first. If a Tailscale, LAN, or hostname URL is known, return that reachable URL before the raw `0.0.0.0` URL.
8. Clean temporary dependency folders, lockfiles, logs, helper scripts, symlinks, test audio, chunk audio, transcript files, page-contract files, and provenance files before final handoff.

Aim for the smallest useful final directory. A successful local bundle should usually contain only `index.html` and the final audio file.

## Preferred `kokoro-tts` CLI Path

Use this path first when `kokoro-tts --help` works:

```bash
kokoro-tts brief-script.txt audio/brief.wav --voice af_heart --lang en-us --format wav
```

If the CLI requires model files in the working directory, run it from the temporary generation directory or documented model directory, then move/copy the final `brief.wav` into the durable bundle. Do not leave downloaded models, helper text files, or command logs in the final bundle unless they are required debug artifacts for a blocker.

If `kokoro-tts` is missing, the preferred setup recommendation is:

```bash
uv tool install kokoro-tts
```

Known caveat: `kokoro-tts` documents Python 3.11-3.12 support. If the default `python3` is newer, do not assume `pip install kokoro-tts` will work; use `uv` or another version manager with a supported interpreter.

## Kokoro JS Fallback Notes

If no `kokoro` or `kokoro-tts` command exists but npm is available, `kokoro-js` can be a practical local fallback.

Known defaults:

```js
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
  dtype: "q8",
  device: "cpu"
});

const splitter = new TextSplitterStream();
const stream = tts.stream(splitter, { voice: "af_heart" });

const consume = (async () => {
  let index = 0;
  for await (const { audio } of stream) {
    index += 1;
    await audio.save(`chunks/chunk-${String(index).padStart(3, "0")}.wav`);
  }
})();

for (const token of script.match(/\s*\S+/g)) splitter.push(token);
splitter.close();
await consume;
```

Practical cautions:

- Do not pass a long multi-minute script as one text input. Chunk first.
- Avoid manual multi-sentence `tts.generate(textChunk)` calls for `kokoro-js` when the chunk approaches 20-30 seconds of speech. In dogfooding, repeated `generate()` calls capped at the same duration and cut off final words before concatenation. Use `tts.stream()` so Kokoro's splitter emits sentence-level audio chunks.
- Some package versions resolve voices from a parent `voices/` directory. If `af_heart.bin` is reported missing, use a temporary symlink to `node_modules/kokoro-js/voices` or adjust the working directory, then clean up.
- First model download may fail transiently. Retry once before reporting a blocker.
- Keep dependency installs out of the final user bundle when possible.

## Chunking Rule

Split on paragraph boundaries first, then sentence boundaries if a paragraph is still long.

Target chunks:

- 300-700 characters for reliable generation
- no more than roughly 1,000 characters unless the selected Kokoro wrapper is known to handle longer text

After generating chunks, concatenate with an available local audio tool when possible. If no concat tool is available, either use a wrapper that supports streaming/chunk assembly or report the missing assembly step as the blocker.

For generated WAV chunks, prefer re-encoding the final file instead of stream-copying chunk files. A known-good assembly pattern is:

```bash
ffmpeg -y -f concat -safe 0 -i concat.txt \
  -af "aresample=24000,aformat=sample_fmts=s16:channel_layouts=mono" \
  -ar 24000 -ac 1 -c:a pcm_s16le audio/brief.wav
```

Use a cache-busted filename, such as `brief-v2.wav`, if replacing an audio file behind an already-open local page during debugging.

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

If a user reports words missing at chunk boundaries, run a quick isolation loop:

1. Generate the exact failing paragraph as a raw chunk and listen or transcribe it.
2. Generate the same text with trailing buffer text. If duration stays identical and the tail is still missing, the TTS call is capped.
3. Switch to `tts.stream()` sentence-level chunks, regenerate the full brief, and update the page to a new audio filename to avoid browser cache.
4. Verify the final page and audio URL both return HTTP 200.

## HTTP/Tailscale Serving

Prefer HTTP over `file://` for generated listening pages, even for local review. Binding to `0.0.0.0` makes the page reachable through the local host, LAN address, or Tailscale hostname when networking allows it.

Pattern:

```bash
python3 -m http.server <port> --bind 0.0.0.0
```

Return the verified URL first:

```text
http://0.0.0.0:<port>/index.html
```

If a Tailscale IP, LAN IP, or hostname is known, prefer that URL in the final response because it is more useful from another device:

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
- transcript and minimal source context are embedded in `index.html`
- no separate transcript, page-contract, or provenance file remains after success
- temporary generation dependencies are cleaned or clearly marked as ephemeral
- chunk files, test audio, helper scripts, logs, and temporary symlinks are removed after successful generation
- any preserved debug artifacts live under `debug/` and are mentioned only if they matter
- final response leads with one URL/path
