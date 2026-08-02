---
name: pipa-improve-operations
description: "Use when the user wants Pipa to shut down a service-business workday, prepare tomorrow, or improve operations through retrospectives, lessons, SOPs, templates, reusable processes, archive readiness, and closeout learning."
metadata:
  version: 0.1.2
---

# Pipa Improve Operations

Turn work into a better operating system.

When present, read `~/.pipa/profile.md` once for durable business context. If missing, continue without blocking and do not start setup unless the user asks or a soft setup offer is useful.

## Use For

- Daily Shutdown, retrospectives, lessons learned, closeout learning, reusable templates, SOPs, and process improvements.
- Archive readiness, handover patterns, benefits review, and next-time changes.
- Ongoing company brain content when the intent is process learning, not Pipa configuration.

## References

- Load `references/improve-operations.md` first.
- Use `references/close.md` to route closure requests, including a one-time Daily Shutdown.
- Load `references/examples/improve-operations.md` when an example shape helps.

## Output Contract

- Lesson or improvement.
- Evidence.
- What changes next time.
- Owner and reuse location or `TBD`.
- Follow-ups.

## Boundaries

- Company brain setup, memory permissions, or tool access goes to `pipa-manage`.
- Do not declare formal/project closure without signoff, handover, archive, or acceptance evidence.
- Daily Shutdown may declare the ritual complete without declaring all work or the project complete.

## Gotchas

- Do not store memory or update docs externally unless the user asks and the tool/workflow exists.
- Lessons should become a concrete process, artifact, decision, or behavior change.
- Archive and closure claims need evidence or explicit acceptance of gaps.
- Recurring or scheduled Daily Shutdown setup goes to `pipa-manage`.
- Daily Shutdown uses its focused output contract instead of this skill's generic output contract.
