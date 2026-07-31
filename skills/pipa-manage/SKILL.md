---
name: pipa-manage
description: "Use when the user wants to operate Pipa itself: onboard Pipa into their business, update business profile/preferences, manage company brain or memory, connect tools, configure automations/triggers/loops, or audit what Pipa knows and can access."
metadata:
  version: 0.2.0
---

# Pipa Manage

Set up and maintain Pipa as an operations agent.

## Use For

- First-time Pipa setup and global business-profile review or updates.
- Business profile, company brain, memory, permissions, and access review.
- Connected tool setup, global connector-map maintenance, and Composio connection readiness.
- Automations, triggers, loops, scheduled workflows, and recurring work setup.

## References

- Load `references/setup.md` for first-time setup or global profile review/update.
- Load `references/connectors.md` for connected-tool setup, connector status, and Composio connection readiness.

## Output Contract

- Configuration objective.
- Current setup state or `TBD`.
- Needed inputs, access, or decisions.
- Safety/permission check.
- Next setup action.

## Boundaries

- If the user is doing business work now, route to the relevant business lane.
- If the user wants a standalone utility output, route to `pipa-tools`.
- Do not block concrete work because `~/.pipa/profile.md` is missing.
- First-time setup must not create tasks, reminders, automations, triggers, or recurring workflows.
- Do not create automations, connect tools, or write memory without explicit confirmation when the action changes external state.

## Gotchas

- First-time setup asks only what the user does, who they help or work with, and how they like to work; each answer may be skipped.
- Tool connection status must be verified before claiming access.
- Company brain writes need user intent and a clear destination.
