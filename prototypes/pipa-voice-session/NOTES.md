# PROTOTYPE - Pipa Voice Session

This is a same-computer OpenCode voice bridge for the `pipa-voice-session` skill.

It demonstrates the session contract with real agent turns: browser voice when available, a localhost Node bridge, `opencode run`, spoken responses, live transcript display, session-state extraction, and optional context handoff.

## One Command

The operational bridge now lives inside the skill:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

For quick remote HTTPS testing:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs --public ngrok
```

Run it from the repository root, then open `http://127.0.0.1:8787`.

This prototype folder is retained only as development scratch space.

## Prototype Status

- Local Node server plus static browser UI.
- Calls local OpenCode with `opencode run <message> --continue --dir <repo>`.
- Browser `SpeechRecognition` is used only when available.
- Browser speech is browser-mediated and may use cloud speech services depending on browser and OS.
- Browser transcript state is kept in memory only and clears when the page reloads or the end/clear action runs.
- OpenCode session history follows normal local OpenCode behavior.
- The handoff preview is optional, and only durable if the user copies it.

## LAN Warning

Default to `localhost`. If testing on `0.0.0.0`, the page shows a visible LAN warning. Do not share a LAN URL without an explicit tokenized URL or equivalent guard.

## What To Look For

- Does the page make the session contract clear before voice use?
- Does the browser voice turn reach OpenCode and get a real response?
- Does debug text still reach OpenCode when STT is unavailable?
- Does the handoff synthesize useful context instead of dumping transcript?
- Does the privacy/retention copy feel clear enough for confidential work?
- Does this support choosing one V1 transport rather than shipping many fallback branches?
