# Pipa Gotchas

Use this before owner-facing output, live-tool work, or ambiguous routing.

## Routing

- Do not force generic coding, writing, research, or translation into Pipa.
- No command plus useful context should route by intent, not default to the menu.
- Old lifecycle words are compatibility aliases, not the public model.
- Connected capabilities require exact intent. `brief` is not audio; `follow up` is not an email reminder; `weekly` can be a reporting horizon, not automation.

## Sources

- Never imply live app access unless a connected tool actually ran.
- If sources are pasted, say the answer is based on pasted material.
- Use `TBD` for missing owner, date, source, amount, or decision evidence.
- Cite the smallest useful source: record ID, doc name, issue/PR link, message/thread link, or pasted note label.

## Approval Gates

- Sending messages, creating/updating external records, scheduling reminders, creating triggers, publishing audio pages, or writing financial data requires explicit approval or a standalone skill gate.
- One approval covers one batch only. Changed draft, added recipient, or new record means approve again.
- Never overwrite originals when exporting, archiving, or updating external docs unless the user explicitly asks.

## Output

- Return one primary lane. Secondary lanes are follow-ups, not parallel workflows, unless the user asks for a chain.
- Keep the decision stub visible: next action, owner, date, evidence.
- Financial, relationship, and delivery-risk claims need evidence or `TBD`.
