# PROTOTYPE - Walking Work Session Shapes

This is throwaway UI code for comparing three possible shapes for away-from-laptop agent work sessions, with the likely target now narrowed to bidirectional voice control for connected agents.

## Question

What is the next product shape after `pipa-audio-brief` if the real vision is work that can move with the user, where the user can talk to a connected agent, the agent can speak back, and the agent can start doing work during the session?

## Shapes

1. **Portable connected agent meeting**
   A portable skill any sandbox agent can use to launch an audio-first walking work session. The user controls the agent by voice. The agent speaks back, refines direction, and executes against its connected tools/context when safe. Video/presence is optional, not the point.

2. **Brief page add-on**
   A `Start work session` button on the existing listening page. The session is anchored to the brief transcript, source context, and attention areas, then becomes a back-and-forth shaping and execution conversation.

3. **Voice-only async walk loop**
   A lower-infrastructure path: listen to a brief, record a messy walk note, and turn it into a reviewable action packet. This is useful, but it is less aligned with the conversation vision.

## One Command

```bash
python3 -m http.server 8787
```

Run it from this directory, then open `http://localhost:8787`.

You can also jump directly to a shape:

- `http://localhost:8787?shape=standalone`
- `http://localhost:8787?shape=brief`
- `http://localhost:8787?shape=voice`

## What To Look For

- Does the portable voice-controlled work session feel like the real product, with audio briefs as one use case?
- Does the brief-page button feel like the smallest high-value wedge?
- Does the voice-only loop capture most of the value without live session or video complexity?
- Does video add useful presence, or does it distract from the actual job: thinking and deciding while away from the laptop?
- What does the agent need to say and do during the session for this to feel like working together rather than dictating notes?

## Current Hunch

The likely wedge is **brief page add-on first**, because it extends the existing audio brief surface and keeps the first session grounded in a concrete artifact. The broader direction is not "video calls with agents". It is **walking work sessions with connected agents**: brief me, let me talk back, speak back to me, shape the work with me, and start executing while we talk.

The standalone portable session skill can remain the larger product direction. The voice-only loop is the lowest-cost fallback and may be the right first implementation if live session infrastructure becomes distracting.

## Prototype Status

- Static HTML only.
- No real Daily.co, WebRTC, STT, TTS, or agent backend.
- Fake state is rendered visibly after interactions.
- Delete or fold the learning into a requirements doc once the direction is chosen.
