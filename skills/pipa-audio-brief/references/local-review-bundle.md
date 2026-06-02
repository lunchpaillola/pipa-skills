# Local Review Bundle

The local bundle is a temporary implementation detail used to publish one here.now listening page. The user should receive the here.now URL, not a local file path and not a list of bundle files.

## Temporary Layout

```text
.artifacts/audio-briefs/<safe-slug>/
  work/
    brief-script.txt
    page-contract.json
  publish/
    index.html
    audio/
      brief.wav
```

Keep `index.html` at the `publish/` root so here.now publishes it as the site homepage. Keep the audio path stable as `audio/brief.wav`. Do not publish the run root or `work/` directory.

## Artifact Lifecycle

Classify every generated file before final handoff.

**Temporary publish bundle:** keep only until here.now publish succeeds.

- `index.html`
- final audio file referenced by the page

`index.html` must embed the transcript and minimal source context needed to trust the brief. Do not keep separate `transcript.md`, `page-contract.json`, or `provenance.json` after success.

The publish bundle must not contain `node_modules`, package files, virtual environments, model files, chunks, helper scripts, logs, partial files such as `brief.wav.partial`, or debug artifacts. The normal happy path is only `publish/index.html` and `publish/audio/brief.wav`.

**Temporary sawdust:** delete by default after success.

- `work/brief-script.txt` after its content has been embedded in `index.html`
- `work/page-contract.json` after `index.html` has been rendered
- `node_modules`, package lockfiles, temporary virtual environments, model scratch folders, and dependency caches created only for generation
- temporary Kokoro helper scripts
- chunk audio files after they have been concatenated into the final audio
- test audio files
- server logs
- failed page drafts
- one-off symlinks such as temporary `voices/` links
- page-contract JSON, provenance JSON, and transcript markdown after their contents have been embedded in `index.html`
- raw extracted HTML or intermediate markdown
- the generated `.artifacts/audio-briefs/<safe-slug>/` bundle after here.now publish succeeds
- per-run job directories under `~/.cache/pipa-audio-brief/jobs/` after here.now publish succeeds
- `.herenow/` or `.herenow/state.json` when created by this one-off publish run and not present before the run

Do not delete the managed Kokoro backend cache at `~/.cache/pipa-audio-brief/kokoro-onnx-venv/` or `~/.cache/pipa-audio-brief/kokoro-models/` after a successful run. That cache is the reusable setup that makes future audio briefs fast.

**Debug artifacts:** keep only when needed.

- Preserve logs, failed chunks, page-contract JSON, provenance JSON, transcript markdown, or helper scripts only if generation or publishing is blocked and they explain the blocker.
- Put preserved debug files under a clearly named `debug/` directory.
- Mention preserved debug files in the final blocker response so the user knows they exist.

The final response should not expose sawdust. It should lead with one here.now URL and mention only meaningful blocker/debug artifacts.

## Required User-Facing Behavior

- Publish successful bundles with here.now.
- Return the here.now URL as the primary result.
- Do not serve with local HTTP as the normal handoff path.
- Do not return `file://` paths after successful publish.
- Include the transcript inside the page.
- Keep source context minimal and inline.
- Keep raw artifacts discoverable only when useful or explicitly requested.

## Partial States

- If Kokoro is blocked, do not call the brief complete. Report that audio cannot be generated.
- If `audio_job.status` is not `ready`, do not call the audio complete even if an audio-like file exists.
- If `brief.wav.partial` exists, treat it as an incomplete generation artifact, not playable output.
- If page generation fails after audio generation, report the page-generation blocker and do not publish.
- If here.now publish fails after page generation, report the publish blocker and preserve the generated bundle only long enough for retry/debugging.
- If here.now publish succeeds, delete the local generated bundle.
