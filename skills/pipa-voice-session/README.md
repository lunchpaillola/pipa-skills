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

- browser captures one spoken turn or text fallback
- hosted relay forwards the final text turn only
- local bridge runs `opencode run` against the pinned OpenCode session
- browser speaks the assistant reply

Hosted mode does not add OpenCode flags by default. It forwards your spoken/text turn to the local OpenCode bridge; OpenCode's normal session and permission behavior still applies.

## Local Fallback

If hosted relay is unavailable, run the same-machine local bridge:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

Then open `http://127.0.0.1:8787` on the same machine.

## Operator Notes

Normal users do not need Wrangler, Cloudflare credentials, relay tokens, or session ids. Deployment details live in `references/hosted-relay.md` and `cloudflare/`.
