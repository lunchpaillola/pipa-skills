# Pipa Huddle Beta

Start here if you want to talk to the current agent by voice.

`README.md` is for humans reading or running this skill directly. `SKILL.md` is the agent-facing instruction file that tells an agent when and how to start a huddle.

## Start A Hosted Voice Session

Run this from the repository root:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --daemon --print-url-json --model <current-opencode-model>
```

If you copy or install only the `skills/pipa-huddle-beta` directory, install its local Node dependency first:

```bash
npm install --prefix skills/pipa-huddle-beta
```

Hosted mode is the default. The command creates a per-huddle hosted session at `voice.usepipa.com`, starts the local bridge as a managed daemon, connects it to your current OpenCode context, and prints JSON events with the browser link and process metadata:

```json
{"event":"voice_session_daemon_started","browser_url":"https://voice.usepipa.com/s/<session-id>#token=...","pid":12345,"stop_command":"kill 12345","log_path":".pipa/voice-session/bridge.log"}
```

Open that link in any browser with microphone access. Each run gets its own session URL and credentials, so multiple users can use `voice.usepipa.com` at the same time without sharing a room.

The process metadata is for the launching agent or operator. Each managed launch stops only the previously recorded project-local Pipa Huddle bridge from `.pipa/voice-session/bridge.pid`, writes fresh metadata to `.pipa/voice-session/session.json`, and exits when the huddle session ends.

The bridge creates a dedicated OpenCode session for each huddle on the first spoken/text turn, captures that new session id from `opencode run --format json`, and pins later voice turns to it with `--session <id>`. This keeps the huddle from drifting into an older or unrelated thread. Use `--huddle-session <id>` only to resume an existing huddle session; `--allow-latest-session` is available only for manual debugging.

To seed the huddle with prior conversation context, pass a compact summary inline with `PIPA_VOICE_SESSION_CONTEXT` for that launch only. The summary should only include what the user was discussing, relevant decisions/preferences, open questions, and files or repo details needed to understand that discussion. If the user only asked to start a huddle, omit context. Do not include launch mechanics, daemon details, URLs, model/runtime details, or instructions to start the huddle; the huddle has already started by the time this context is used.

Pass `--model <current-opencode-model>` from the launching OpenCode session so the huddle does not fall back to a different machine default provider. The bridge also honors `PIPA_VOICE_SESSION_MODEL` and `OPENCODE_MODEL`, but explicit `--model` is the clearest launch path.

## What It Does

- renders the deterministic Pipa Huddle template from `templates/huddle.html`
- browser captures one spoken turn from the huddle orb
- hosted relay forwards the final text turn only
- local bridge creates a dedicated huddle session, then runs later turns against that huddle session
- browser speaks the assistant reply with browser speech synthesis by default

Hosted mode does not add OpenCode flags by default. It forwards your spoken/text turn to the local OpenCode bridge; OpenCode's normal session and permission behavior still applies.

## Local Fallback

If hosted relay is unavailable, run the same-machine local bridge:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --daemon --print-url-json --local --model <current-opencode-model>
```

Then open the `browser_url` from the JSON output on the same machine.

The local bridge serves the skill-local template documented in `references/template-contract.md`. Override it only for explicit experiments:

```bash
PIPA_VOICE_SESSION_TEMPLATE=/absolute/path/to/index.html node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --daemon --print-url-json --local
```

## Browser Speech

Browser speech synthesis is the default voice output for hosted and local sessions. It has lower memory pressure, starts faster, and is less likely to fail in small sandbox environments. The page speaks replies at normal browser speed to keep the huddle calm and legible.

Voice-session replies should stay conversational: one or two short sentences, no bullets or long markdown by default. Longer written detail belongs in the visible transcript or a handoff, not the spoken turn.

The local huddle uses short sound-design cues for entering the huddle and thinking. Join first speaks `Entering the huddle.`, enters the huddle, plays the entry cue, speaks `Hi {name}, excited to speak to you! What's on your mind?`, then starts listening. Thinking audio is best-effort because mobile browsers may block delayed playback, so the thinking state also shows an animated `Thinking...` fallback.

After the agent finishes speaking, the huddle automatically returns to listening for the next turn when browser speech recognition is available. If the session is ended, expired, or the bridge/relay disconnects, the UI shows a disconnected state and instructs the user to ask the agent to reconnect using the skill.

OpenCode turns default to a 300-second timeout so larger planning or implementation requests have room to finish. Override with `PIPA_VOICE_SESSION_TURN_TIMEOUT_SECONDS=<seconds>` when testing unusually long turns.

## Operator Notes

Normal users do not need Wrangler, Cloudflare credentials, relay tokens, or session ids. Deployment details live in `references/hosted-relay.md` and `cloudflare/`.
