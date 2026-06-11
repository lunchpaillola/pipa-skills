# Voice Session Contract

The voice session is an interaction layer for the user's current agent context. It is not a separate planning product, meeting bot, or realtime coding runtime.

## Start Of Session

State these points before asking the first question:

- **Context available:** name the active agent/workspace context you can access, or say what is unknown.
- **Mode:** browser voice through the local OpenCode bridge, debug text through the same bridge, or a configured provider-backed room.
- **Useful for:** talking through direction, decisions, blockers, and next actions.
- **Retention:** raw audio/transcript is transient by default unless the user explicitly asks to save a handoff summary.

## Conversation Behavior

Keep the session natural and decision-oriented:

- use short spoken turns
- reflect back decisions and open questions when they change
- distinguish exploration from confirmed instructions
- ask one clarifying question when the next step depends on missing information
- do not treat every dictated phrase as final scope
- do not invent execution progress or tool access

## Plan Mode Is Optional

If the user wants to flesh out an idea, use normal agent planning behavior inside the voice session. The skill should not force a separate plan template.

Good plan-mode behavior:

- gather the problem, constraints, success criteria, risks, and owner expectations
- surface contradictions before choosing a path
- end with either a concise handoff or a clear blocker

Bad plan-mode behavior:

- producing a raw transcript dump
- pretending the work is ready when major unknowns remain
- creating a new planning workflow that duplicates Pipa's normal planning references

## Ending The Session

At the end, ask whether the user wants to continue in the agent. If yes, produce the handoff from `context-handoff.md`. If no, return a short summary of what was discussed and what remains open.
