# Transport And OpenCode Bridge

V1 uses a same-computer localhost bridge. It is intentionally small but real: browser voice captures the user's turn, a local Node server sends that turn to OpenCode, and the browser speaks the OpenCode reply.

## V1 Runtime

Run from the repository root:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

Open `http://127.0.0.1:8787`.

For quick remote testing, use ngrok public mode:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs --public ngrok
```

This starts the local bridge, starts `ngrok http <port>`, polls ngrok's local API for the HTTPS URL, and prints `Public voice session: <url>`. The ngrok tunnel is stopped when the script exits. First-time ngrok use may require:

```bash
ngrok config add-authtoken <token>
```

The bridge does this for each user turn:

```text
Browser SpeechRecognition -> POST /api/turn -> opencode run <message> --continue --dir <repo> -> browser SpeechSynthesis
```

Environment variables:

- `PIPA_VOICE_SESSION_PORT`: defaults to `8787`
- `PIPA_VOICE_SESSION_HOST`: defaults to `127.0.0.1`
- `PIPA_VOICE_SESSION_DIR`: defaults to the server working directory
- `PIPA_VOICE_SESSION_OPENCODE_SESSION`: optional explicit OpenCode session id; otherwise uses `--continue`
- `PIPA_VOICE_SESSION_PUBLIC`: set to `ngrok` to start an HTTPS ngrok tunnel
- `OPENCODE_BIN`: defaults to `opencode`

Text entry is a debug/accessibility input path. It still sends the turn to OpenCode; it is not a canned simulation.

## Later Candidates To Compare

| Candidate | What It Proves | Main Risk |
|---|---|---|
| Browser STT/TTS | Same-computer voice loop with minimal setup | `SpeechRecognition` is limited and may use browser/cloud services |
| Daily/WebRTC audio room | Shareable hosted room and production-like audio session | Requires provider setup, room lifecycle, and privacy docs |
| Same-computer/browser-session path | Agent-adjacent local session with the least infrastructure | May only work on localhost and may not generalize to remote machines |

## Acceptance Checks

Each candidate should prove:

- user can start the localhost bridge
- user can speak a turn in a browser with speech recognition support
- OpenCode responds through the bridge
- browser TTS speaks the OpenCode response when supported
- transcript/state updates are visible during the session
- optional handoff can be generated from state
- mic denial and unavailable speech APIs produce clear blockers
- privacy/retention wording is visible before use

## Chosen V1 Direction

Use the same-computer OpenCode bridge as the default V1 path:

- serve the bundled UI through `node skills/pipa-voice-session/scripts/start-voice-session.mjs`
- call `opencode run --continue --dir <repo>` for turns unless a session id is wired later
- use `--public ngrok` for the quickest remote HTTPS test
- label browser STT as browser-mediated and not guaranteed on-device
- keep browser transcript state in memory only
- treat OpenCode's own session history as the durable agent-side record
- use the handoff preview only when the user wants a concise continuation artifact

## Non-Goals

- Do not auto-approve OpenCode tools, files, or shell commands by voice.
- Do not add spoken permission approval.
- Do not require video or avatar presence.
- Do not persist raw transcript/audio by default.

## LAN Testing Guardrail

Default to `localhost`. If testing on `0.0.0.0`, show a visible warning that other LAN users may reach the page and require an explicit tokenized URL or equivalent guard before sharing.
