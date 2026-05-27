# Local Review Bundle

The local bundle is an implementation detail that supports the single user-facing page. The user should receive one `index.html` page path or local URL, not a list of bundle files.

## Suggested Layout

```text
audio-briefs/<safe-slug>/
  index.html
  audio/
    brief.wav
```

This is the expected successful layout. Keep relative paths stable enough for `index.html` to work when opened locally or served from the directory.

Do not leave temporary dependency folders in the final artifact. If a local TTS package needs installation, install in a temporary generation directory or clean generated `node_modules`, lockfiles, logs, helper scripts, and test audio after producing the final page/audio.

## Artifact Lifecycle

Classify every generated file before final handoff.

**Durable user-facing bundle:** keep after successful generation.

- `index.html`
- final audio file referenced by the page

`index.html` must embed the transcript and minimal source context needed to trust the brief. Do not keep separate `transcript.md`, `page-contract.json`, or `provenance.json` after success.

**Temporary sawdust:** delete by default after success.

- `node_modules`, package lockfiles, virtual environments, model scratch folders, and dependency caches created only for generation
- temporary Kokoro helper scripts
- chunk audio files after they have been concatenated into the final audio
- test audio files
- server logs
- failed page drafts
- one-off symlinks such as temporary `voices/` links
- page-contract JSON, provenance JSON, and transcript markdown after their contents have been embedded in `index.html`
- raw extracted HTML or intermediate markdown

**Debug artifacts:** keep only when needed.

- Preserve logs, failed chunks, page-contract JSON, provenance JSON, transcript markdown, or helper scripts only if generation is blocked and they explain the blocker.
- Put preserved debug files under a clearly named `debug/` directory.
- Mention preserved debug files in the final blocker response so the user knows they exist.

The final response should not expose sawdust. It should lead with one page URL/path and mention only meaningful blocker/debug artifacts.

## Required User-Facing Behavior

- Return a local HTTP URL as the primary result when possible. Serve the bundle with a static server bound to `0.0.0.0` by default, then verify the URL before returning it.
- Return `index.html` or a `file://` path only when an HTTP server is unavailable or unnecessary.
- Embed or link the Kokoro audio internally.
- Include the transcript inside the page. Keep source context minimal and inline. The final page should use the low-brand read-along document format from `single-page-ui-contract.md` unless the user explicitly requests a richer UI.
- Keep raw artifacts discoverable only when useful or explicitly requested.

## Local HTTP And Tailscale Links

For generated audio briefs, default to local HTTP serving. If the user asks to view through Tailscale, LAN, phone, mobile, or another device, use the same server and prefer the reachable device URL in the final response:

1. Serve the bundle directory with a simple static server.
2. Bind to a reachable interface such as `0.0.0.0`, not only `127.0.0.1`.
3. Return `http://0.0.0.0:<port>/index.html` for local-host review when no better reachable hostname is known.
4. Use the provided Tailscale IP/hostname when available.
5. Verify the URL with a HEAD/GET request when possible.
6. Return the HTTP URL first.

Prefer one stable port per generated page and record it in the final response. If the server command cannot stay alive in the harness, report that and return the file path instead of pretending the HTTP URL will persist.

Example final link:

```text
http://0.0.0.0:<port>/index.html
```

Example cross-device link:

```text
http://100.x.y.z:<port>/index.html
```

If the server cannot persist in the current harness, say so and still return the durable local file path.

## Partial States

- If Kokoro is blocked, do not call the bundle complete. A page may still show the script and blocker, but the final status is blocked.
- If page generation fails after audio generation, report the page-generation blocker and do not pretend the user-facing experience exists.
- If raw audio exists but no page exists, return the audio status as partial and state the next action needed to create the page.

## Local-Only Defaults

- No external upload by default.
- No public sharing by default.
- No durable storage guarantees beyond files written in the current workspace.
- No authentication or access control implied for local files.

## Future Hosting Branch

If a publisher is later configured, deploy the same static page first and label visibility accurately. Start with static page publishing before adding server-backed comments, chat, accounts, or Proof-style collaboration.
