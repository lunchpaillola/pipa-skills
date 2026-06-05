# Pipa Voice Session

Start here if you want to talk to the current agent by voice.

## Start A Hosted Voice Session

Run this from the repository root:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs --hosted
```

The command creates a short-lived hosted session at `voice.usepipa.com`, connects the local bridge to your current OpenCode context, and prints one browser link:

```text
Browser voice session: https://voice.usepipa.com/s/<session-id>#token=...
```

Open that link in any browser with microphone access. Each run gets its own session URL and credentials, so multiple users can use `voice.usepipa.com` at the same time without sharing a room.

At startup, the bridge resolves the latest OpenCode session id and pins voice turns to that explicit session with `--session <id>`. This keeps the voice session attached to the thread that was active when the bridge started, instead of drifting to whichever thread later becomes "last". Set `PIPA_VOICE_SESSION_OPENCODE_SESSION=<session-id>` to override the pinned session.

## What It Does

- renders the deterministic Pipa Huddle template from `templates/huddle.html`
- browser captures one spoken turn from the huddle orb
- hosted relay forwards the final text turn only
- local bridge runs `opencode run` against the pinned OpenCode session
- browser speaks the assistant reply with browser speech synthesis by default

Hosted mode does not add OpenCode flags by default. It forwards your spoken/text turn to the local OpenCode bridge; OpenCode's normal session and permission behavior still applies.

## Local Fallback

If hosted relay is unavailable, run the same-machine local bridge:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

Then open `http://127.0.0.1:8787` on the same machine.

For a public HTTPS local test, use ngrok:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs --public ngrok
```

The local bridge serves the skill-local template documented in `references/template-contract.md`. Override it only for explicit experiments:

```bash
PIPA_VOICE_SESSION_TEMPLATE=/absolute/path/to/index.html node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

## Browser Speech

Browser speech synthesis is the default voice output for hosted and local sessions. It has lower memory pressure, starts faster, and is less likely to fail in small sandbox environments. The page speaks replies at normal browser speed to keep the huddle calm and legible.

Voice-session replies should stay conversational: one or two short sentences, no bullets or long markdown by default. Longer written detail belongs in the visible transcript or a handoff, not the spoken turn.

The local huddle uses short sound-design cues for entering the huddle and thinking. Join first speaks `Entering the huddle.`, enters the huddle, plays the entry cue, speaks `Hi {name}, excited to speak to you! What's on your mind?`, then starts listening. Thinking audio is best-effort because mobile browsers may block delayed playback, so the thinking state also shows an animated `Thinking...` fallback.

After the agent finishes speaking, the huddle automatically returns to listening for the next turn when browser speech recognition is available. If the session is ended, expired, or the bridge/relay disconnects, the UI shows a disconnected state and instructs the user to ask the agent to follow the skill for a fresh session URL.

OpenCode turns default to a 300-second timeout so larger planning or implementation requests have room to finish. Override with `PIPA_VOICE_SESSION_TURN_TIMEOUT_SECONDS=<seconds>` when testing unusually long turns.

## Operator Notes

Normal users do not need Wrangler, Cloudflare credentials, relay tokens, or session ids. Deployment details live in `references/hosted-relay.md` and `cloudflare/`.
