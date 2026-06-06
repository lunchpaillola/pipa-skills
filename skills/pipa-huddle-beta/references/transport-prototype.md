# Transport And OpenCode Bridge

V1 uses a same-computer localhost bridge. It is intentionally small but real: browser voice captures the user's turn, a local Node server sends that turn to OpenCode, and the browser speaks the OpenCode reply.

For sandboxed or remote-browser use, the hosted relay path in `hosted-relay.md` is the primary transport. It preserves this local bridge loop while putting an HTTPS/WSS relay in front of it. Localhost remains the development and same-machine fallback.

## V1 Runtime

Run from the repository root:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs
```

Open `http://127.0.0.1:8787`.

For quick remote testing, use ngrok public mode:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --public ngrok
```

This starts the local bridge, starts `ngrok http <port>`, polls ngrok's local API for the HTTPS URL, and prints `Public voice session: <url>`. The ngrok tunnel is stopped when the script exits. First-time ngrok use may require:

```bash
ngrok config add-authtoken <token>
```

The bridge does this for each user turn:

```text
Pipa Huddle template -> Browser SpeechRecognition -> POST /api/turn -> first turn creates Pipa Huddle session -> later turns use opencode run --session <huddle-session-id> --dir <repo> -> browser SpeechSynthesis
```

Environment variables:

- `PIPA_VOICE_SESSION_PORT`: defaults to `8787`
- `PIPA_VOICE_SESSION_HOST`: defaults to `127.0.0.1`
- `PIPA_VOICE_SESSION_DIR`: defaults to the server working directory
- `PIPA_VOICE_SESSION_HUDDLE_SESSION`: optional existing huddle session id to resume; otherwise the bridge creates a fresh huddle session on the first turn
- `PIPA_VOICE_SESSION_OPENCODE_SESSION`: backward-compatible alias for `PIPA_VOICE_SESSION_HUDDLE_SESSION`
- `--context-file <path>`: path to a text/Markdown context summary file, normally `.pipa/voice-session/launch-context.md`; injected into the first huddle turn only
- `PIPA_VOICE_SESSION_CONTEXT_FILE`: environment equivalent to `--context-file`, for automation only
- `PIPA_VOICE_SESSION_CONTEXT`: inline context fallback for automation only; prefer `--context-file` so launch context is visible and skill-contained
- `--model <current-opencode-model>`: preferred way to pass the launching session's OpenCode model into the dedicated huddle session; prevents fallback to a different machine default provider
- `PIPA_VOICE_SESSION_MODEL`: environment equivalent to `--model <current-opencode-model>` for automation
- `OPENCODE_MODEL`: fallback model source when set by the runtime; explicit `--model` remains preferred for inspectable launches
- `PIPA_VOICE_SESSION_ALLOW_LATEST_SESSION`: manual-debug fallback only; set to `1` or pass `--allow-latest-session` to pin the latest `opencode session list --format json --max-count 1` result when intentionally debugging without a huddle session id
- `PIPA_VOICE_SESSION_PUBLIC`: set to `ngrok` to start an HTTPS ngrok tunnel
- `PIPA_VOICE_SESSION_TEMPLATE`: optional absolute HTML template path; defaults to the skill-local `templates/huddle.html`
- `PIPA_VOICE_SESSION_TURN_TIMEOUT_SECONDS`: OpenCode turn timeout, defaults to `300`
- `OPENCODE_BIN`: defaults to `opencode`

Hosted relay bridge mode environment variables:

- Normal user path: `node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --hosted --model <current-opencode-model>`
- `PIPA_VOICE_RELAY_PUBLIC_BASE_URL`: optional override for session creation; defaults to `https://voice.usepipa.com`
- `PIPA_VOICE_RELAY_URL`: operator/debug-only hosted relay WebSocket URL
- `PIPA_VOICE_RELAY_SESSION_ID`: operator/debug-only hosted relay session id
- `PIPA_VOICE_RELAY_BRIDGE_TOKEN`: operator/debug-only bridge role token for the session
- `PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS`: optional hosted-mode OpenCode args; unset by default and must use flags supported by the installed `opencode run`

Text entry is a debug/accessibility input path. It still sends the turn to OpenCode; it is not a canned simulation.

## Later Candidates To Compare

| Candidate | What It Proves | Main Risk |
|---|---|---|
| Browser STT/TTS | Low-memory voice loop with minimal setup | `SpeechRecognition` is limited and may use browser/cloud services |
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

- serve the bundled UI through `node skills/pipa-huddle-beta/scripts/start-voice-session.mjs`
- keep the UI deterministic through `references/template-contract.md`
- call `opencode run --format json --title "Pipa Huddle" --dir <repo>` for the first turn when no huddle session exists, plus `--model <current-opencode-model>` from the launching session
- include the compact launch context in that first prompt when provided
- capture the returned JSON `sessionID`
- call `opencode run --format json --session <huddle-session-id> --dir <repo>` for all later turns

## Huddle Session ID

The huddle is a dedicated OpenCode session, not a continuation of the caller's thread. When no huddle session id is supplied, the first turn creates a new session with `opencode run --format json --title "Pipa Huddle"`. The bridge captures the returned `sessionID` and uses `--session <id>` for every later turn.

If the launching thread has useful context, write a compact summary to `.pipa/voice-session/launch-context.md` and pass it with `--context-file .pipa/voice-session/launch-context.md`. The bridge adds it only to the first huddle prompt as background from the launching thread. Later turns use normal short voice prompts inside the huddle session.

Do not use `opencode session list --max-count 1` as the normal detector. It is useful for humans copying ids and for manual debugging, but it can point at an unrelated run.
- use `--public ngrok` for the quickest remote HTTPS test
- use browser speech synthesis as the default reply voice for lower memory pressure and faster startup
- label browser STT/TTS as browser-mediated and not guaranteed on-device
- shape voice replies for browser speech: short, conversational, and no bullets by default
- keep browser transcript state in memory only
- treat OpenCode's own session history as the durable agent-side record
- use the handoff preview only when the user wants a concise continuation artifact

## Non-Goals

- Do not auto-approve OpenCode tools, files, or shell commands by voice.
- Do not add spoken permission approval.
- Do not require video or avatar presence.
- Do not persist raw transcript/audio by default.

## Hosted Relay Guardrail

Hosted relay mode routes remote browser text into the local bridge, so it must be explicitly requested with `--hosted`. Hosted mode does not add OpenCode flags by default. If custom `PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS` are set, they must be supported by the installed `opencode run` or the bridge blocks instead of invoking OpenCode.

The relay route is not a generic pipe. It validates role, session, message type, size, and direction before forwarding. Unknown message types, binary frames, duplicate browser tabs, wrong-role tokens, and command-like payloads are blockers.

## LAN Testing Guardrail

Default to `localhost`. If testing on `0.0.0.0`, show a visible warning that other LAN users may reach the page and require an explicit tokenized URL or equivalent guard before sharing.
