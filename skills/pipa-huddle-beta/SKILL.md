---
name: pipa-huddle-beta
description: "Use when the user wants to talk through work with Pipa or their current agent in a live voice huddle: Pipa Huddle, Pipa voice session, talk this through, walking work session, plan this by voice, voice call with my agent, or discuss this out loud. Starts a voice huddle with agent context and optional handoff. Do not use for audio brief generation, generic TTS, video meetings, Zoom/Meet bots, or realtime voice coding/permission approval."
metadata:
  version: 0.1.0
---

# Pipa Huddle Beta

Start a voice session with the user's agent so they can talk through work out loud. Planning and handoff are optional modes of use, not a separate workflow this skill imposes.

Output goal: start the hosted voice bridge, state context and retention clearly, and optionally produce a concise continuation handoff.

Communication style contract: when returning user-facing status, blockers, or final handoffs, apply `skills/pipa/references/communication-style.md` when available.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Voice Session Progress
- [ ] Step 1 complete: intent and voice-session scope confirmed
- [ ] Step 2 complete: available agent context and session limits stated
- [ ] Step 3 complete: local OpenCode voice bridge availability checked
- [ ] Step 4 complete: browser voice session started or blocker returned
- [ ] Step 5 complete: session notes synthesized without treating raw transcript as durable state
- [ ] Step 6 complete: optional handoff produced when the user wants to continue execution
```

### Step 1: Confirm Intent

Use this skill when the user asks to talk with Pipa or the active agent by voice, including hosted or relay-backed sessions from another browser. Route audio artifacts to `pipa-audio-brief`, human video meetings elsewhere, and realtime voice coding or spoken approvals to a clear scope blocker.

### Step 2: Frame The Session Contract

Follow `references/session-contract.md`.

At session start, state:

- which agent/context is available
- what the voice session can do now
- what it cannot do in V1
- whether raw audio/transcript is transient or saved

Do not imply that voice mode is a separate agent brain. The voice session is an interaction layer over the current agent context.

### Step 3: Start The Local OpenCode Voice Bridge

Follow `references/transport-prototype.md`, `references/hosted-relay.md`, `references/template-contract.md`, and `references/privacy-and-retention.md`.

The bridge creates a dedicated OpenCode session for the huddle on the first spoken/text turn, captures that new session id from `opencode run --format json`, and reuses it for the rest of the huddle with `--session <id>`. This avoids guessing from `opencode session list` and avoids attaching voice turns to an unrelated existing thread.

Before launch, synthesize a compact context handoff from the current thread into `.pipa/voice-session/launch-context.md`, then start the bridge with `--context-file .pipa/voice-session/launch-context.md`. Keep it selective: current goal, relevant files or repo context, decisions/preferences, open questions, and what not to assume. The bridge injects this handoff into the first huddle turn only, so the dedicated huddle session starts informed without continuing the caller's thread.

Pass the current OpenCode model into the bridge with `--model <current-opencode-model>` so the huddle uses the same model as the launching session. Do not rely on OpenCode defaults and do not hardcode a provider-specific model in the skill; use the model id from the active agent session. If the current runtime exposes `OPENCODE_MODEL`, the bridge also honors it, but explicit `--model` is preferred because daemon and hosted launches are easier to inspect.

Use the hosted relay path for sandboxed or remote-browser use. The production relay is `https://voice.usepipa.com`; each launch creates a separate session URL under `/s/<session-id>` and pairs it with a local bridge that connects outbound to `/ws/<session-id>`.

Use the bundled same-computer bridge at `skills/pipa-huddle-beta/scripts/start-voice-session.mjs` as the local fallback and development path. It serves a localhost browser UI, captures speech with browser APIs, sends each turn to `opencode run`, and speaks the OpenCode response with browser speech synthesis.

The local bridge serves the deterministic huddle template defined in `references/template-contract.md`. By default it renders the skill-local file `templates/huddle.html`; set `PIPA_VOICE_SESSION_TEMPLATE=/absolute/path/to/index.html` only for explicit template experiments.

Default hosted launch command from the repository root:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --context-file .pipa/voice-session/launch-context.md --model <current-opencode-model>
```

Local fallback:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --local --context-file .pipa/voice-session/launch-context.md --model <current-opencode-model>
```

Quick public HTTPS debug test with ngrok:

```bash
node skills/pipa-huddle-beta/scripts/start-voice-session.mjs --public ngrok --context-file .pipa/voice-session/launch-context.md --model <current-opencode-model>
```

Hosted mode should create the relay session, connect the local bridge, and print one browser URL. Hosted mode does not add OpenCode flags by default. It forwards the user's spoken/text turn to the local OpenCode bridge; OpenCode's normal session and permission behavior still applies.

Do not continue the caller's thread by default. The huddle is a side-room: it creates a new OpenCode session on the first turn, then keeps all huddle turns in that session with `--session <id>`. Use `--huddle-session <id>` only to resume an existing huddle session, and use `--allow-latest-session` only for manual debugging.

If the bridge cannot start, block clearly. Do not pretend that browser STT, Daily/WebRTC, or another provider is available without checking.

### Step 4: Run The Voice Session

During the session:

- keep turns extremely short and conversational because browser speech is the output
- default to 1-2 short sentences for spoken replies
- avoid bullets, numbered lists, headings, markdown formatting, and long explanations unless the user explicitly asks for detail
- ask clarifying questions when the user's direction is fuzzy or contradictory
- track useful context, decisions, preferences, blockers, and open questions
- treat rambly speech as discovery input, not as final instructions unless the user confirms
- avoid storing raw transcript/audio by default

Text entry is allowed as a debug/accessibility input path, but agent replies must come from OpenCode or return a blocker.

### Step 5: Optional Context Handoff

Follow `references/context-handoff.md` only when the session ends with execution intent or the user asks to continue in the agent.

### Step 6: Return Status Or Blocker

Happy-path final response:

```md
Voice session ready: `<session URL or local prototype URL>`

- **Context:** <agent/context available>
- **Mode:** <hosted HTTPS relay plus outbound local bridge|browser voice through local OpenCode bridge|debug text through local OpenCode bridge|configured provider>
- **Retention:** <relay forwards final text turns without retaining bodies by default; transient raw audio/transcript; optional handoff only if saved>
```

Blocked final response:

```md
Voice session blocked.

- **Blocked at:** <transport|microphone|privacy|scope>
- **Why:** <specific blocker>
- **Next:** <minimum action needed>
```

## References

- `references/session-contract.md`
- `references/context-handoff.md`
- `references/transport-prototype.md`
- `references/hosted-relay.md`
- `references/template-contract.md`
- `references/privacy-and-retention.md`
