---
name: pipa-keep-clients
description: "Use when the user wants Pipa to maintain client trust: follow-ups, check-ins, client health, retention, renewals, referrals, testimonials, stakeholder care, and relationship-sensitive next actions."
metadata:
  version: 0.1.0
---

# Pipa Keep Clients

Protect trust after and around delivery.

## Use For

- Client check-ins, relationship health, retention, renewals, referrals, and testimonials.
- Follow-up wording when the user wants to keep trust or recover momentum.
- Relationship risks surfaced by delivery or closeout.

## References

- Load `references/keep-clients.md` for the lane workflow.
- Load `references/examples/keep-clients.md` when an example shape helps.

## Output Contract

- Client or relationship signal.
- Why now.
- Suggested touch or ask.
- Owner and timing.
- Source/evidence or `TBD`.
- Watchlist items.

## Boundaries

- Do not send messages or schedule reminders unless explicitly asked.
- One-shot self-email reminders go through `pipa-tools` to `pipa-follow-up-reminders`.
- Active delivery status stays `pipa-deliver-work` unless relationship health dominates.

## Gotchas

- Do not fake relationship history; mark unknown context as `TBD`.
- Generic follow-up is client work, not a reminder, unless future self-email wording is explicit.
- Testimonials, referrals, and renewals should be grounded in delivered value or client signal.
