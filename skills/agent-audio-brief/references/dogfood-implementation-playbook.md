# Dogfood Implementation Playbook

Use this fast path when the user asks to generate and publish an audio brief.

## Fast Path

1. Create a temporary artifact directory, for example `.artifacts/audio-briefs/<slug>/`.
2. Draft the 400-450 word script in memory or a temporary generation file.
3. Generate audio with local `kokoro-tts` using `af_heart` by default. If unavailable, install it with `uv tool install kokoro-tts` when `uv` exists. If still unavailable and npm exists, use the local `kokoro-js` fallback.
4. Validate audio duration and file type before creating the page status.
5. Render `index.html` from `references/listening-page-template.md`; replace placeholders only.
6. Publish the directory with the here.now skill or helper script.
7. Verify the published here.now URL responds when possible.
8. After successful publish, remove the local generated bundle and all temporary generation sawdust.

After success, the durable artifact is the here.now URL, not a local `.artifacts` directory.

## Preferred `kokoro-tts` CLI Path

Use this path first when `kokoro-tts --help` works:

```bash
kokoro-tts brief-script.txt audio/brief.wav --voice af_heart --lang en-us --format wav
```

If `kokoro-tts` is missing and `uv` exists, install and retry:

```bash
uv tool install kokoro-tts
kokoro-tts --help
```

Known caveat: `kokoro-tts` documents Python 3.11-3.12 support. If the default `python3` is newer, use `uv` or another version manager with a supported interpreter.

## Kokoro JS Fallback Notes

If no `kokoro` or `kokoro-tts` command works but npm is available, install `kokoro-js` in a temporary generation directory.

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

- Use `tts.stream()` so Kokoro's splitter emits sentence-level audio chunks.
- Some package versions resolve voices from a parent `voices/` directory. If `af_heart.bin` is reported missing, use a temporary symlink to `node_modules/kokoro-js/voices` or adjust the working directory, then clean it up.
- First model download may fail transiently. Retry once before reporting a blocker.
- Keep dependency installs out of the final published bundle.

## Chunking Rule

Split on paragraph boundaries first, then sentence boundaries if a paragraph is still long.

Target chunks:

- 300-700 characters for reliable generation
- no more than roughly 1,000 characters unless the selected Kokoro wrapper is known to handle longer text

For generated WAV chunks, prefer re-encoding the final file instead of stream-copying chunk files. A known-good assembly pattern is:

```bash
ffmpeg -y -f concat -safe 0 -i concat.txt \
  -af "aresample=24000,aformat=sample_fmts=s16:channel_layouts=mono" \
  -ar 24000 -ac 1 -c:a pcm_s16le audio/brief.wav
```

## Duration Sanity Check

Use any available local metadata tool:

- `ffprobe`
- `afinfo` on macOS
- `soxi`
- library-provided duration metadata

Minimum check:

- A 400-450 word default script should not produce a 20-30 second file.
- A generated file under one minute for a default script is suspicious.

If suspicious, regenerate with smaller chunks before returning success.

## here.now Publishing

If the here.now skill is missing, install it:

```bash
npx skills add heredotnow/skill --skill here-now -g -y
```

If npm is unavailable:

```bash
curl -fsSL https://here.now/install.sh | bash
```

Publish the bundle directory:

```bash
~/.agents/skills/here-now/scripts/publish.sh <bundle-dir> --client opencode
```

Return `publish_result.site_url` from the script output. Use `publish_result.auth_mode` and `publish_result.persistence` to state whether the site is permanent or expires.

## Final Handoff Checklist

Before final response, verify:

- `index.html` existed in the published bundle root before publish
- final audio file existed at `audio/brief.wav` before publish
- audio duration passed sanity check
- page referenced `audio/brief.wav`
- transcript and minimal source context were embedded in `index.html`
- here.now publish returned a `publish_result.site_url`
- successful publish artifacts were removed locally
- preserved debug artifacts, if any, live under `debug/` and are mentioned only if they matter
- final response leads with one here.now URL
