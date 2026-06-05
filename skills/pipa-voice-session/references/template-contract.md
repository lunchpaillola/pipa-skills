# Voice Session Template Contract

The local voice bridge renders a deterministic browser UI from a single HTML template inside this skill. By default, `start-voice-session.mjs` serves:

```text
skills/pipa-voice-session/templates/huddle.html
```

This file is part of the skill package so someone can download `skills/pipa-voice-session/` by itself and get the same huddle UI. Prototype folders may mirror or experiment with the template, but they are not the source of truth.

Override the template only for explicit experiments:

```bash
PIPA_VOICE_SESSION_TEMPLATE=/absolute/path/to/index.html node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

## Required Shape

The template must be a static HTML file with no build step. It must load over localhost, ngrok HTTPS, or the hosted relay page without relying on bundlers, prototype folders, or private assets outside `skills/pipa-voice-session/`.

The current template has two user-facing views:

- Join view: collects display name, tests browser speech output, then starts the huddle entry sequence on Join.
- Huddle view: shows the orb, current state label, inline live transcript, voice picker, compact transcript modal, microphone mute control, pause/resume control, and end-session control.

## Required Local Bridge Endpoints

The template must call these endpoints when running behind the local bridge:

- `GET /api/status`: detects whether the real bridge is available.
- `POST /api/turn` with `{ "message": "..." }`: sends a final user turn to OpenCode and expects `{ "ok": true, "reply": "..." }`.

If `GET /api/status` is unavailable, the template may run in demo mode for design review, but it must not pretend to be connected to OpenCode.

## Required DOM Hooks

Keep these hooks stable unless the bridge script and QA checklist are updated together:

- `[data-screen="join"]`
- `[data-screen="orb"]`
- `[data-name-input]`
- `[data-test-speaker]`
- `[data-join]`
- `[data-orb]`
- `[data-state]`
- `[data-orb-state]`
- `[data-live-transcript]`
- `[data-transcript-text]`
- `[data-transcript-modal]`
- `[data-transcript-turns]`
- `[data-mute]`
- `[data-pause]`
- `[data-voice]`
- `[data-voice-panel]`
- `[data-voice-options]`
- `[data-end-session]`

## Visual Contract

The template should preserve the current product register:

- light theme only
- `Pipa Huddle` brand with only the small audio bars in blue
- no prototype chrome, route tabs, or relay labels in the main UI
- centered gradient orb with pixelated halftone texture
- minimal state labels: `Ready`, `Listening`, `Thinking`, `Speaking`
- inline transcript text centered, italicized, and background-free
- transcript in a compact borderless modal with internal scrolling
- voice picker populated from real browser `speechSynthesis.getVoices()` values
- no borders on buttons or popups
- entry and thinking sound cues served by the local bridge from `sound-design-entering-chat.mp3` and `sound-design-thinking.mp3`
- animated `Thinking...` state as the reliable fallback when mobile browsers block delayed thinking audio

## Lifecycle Contract

The local bridge lifecycle is deterministic:

```text
Join -> `Entering the huddle.` -> Huddle ready -> entry sound -> `Hi {name}, excited to speak to you! What's on your mind?` -> Listening -> SpeechRecognition final turn -> thinking sound -> POST /api/turn -> OpenCode reply -> SpeechSynthesis reply -> Listening for next turn
```

Speech recognition failures, non-HTTPS public URLs, missing bridge APIs, and OpenCode errors must surface as visible inline transcript messages rather than silent failures.

After the agent finishes speaking, the template should automatically start the next listening turn when browser speech recognition is available. If automatic listening cannot start, it must show a ready/error message instead of requiring the user to infer what happened.

Pause keeps the session open but stops automatic listening until the user resumes. It must not disconnect the bridge or erase transcript state.

Mute is microphone mute. It must stop active `SpeechRecognition`, prevent auto-listening while muted, and resume listening after unmute when the session is otherwise active.

When the user ends the session or the bridge/relay becomes unavailable, the UI should stay in the huddle and show this disconnected state copy: `The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-voice-session skill`
