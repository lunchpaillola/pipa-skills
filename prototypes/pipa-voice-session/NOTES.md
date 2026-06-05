# PROTOTYPE - Pipa Voice Session

This is a prototype area for the `pipa-voice-session` skill.

The current `index.html` is a static UI exploration for the next hosted voice-session design. It focuses on the Quiet Lobby direction: pre-join, speaker activation, hands-free turns, centered orb states, processing audio cues, and live transcript text that appears only when useful.

The older local OpenCode bridge server is still present as scratch infrastructure, but the active production path now lives in `skills/pipa-voice-session/scripts/start-voice-session.mjs` and the hosted relay Worker.

## Prototype Directions

- **Join Lobby:** the baseline pre-join screen with optional name, manual speaker test, and a simple join moment before the orb appears.
- **Live Words:** the same lobby shape, but with a compact text area under the orb for interim transcription, the user's finalized turn, and the generated agent reply.
- **Chat Strip:** a ChatGPT Voice inspired direction where transcript is the main surface and a smaller orb sits near the bottom composer.

## Interaction Ideas Captured

- Ask for a name on pre-join, while allowing a known name to be prefilled.
- Speak an intro such as "You're in a huddle. Let's talk through updates" after the user manually tests speaker or joins.
- Make test speaker a first-class pre-join action to satisfy Safari and mobile audio activation requirements.
- Let the user speak hands-free, then auto-submit after a short silence window, likely 2 to 3 seconds.
- Play `processing.mp3` or another bundled file during the processing state once the asset exists.
- Keep transcript and typed fallback available, but hide them in popovers rather than making them primary page regions.
- Center the orb and let it carry ready, listening, processing, and speaking states.
- Explore whether transcript belongs as a quiet lobby module or as the primary surface with a smaller bottom orb.

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

- Static browser UI for comparing design directions.
- No production Worker or bridge behavior changed by this prototype.
- Browser `speechSynthesis` is used only for the test-speaker demo.
- `processing.mp3` is referenced as an optional future asset hook. If the file is missing, playback fails silently.
- Transcript content is sample prototype content, not stored session data.

## LAN Warning

Default to `localhost`. If testing on `0.0.0.0`, the page shows a visible LAN warning. Do not share a LAN URL without an explicit tokenized URL or equivalent guard.

## What To Look For

- Does the pre-join screen make joining feel intentional without adding ceremony?
- Does the speaker test feel necessary and reassuring, especially for Safari on mobile?
- Does the centered orb carry enough state by itself?
- Should live transcription sit under the orb, or should the transcript become the main surface with a smaller bottom orb?
- Which direction feels most like a calm operator workflow rather than a chatbot UI?
