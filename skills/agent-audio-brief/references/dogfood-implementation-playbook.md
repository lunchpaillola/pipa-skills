# Dogfood Implementation Playbook

Use this fast path when the user asks to generate and publish an audio brief.

## Fast Path

1. Create a temporary artifact directory, for example `.artifacts/audio-briefs/<slug>/`.
2. Create separate `work/` and `publish/` directories under that artifact directory.
3. Draft the 400-450 word script into `work/brief-script.txt`.
4. Start audio with `scripts/generate-audio-job.sh`, passing absolute or repo-root-relative artifact paths. Let that job create the cached `kokoro-onnx` backend if needed.
5. Run `scripts/generate-audio-job.sh wait <job-id>` when the caller timeout is long enough, or poll `status <job-id>` manually when it is not; only `audio_job.status=ready`, `audio_job.output_ready=true`, and `audio_job.sanity_check=passed` mean the audio succeeded.
6. Render `publish/index.html` from `references/listening-page-template.md`; replace placeholders only.
7. Verify `publish/` contains only the page and final audio bundle files.
8. Publish `publish/` with the here.now skill or helper script.
9. Verify the published here.now page and audio URL respond when possible.
10. After successful publish and verification, remove the local generated bundle and all temporary generation sawdust.

After success, the durable artifact is the here.now URL, not a local `.artifacts` directory.

## Preferred Managed Kokoro Path

Use this async path for normal audio generation:

```bash
RUN_DIR=".artifacts/audio-briefs/<slug>"
skills/agent-audio-brief/scripts/generate-audio-job.sh start "$RUN_DIR/work/brief-script.txt" "$RUN_DIR/publish/audio/brief.wav"
skills/agent-audio-brief/scripts/generate-audio-job.sh wait <job-id>
```

If the command runner times out before `wait` completes, resume with `status <job-id>` rather than inspecting file size. A `.partial` output means Kokoro is still writing or failed before final validation.

If the cached backend is missing, the job runs setup through the underlying generation script:

```bash
skills/agent-audio-brief/scripts/setup-kokoro.sh
```

Setup uses `uv` with Python 3.12 when available, otherwise `python3.12`. If neither exists, block and ask for one of those prerequisites. Do not use Python 3.14 for Kokoro generation, and do not perform ad hoc package installs during a normal brief request.

## Publish Bundle Hygiene

Keep generation dependencies and publish artifacts separate:

```text
.artifacts/audio-briefs/<slug>/
  work/
    brief-script.txt
    logs or debug files only while blocked
  publish/
    index.html
    audio/
      brief.wav
```

Before here.now publish, fail if `publish/` contains `node_modules`, package files, helper scripts, chunks, logs, model files, virtual environments, partial files, or debug artifacts.

The expected happy-path publish bundle is only:

```text
publish/
  index.html
  audio/brief.wav
```

## Duration Sanity Check

Use `audio_job.duration_seconds` and `audio_job.duration_label` reported by `scripts/generate-audio-job.sh` after it validates the WAV with Python's standard `wave` module. Do not install or require external media metadata tools for the normal path.

Minimum check:

- A 400-450 word default script should not produce a 20-30 second file.
- A generated file under 90 seconds for a 350+ word script is suspicious.
- A generated file under 30 seconds for a 150+ word script is suspicious.

If suspicious, do not publish. Treat it as blocked at Kokoro audio completeness.

## here.now Publishing

If the here.now skill is missing, install it:

```bash
npx skills add heredotnow/skill --skill here-now -g -y
```

If npm is unavailable:

```bash
curl -fsSL https://here.now/install.sh | bash
```

Publish the `publish/` bundle directory, not the run root and not the `work/` directory:

```bash
skills/agent-audio-brief/scripts/publish.sh <publish-dir> --client opencode
```

Use the here.now skill helper instead only when its dependencies, including `jq`, are available.

Return `publish_result.site_url` from the script output. Use `publish_result.auth_mode` and `publish_result.persistence` to state whether the site is permanent or expires.

## Final Handoff Checklist

Before final response, verify:

- `index.html` existed in the published bundle root before publish
- `scripts/generate-audio-job.sh wait` or `status` reported `audio_job.status=ready`
- `scripts/generate-audio-job.sh wait` or `status` reported `audio_job.output_ready=true` and `audio_job.sanity_check=passed`
- final audio file existed at `audio/brief.wav` before publish
- no `audio/brief.wav.partial` or other partial audio file existed in the publish bundle
- audio duration passed sanity check
- page referenced `audio/brief.wav`
- transcript and minimal source context were embedded in `index.html`
- publish bundle did not contain `node_modules`, package files, model files, chunks, helper scripts, logs, or debug artifacts
- here.now publish returned a `publish_result.site_url`
- published page and audio URL responded when checked
- successful publish artifacts were removed locally
- preserved debug artifacts, if any, live under `debug/` and are mentioned only if they matter
- final response leads with one here.now URL
