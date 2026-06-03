# Walking Work Sessions Product Thread

## Core Distinction

This is not primarily about having a video call with an agent.

A video call is a possible interface. The job is a **portable connected agent meeting**: the user can leave the laptop, hear the state of work, talk back to the agent, shape the work through conversation, and let the agent start doing the work during the session.

There are two separate modalities:

1. **Presence sessions**
   Face-to-face or video-like sessions where visual presence creates focus, accountability, rehearsal pressure, or coaching energy.

2. **Walk-and-talk agent work**
   Audio-first sessions where the user works with a connected agent by voice while away from the laptop. The agent speaks back, answers questions, refines direction with the user, and executes when the user gives it enough confidence.

The second modality is the one closest to the current vision.

## Why This Fits The Audio Brief Vision

`pipa-audio-brief` solves one friction point: agents create artifacts that require review, and review is laptop-bound.

The next friction point is what happens after listening: the user wants to jump into a connected conversation, talk through the work, refine direction, and have the agent actually start doing things.

The user needs a way to say:

- yes, do this
- no, change this
- draft this reply
- make these tradeoffs
- turn that into a plan
- send this back to the agent queue

That makes the product loop:

1. Agent prepares work.
2. Pipa turns it into a listenable brief.
3. User jumps into a walk-and-talk session.
4. User asks questions, talks through judgment, and refines direction.
5. Agent speaks back, checks understanding, and starts working where safe.
6. Agent keeps a running execution state: done, doing, needs confirmation, blocked.
7. User redirects, approves, or asks it to continue.

## What Video Is Good For

Video/presence may matter when the session benefits from social pressure or rehearsal:

- presentation practice
- difficult conversation rehearsal
- coaching
- focused decision sessions where visual presence creates accountability
- screen/object discussion where the agent needs to see something

But video should not define this product thread. If the core user is walking, eating ice cream, commuting, on the train, in the car, or away from the desk, bidirectional audio is the default.

## Three Candidate Product Shapes

### 1. Portable Connected Agent Meeting

Any connected agent can launch a walking work session where the user talks through the work, the agent speaks back, and the agent can execute against its existing tools/context during the session.

This is the biggest product idea. Audio briefs, morning rituals, debriefs, coaching, brainstorms, reviews, and execution sessions become use cases of one portable bidirectional voice session primitive.

Risk: it may be too broad for the next wedge.

### 2. Brief Page Add-On

The listening page gets a `Start work session` button.

The session starts with context already loaded: source, transcript, attention areas, and the brief's takeaway. The key behavior is not just recording the user's response. It is letting the agent talk back, refine the direction with the user, and begin the work while the conversation is still happening.

This is likely the best wedge because it extends an existing artifact and answers the immediate question: "I listened. Now I want to talk through what to do."

Risk: it may look smaller than the bigger vision unless the action packet is strong.

### 3. Voice-Only Walk Loop

The brief ends with tailored prompts. The user records a messy note while walking. Pipa processes it into decisions and actions.

This is the lowest-infrastructure version of the product if live back-and-forth is too much at first.

Risk: it may miss the main value: the user wants a connected conversation with an agent that can do work, not just asynchronous dictation.

## Product Bet

The strongest first bet is probably:

**Brief page add-on with a bidirectional voice work session that can execute.**

The implementation can start without video. If video later proves useful, it becomes an optional presence layer, not the core promise.

The main promise is: **listen to the brief, start talking, shape the work, and let the agent do stuff while you are still talking.**

## Running Work State

Every walking work session needs a running work state, not just an end-of-session packet:

- decisions made
- changes requested or already applied
- drafts or replies to send
- tasks currently being executed
- unresolved questions
- items already completed
- items safe to keep executing
- items requiring confirmation before execution

The session can still produce a final summary, but that summary is not the core product. The core product is connected voice control over an agent that can keep working.

## Conversation Behaviors That Matter

The session should not behave like passive transcription. It should behave like an agentic conversation:

- play back the brief or a shorter recap
- let the user ask questions about the brief, source, or current work
- interrupt gently when an instruction is ambiguous or risky
- confirm risky actions before execution
- keep a running summary of decisions
- turn rambling voice into structured commands
- distinguish "thinking out loud" from "do this"
- let the user say "do that," "keep going," "stop," or "try another version"
- execute safe actions during the session
- narrate what it is doing without forcing the user back to a screen
- produce a final summary only as a recap, not as the main handoff

## Product Boundary

This should not be scoped as a disconnected voice chat product. The differentiator is that the session belongs to whatever agent already has the user's context and tools.

The boundary is:

> A portable skill that lets any connected agent expose a live voice work session.

That means the skill should be usable by an agent that already has access to Linear, GitHub, email, docs, local files, plans, or whatever context it normally works with. The session is the voice control layer over that agent, not a new isolated assistant.

## Research Follow-Up

OpenCode-first feasibility research is saved at `docs/plans/2026-06-02-research-pipa-voice-session-opencode-bridge.md`.

The key research conclusion: OpenCode already exposes server/session/message/event APIs that make a first `pipa-voice-session` adapter plausible. Proof SDK is the architectural analogy: one shared session surface plus adapter/bridge contracts for agents.
