---
shaping: true
title: "feat: Shape Pipa voice session skill"
type: feat
status: draft
date: 2026-06-02
branch: feat/pipa-video-conversation
note: "Branch name is historical; product name is pipa-voice-session."
---

# feat: Shape Pipa Voice Session Skill

## Source

Initial user goal:

> Basically, the idea here is a skill that would just allow you to jump into a video conversation with Pipa.
>
> The idea and the happy path would be like you have this skill, you can invoke this skill, do a link, get in there, boom, boom, boom, you've got it.

Direction updates:

> We're just going to call this a voice session as opposed to a video session.

> We are creating a voice session. That's the product choice.

> Think about it like talking in a session like a chat window, so same things apply. We are reading out what you type.

> Or it could just be a session to flesh out a plan and that plan would just get loaded into context to execute, not realtime voice coding. Just do work to flesh out an idea and plan and then have it execute.

Prototype and research references:

- `prototypes/agent-session-shapes/NOTES.md`
- `prototypes/agent-session-shapes/PRODUCT-THREAD.md`
- `prototypes/agent-session-shapes/index.html`
- `Future: OpenCode Realtime Bridge` section in this document

## Product Decision

The product is **Pipa Voice Session**.

It is not primarily:

- a video meeting product
- a realtime voice coding product
- an audio brief extension only
- a disconnected ChatGPT-style voice assistant

It is a live voice session with Pipa where the user can talk through an idea, answer clarifying questions, iterate toward a strong plan, and leave with context that can be loaded into the agent for execution.

The first valuable use case is **voice planning and shaping**, not hands-free coding. Realtime execution can come later after the planning session loop works.

## Problem

Text agents are good at execution, but detailed planning through text can be slow. The user often needs to think out loud, revise mid-sentence, answer follow-up questions, and discover what they actually want by talking. Audio briefs solve the first half of the loop: the agent can brief the user. The missing half is the user talking back and shaping the next move with the agent.

The strongest first product loop is:

1. User has an idea, artifact, or brief.
2. User starts a Pipa voice session.
3. Pipa asks targeted questions and reflects back tradeoffs.
4. User talks through goals, constraints, preferences, and edge cases.
5. Pipa produces a structured plan/context packet.
6. The agent loads that plan into context and executes afterward.

This preserves the value of voice without forcing V1 to solve safe realtime voice coding, background tool execution, and spoken permission approval all at once.

## Outcome

A user can open a link on the same computer, join a Pipa voice session, talk through an idea or plan, and leave with a detailed execution-ready plan that can be handed back to the active agent.

If browser-only STT/TTS is difficult, V1 may use a Daily room or equivalent audio transport as the session shell. The product requirement is the voice planning loop, not a specific transport.

## Requirements (R)

| ID | Requirement | Status |
|---|---|---|
| R0 | A user can start a live Pipa voice session and receive one usable link to join on the same computer. | Core goal |
| R1 | V1 is voice-first: the user speaks, Pipa speaks back, and the session feels like a conversational chat window read aloud. | Must-have |
| R2 | V1 focuses on planning/shaping: clarify the idea, identify decisions, surface tradeoffs, and produce an execution-ready context packet. | Must-have |
| R3 | The session output can be loaded into the active agent context for later execution. Realtime voice coding is not required for V1. | Must-have |
| R4 | Pipa can ask clarifying questions during the session rather than passively transcribing a monologue. | Must-have |
| R5 | The session tracks a structured plan state: goals, constraints, decisions, open questions, execution steps, risks, and next actions. | Must-have |
| R6 | The system can use the simplest viable audio transport: browser STT/TTS first if practical, or Daily/WebRTC if that is faster and more reliable. | Must-have |
| R7 | If connected to OpenCode, V1 may use the active session for context loading and post-session execution, but it does not need to stream live tool execution. | Must-have |
| R8 | The design has explicit privacy and retention boundaries for mic audio, transcripts, generated plans, and any external STT/TTS providers. | Must-have |
| R9 | Future versions can add realtime agent execution, permission handling, and optional video/presence without changing the core voice-session product identity. | Nice-to-have |

## Key Clarifications From Adversarial Review

| Question | Decision |
|---|---|
| Are we building this? | Yes. Build `pipa-voice-session`. |
| Is this video or voice? | Voice. Video/presence is optional future work. |
| Does V1 need realtime voice coding? | No. V1 can be a planning/shaping session whose output is loaded into context for execution after the session. |
| Does the user need to join from a phone? | Not for V1. Same-computer link is acceptable. |
| Is browser STT/TTS required? | No. Use it if practical; use Daily/WebRTC or another audio transport if faster. |
| Why not async voice notes only? | The core value is interactive iteration: Pipa asks clarifying questions, challenges assumptions, and converges on a better plan with the user. |

## Current System Baseline

| Area | What Exists | Notes |
|---|---|---|
| Audio brief primitive | `pipa-audio-brief` generates listenable review pages for artifacts. | Useful entry point, but not the whole product. |
| Agent-session prototype | `prototypes/agent-session-shapes/` compares standalone session, brief-page add-on, and async voice loop. | Supports the direction: walking/voice work sessions, video optional. |
| OpenCode bridge research | Preserved in the `Future: OpenCode Realtime Bridge` section below. | Useful for post-session context loading and later live execution. |
| Pailkit Daily/Pipecat runtime | Pailkit has Daily/Pipecat bot code with STT, LLM, TTS, transcript, and video output. | Possible fallback or future transport if browser voice is unreliable. |

## Shape Options (S)

## A: Browser voice planning shell

| Part | Mechanism | Flag |
|---|---|:---:|
| A1 | Serve a local voice page with microphone capture and spoken playback. | ⚠️ |
| A2 | Use browser STT/TTS for the first prototype when available. | ⚠️ |
| A3 | Run a conversational planning loop with Pipa and maintain structured plan state. | |
| A4 | Export the resulting plan/context packet for agent execution. | |

This is the smallest product-shaped version if browser STT/TTS works reliably enough on the same computer.

## B: Daily/WebRTC voice planning room

| Part | Mechanism | Flag |
|---|---|:---:|
| B1 | Create a Daily room or equivalent audio room for the voice session. | ⚠️ |
| B2 | Run a Pipa bot in the room using STT, LLM, and TTS. | ⚠️ |
| B3 | Keep the session audio-first; no video requirement. | |
| B4 | Generate the same structured plan/context packet after the call. | |

This costs more infrastructure, but it may be easier than fighting browser STT/TTS limitations and gives a reliable link-based session model.

## C: OpenCode realtime voice control

| Part | Mechanism | Flag |
|---|---|:---:|
| C1 | Connect the voice shell directly to an active OpenCode session. | ⚠️ |
| C2 | Send voice turns into OpenCode and narrate assistant/tool status. | ⚠️ |
| C3 | Handle permission prompts and interruption safely. | ⚠️ |

This is the bigger future product, but it is too much for the first proof because it combines voice UX, local bridge security, agent event streaming, and permission safety.

## D: Async voice note to action packet

| Part | Mechanism | Flag |
|---|---|:---:|
| D1 | User records a monologue. | |
| D2 | Pipa transcribes and structures it into decisions/actions. | |
| D3 | Agent executes from the action packet later. | |

This is useful but less compelling than a voice session because it lacks back-and-forth clarification. It can be a fallback mode, not the main product.

## Fit Check

| Req | Requirement | Status | A | B | C | D |
|---|---|---|---|---|---|---|
| R0 | A user can start a live Pipa voice session and receive one usable link to join on the same computer. | Core goal | ✅ | ✅ | ✅ | ❌ |
| R1 | V1 is voice-first: the user speaks, Pipa speaks back, and the session feels like a conversational chat window read aloud. | Must-have | ✅ | ✅ | ✅ | ❌ |
| R2 | V1 focuses on planning/shaping: clarify the idea, identify decisions, surface tradeoffs, and produce an execution-ready context packet. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R3 | The session output can be loaded into the active agent context for later execution. Realtime voice coding is not required for V1. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R4 | Pipa can ask clarifying questions during the session rather than passively transcribing a monologue. | Must-have | ✅ | ✅ | ✅ | ❌ |
| R5 | The session tracks a structured plan state: goals, constraints, decisions, open questions, execution steps, risks, and next actions. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R6 | The system can use the simplest viable audio transport: browser STT/TTS first if practical, or Daily/WebRTC if that is faster and more reliable. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R7 | If connected to OpenCode, V1 may use the active session for context loading and post-session execution, but it does not need to stream live tool execution. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R8 | The design has explicit privacy and retention boundaries for mic audio, transcripts, generated plans, and any external STT/TTS providers. | Must-have | ✅ | ✅ | ❌ | ✅ |
| R9 | Future versions can add realtime agent execution, permission handling, and optional video/presence without changing the core voice-session product identity. | Nice-to-have | ✅ | ✅ | ✅ | ❌ |

Notes:

- A is preferred if same-computer browser voice works.
- B is the fallback/preferred transport if browser STT/TTS becomes the hard part.
- C is intentionally not V1 because it over-scopes the first build into realtime voice coding.
- D is useful as fallback but fails the interactive session premise.

## Selected Shape

Proceed with **A: Browser voice planning shell**, with **B: Daily/WebRTC voice planning room** as the transport fallback.

The selected product loop is:

> Start a voice session, talk through the idea with Pipa, iterate until the plan is clear, then load that plan into the agent for execution.

## Detail A/B: Concrete Affordances

### UI Affordances

| Place | Affordance | User sees/does | Wires out |
|---|---|---|---|
| Agent chat | `pipa voice session` invocation | User asks to talk through an idea or plan by voice. | Session launch |
| Agent chat | Join handoff | One link to join the session on the same computer. | Voice session page or room |
| Voice session | Mic/listen control | User starts, pauses, resumes, or stops speaking. | STT/audio transport |
| Voice session | Spoken Pipa response | User hears clarifying questions, summaries, and tradeoffs. | TTS/audio transport |
| Voice session | Plan state panel | User sees goals, constraints, decisions, open questions, steps, risks, and next actions. | Plan-state store |
| Voice session | End session | User ends and gets an execution-ready plan/context packet. | Agent context handoff |

### Non-UI Affordances

| Place | Affordance | Mechanism | Wires out |
|---|---|---|---|
| Skill | Session setup | Start browser voice shell or Daily/WebRTC fallback and return link. | Join handoff |
| Voice loop | STT | Convert user speech to text turns. Browser STT or provider/room STT. | Planning agent turn |
| Voice loop | TTS | Read Pipa responses aloud. Browser TTS or provider/room TTS. | User audio |
| Planning agent | Clarifying loop | Ask targeted questions, reflect back decisions, identify gaps. | Plan state |
| Plan state | Structured packet | Maintain goals, constraints, decisions, open questions, steps, risks, next actions. | Final handoff |
| Context handoff | Agent execution setup | Save or paste/load the final plan into the active agent context for execution. | OpenCode or current agent |

## V1 Golden Path

1. User says: "Pipa voice session" or "talk this through with me."
2. Agent starts a local/browser voice shell, or starts a Daily/WebRTC voice room if that is the viable transport.
3. Agent returns one join link.
4. User opens the link on the same computer.
5. User talks through the idea.
6. Pipa asks clarifying questions and reads back its understanding.
7. Pipa maintains structured plan state during the session.
8. User ends the session when the plan feels ready.
9. Pipa produces an execution-ready plan/context packet.
10. The active agent loads the plan and executes afterward.

## Why This Is More Than Async Voice Notes

Async voice notes capture what the user already knows how to say. A voice session helps the user discover and refine the plan through conversation.

The value of the session is that Pipa can:

- ask what success looks like
- catch missing constraints
- challenge fuzzy scope
- reflect back tradeoffs
- ask for examples
- turn rambly speech into decisions
- identify what is still unknown
- stop when the plan is execution-ready

That interaction is the product. The final plan is the artifact.

## Proposed Repository Shape

This repo should hold the skill contract and planning-session instructions first:

```text
skills/pipa-voice-session/
  SKILL.md
  references/
    planning-session.md
    plan-packet-contract.md
    transport-options.md
    privacy-and-retention.md
  evals/
    trigger-eval-set.json
```

The executable prototype can start under `prototypes/agent-session-shapes/` or move to a separate runtime once real audio transport exists:

```text
pipa-voice-session/
  app/
    voice-shell/
    transport/
    plan-state/
    handoff/
```

## Plan Packet Contract

The final session output should be structured enough for an agent to execute without replaying the whole conversation.

```md
# Voice Session Plan Packet

## Goal

## Context

## Decisions Made

## Constraints

## User Preferences

## Open Questions

## Proposed Execution Steps

## Risks / Watchouts

## Definition Of Done

## Exact Prompt To Load Into Agent
```

## Implementation Slices

### Slice 1: Voice Planning Session Contract

Goal: define the skill behavior before committing to a transport.

Deliverables:

- Create `skills/pipa-voice-session/SKILL.md`.
- Define trigger language: "voice session," "talk this through," "walking work session," "plan this by voice."
- Define the planning-session conversation rules.
- Define the plan packet contract.
- Define blocked responses for missing audio transport.

Demo:

- Agent can run a simulated text-only version of the voice planning loop and produce a plan packet.

### Slice 2: Same-Computer Voice Shell Prototype

Goal: prove spoken back-and-forth on one machine.

Deliverables:

- Add a local voice page prototype.
- Use browser STT/TTS if workable.
- Run on host `0.0.0.0` only when explicitly requested for testing.
- Show live transcript and plan-state panel.

Demo:

- User opens a link, speaks, hears Pipa respond, and sees plan state update.

### Slice 3: Plan-State And Handoff

Goal: make the session output useful for execution.

Deliverables:

- Maintain structured plan state during the session.
- Generate the final plan packet.
- Provide an exact prompt/context block to load into the active agent.
- Optionally save the packet to `docs/plans/`.

Demo:

- A session ends with a plan packet that another agent can execute without additional context.

### Slice 4: Transport Fallback Spike

Goal: decide whether browser voice is enough or Daily/WebRTC is easier.

Deliverables:

- Test browser STT/TTS on target desktop browser.
- Test microphone behavior from same-computer link.
- If browser voice is flaky, prototype Daily/WebRTC audio-room transport.

Demo:

- We can choose the lowest-friction reliable transport for V1.

### Slice 5: Agent Context Loading

Goal: connect the plan packet to execution after the session.

Deliverables:

- Load or paste the final plan packet into the current OpenCode/agent session.
- Start execution only after the voice session ends or the user explicitly says to proceed.
- Keep realtime voice execution out of V1.

Demo:

- User finishes a voice planning session, then the agent executes from the generated plan.

## Future: OpenCode Realtime Bridge

OpenCode research suggests a later realtime voice-control version is feasible, but it should not drive V1.

Useful facts to preserve:

- `opencode serve` exposes a programmatic HTTP server and OpenAPI spec at `/doc`.
- Relevant APIs include sessions, messages, async prompts, aborts, shell/command calls, and event streams.
- A future bridge would likely use `POST /session/:id/message` or `POST /session/:id/prompt_async`, then watch `/event`, `/global/event`, or session messages.
- Realtime execution must preserve OpenCode's permission model and should not auto-approve tool/file changes.

Future bridge work should begin only after V1 proves the voice planning loop. The likely follow-up spike is: selected OpenCode session -> submit plan packet -> observe execution/status -> summarize result.

## Spikes Needed

### Spike T1: Audio Transport

Goal: identify the fastest reliable way to support same-computer voice sessions.

Questions:

| # | Question |
|---|---|
| T1-Q1 | Does browser STT/TTS work well enough on the target desktop browser? |
| T1-Q2 | Is a Daily/WebRTC room faster or more reliable for the first session link? |
| T1-Q3 | What data leaves the machine for each transport option? |
| T1-Q4 | What is the minimum setup needed for the user to join with one link? |

Acceptance: the spike is complete when we can choose browser voice or Daily/WebRTC for V1 with known privacy/setup tradeoffs.

### Spike P1: Planning Conversation Quality

Goal: prove that interactive voice planning beats async voice notes.

Questions:

| # | Question |
|---|---|
| P1-Q1 | What questions should Pipa ask to turn a fuzzy idea into an executable plan? |
| P1-Q2 | How does Pipa decide the plan is ready enough to stop? |
| P1-Q3 | What plan packet fields are actually needed for downstream execution? |
| P1-Q4 | How should Pipa handle rambly or contradictory user speech? |

Acceptance: the spike is complete when a simulated session produces a plan packet that feels materially better than a raw transcript or async note.

## Open Questions

| Question | Current Lean |
|---|---|
| What is the public skill name? | `pipa-voice-session`. |
| Is video part of V1? | No. |
| Is realtime voice coding part of V1? | No. The session creates a plan/context packet for later execution. |
| What is the first wedge? | Direct voice planning session; audio brief can become an entry point after the loop works. |
| Does this require OpenCode bridge first? | No. OpenCode matters for post-session context loading and later execution. |
| Should we use Daily? | Maybe, if browser STT/TTS is the hard part. Daily is a transport choice, not the product. |
| Should transcript be retained? | Default to transient transcript plus explicit final plan packet. |

## Risks

| Risk | Mitigation |
|---|---|
| We overbuild realtime agent control before proving voice planning. | Defer realtime execution; V1 ends with a plan packet. |
| Browser STT/TTS is unreliable. | Allow Daily/WebRTC as transport fallback. |
| The final output is just a transcript, not a plan. | Maintain structured plan state and use readiness checks before ending. |
| The voice session asks generic questions. | Define planning-session behavior and quality evals. |
| Users expect execution during the call. | Set expectation: planning first, execution after explicit handoff. |
| Privacy around voice is unclear. | Label mic, transcript, transport provider, and retention posture in the join handoff. |

## Success Criteria

V1 is successful when:

- A user can start a `pipa-voice-session` and join with one link on the same computer.
- The user can speak through an idea with Pipa and hear useful clarifying questions/responses.
- The session maintains visible structured plan state.
- The final output is an execution-ready plan packet, not just a transcript.
- The active agent can load the packet and execute after the session.
- The user feels the plan is better than what they would have produced through one async voice note.

## Not V1

- A video-first Daily meeting product.
- Realtime voice coding.
- Spoken permission approval for file/tool changes.
- Google Meet, Zoom, or Teams bot joins.
- Avatar generation or user-specific voice cloning.
- Full portability across every agent framework.
- Durable transcript retention beyond the final plan packet unless explicitly configured.
