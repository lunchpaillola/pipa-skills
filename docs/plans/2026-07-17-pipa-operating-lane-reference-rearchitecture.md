---
title: "Re-architect Pipa references around operating lane commands"
type: refactor
status: active
date: 2026-07-17
target_repo: project-management-skills
---

# Re-architect Pipa References Around Operating Lane Commands

## Summary

This plan changes the core `pipa` skill from a PM lifecycle command surface into six public operating-lane commands:

- `Pipa get work`
- `Pipa define work`
- `Pipa deliver work`
- `Pipa get paid`
- `Pipa keep clients`
- `Pipa improve operations`

This is a core Pipa curation pass, not a breakout-skill rewrite. The breakout skills stay standalone and authoritative. Core Pipa only references them as connected capabilities when a lane needs audio, voice, triggers, reminders, time records, or live app/tool access.

---

## Problem Frame

Pipa currently presents lifecycle routes like `initiate`, `plan`, `execute`, `monitor`, and `close`. Those references contain useful project-management methods, but they are not the clearest public mental model for Pipa's current product direction: operational skills for the agent someone already uses.

The new public model should describe the work around the work in service-business language. Existing lifecycle references become internal utilities reused by the lane references instead of competing with the new command surface.

Primary source context:

- Planning source: `Re-architect Pipa references around operating lane commands`
- Repo convention: new PM/delivery workflows normally belong under `skills/pipa/`, not as new top-level skills.
- Skill-design learning: keep `SKILL.md` concise, use progressive disclosure, and move detailed workflow instructions into `references/`.

---

## Scope Boundaries

### In Scope

- Rewrite only the core Pipa skill surface and supporting docs/evals.
- Add six lane references under `skills/pipa/references/`.
- Keep old lifecycle references intact and cite them as internal methods.
- Update Pipa routing, help/menu behavior, README framing, and Pipa eval coverage.
- Add explicit lane-vs-breakout precedence rules.

### Out Of Scope

- Do not edit files under these breakout skill directories:
  - `skills/pipa-triggers/`
  - `skills/pipa-time-tracking/`
  - `skills/pipa-follow-up-reminders/`
  - `skills/pipa-audio-brief/`
  - `skills/pipa-huddle-beta/`
  - `skills/composio/`
- Do not create new top-level lane skills.
- Do not add deep CRM, invoice, payment, bookkeeping, or outbound automation integrations in this pass.
- Do not delete, flatten, or rename existing lifecycle references in the first pass.
- Do not bump `metadata.version` or `VERSIONS.md` until merge-finalization.

### Deferred To Follow-Up Work

- Deep wedge implementations for invoice chase, lead qualification, relationship health, support triage, delivery hygiene, and agent-session learning loops.
- Renaming or deleting lifecycle references after the lane architecture proves stable.
- Tool-specific implementation changes inside breakout skills, if a future ticket explicitly scopes them.

---

## Key Decisions

1. Public commands use action verbs: `get work`, `define work`, `deliver work`, `get paid`, `keep clients`, `improve operations`.
2. Filenames can stay stable and readable with gerund forms where useful, e.g. `getting-paid.md`, while command aliases include both `get paid` and `getting paid`.
3. Lane intent wins by default. Breakout skills only win on exact trigger language: audio/listenable, live voice, event trigger, one-shot email reminder to the user, time entry/review, or external app/tool action.
4. Old lifecycle commands remain supported as compatibility aliases, but they should not be the visible menu.
5. Each lane reference must cite source methods instead of inventing generic prose.
6. One lane owns each turn unless the user explicitly asks for a command chain.

---

## Output Structure

```text
skills/pipa/
  SKILL.md
  references/
    help-menu.md
    pipa-tools/SKILL.md
    get-work.md
    define-work.md
    deliver-work.md
    getting-paid.md
    keep-clients.md
    improve-operations.md
    initiate*.md       # internal utilities, unchanged
    plan*.md           # internal utilities, unchanged
    execute*.md        # internal utilities, unchanged
    monitor*.md        # internal utilities, unchanged
    close*.md          # internal utilities, unchanged
  evals/
    evals.json
    trigger-eval-set.json
README.md
```

---

## Implementation Units

### U1. Rewrite The Core Pipa Router

**Goal:** Make `skills/pipa/SKILL.md` the concise lane-first router while preserving lifecycle compatibility and breakout guardrails.

**Requirements:** Advances the command-surface rewrite and the repo rule that Pipa remains one core skill with references underneath.

**Dependencies:** None.

**Files:**

- `skills/pipa/SKILL.md`
- `skills/pipa/evals/evals.json`
- `skills/pipa/evals/trigger-eval-set.json`

**Approach:**

- Rewrite frontmatter description around the six lane commands.
- Replace the lifecycle command matrix with a lane command matrix.
- Keep lifecycle words as compatibility aliases in tie-breakers, not primary menu items.
- Add route precedence rules for lane-vs-breakout conflicts.
- Keep `SKILL.md` short; detailed workflows belong in lane references.
- Do not weaken existing confirmation gates for triggers, reminders, Composio writes, huddle, audio, or time tracking.

**Patterns To Follow:**

- Current `skills/pipa/SKILL.md` structure: command matrix, routing rules, tie-breakers, references, gotchas.
- `skills/pipa-tools/SKILL.md` negative routing rules.
- `tasks/03-27-lessons-from-building-skills.md` progressive-disclosure guidance.

**Test Scenarios:**

- `Pipa get work from these messy lead notes` routes to the get-work lane.
- `Pipa define work from this client Slack thread` routes to define-work, asking for source content or tool access if needed.
- `Pipa deliver work: what is blocked?` routes to deliver-work.
- `Pipa get paid: which invoices need action?` routes to get-paid and does not claim payment-system access without a source.
- `Pipa keep clients: who needs a check-in?` routes to keep-clients and does not schedule a reminder by default.
- `Pipa improve operations from this completed project` routes to improve-operations.
- `Pipa plan this onboarding work` remains supported and reframes as define-work.
- `Pipa monitor this delivery week` remains supported and reframes as deliver-work unless money or relationship wording dominates.
- `Pipa brief this PR before standup` does not route to audio brief.
- `Pipa follow up with the client` does not route to follow-up reminders unless the user asks for an email reminder to themself at a specific time.

**Verification:**

- Pipa eval fixtures validate.
- Public help/menu and frontmatter no longer present lifecycle routes as the main model.
- No breakout skill directory files are changed.

### U2. Add The Six Lane References

**Goal:** Create the public progressive-disclosure layer for the six lane commands.

**Requirements:** Advances the lane architecture and the requirement that this is curation, not invention.

**Dependencies:** U1 for canonical command names.

**Files:**

- `skills/pipa-get-work/references/get-work.md`
- `skills/pipa-define-work/references/define-work.md`
- `skills/pipa-deliver-work/references/deliver-work.md`
- `skills/pipa-get-paid/references/getting-paid.md`
- `skills/pipa-keep-clients/references/keep-clients.md`
- `skills/pipa-improve-operations/references/improve-operations.md`
- `skills/pipa/evals/evals.json`

**Approach:**

- Use one repeatable template per lane: primary goal, starter jobs, required inputs, source/tool expectations, reused Pipa references, connected capabilities, source methods, workflow, output shape, and rules.
- Each lane must cite at least two existing lifecycle references where applicable.
- Keep output contracts phone-screen friendly: current state, source, owner, next action, unknowns, and confidence where useful.
- Use `TBD` for missing owner/date/source facts.
- Do not copy full lifecycle workflows into lane references.

**Patterns To Follow:**

- Existing lifecycle references under `skills/pipa/references/`.
- `skills/pipa/references/communication-style.md` for user-facing output shape.
- Existing plan source mapping for each lane in this file's prior draft.

**Test Scenarios:**

- Find work produces opportunity, why now, fit/urgency/confidence, next action, owner, and source/TBD.
- Define work produces working brief, in scope, out of scope, acceptance checks, open questions, decision needed, and source/TBD.
- Deliver work produces current state, blockers, next action, owner, escalation trigger, and source/TBD.
- Get paid produces money item, amount/account/project if known, status, recommended follow-up, owner, due/review date, source/TBD, and risk.
- Grow relationships produces relationship needing attention, why now, suggested touch, owner, timing, source/TBD, and watchlist.
- Learn from the work produces lesson, evidence, what changes next time, owner, reuse location/TBD, and follow-ups.

**Verification:**

- Each lane reference exists and links to existing lifecycle references instead of duplicating them.
- Each lane has source-methods coverage and explicit non-goals.
- No lane reference implies unsupported external writes or automation.

### U3. Preserve And Reframe Breakout Skills As Connected Capabilities

**Goal:** Make breakouts discoverable from Pipa lanes without editing or weakening the breakout skills themselves.

**Requirements:** Satisfies the explicit constraint that `pipa-triggers`, `pipa-time-tracking`, and other breakouts stay as-is.

**Dependencies:** U1 and U2.

**Files:**

- `skills/pipa/SKILL.md`
- `skills/pipa-tools/SKILL.md`
- `skills/pipa-get-work/references/get-work.md`
- `skills/pipa-define-work/references/define-work.md`
- `skills/pipa-deliver-work/references/deliver-work.md`
- `skills/pipa-get-paid/references/getting-paid.md`
- `skills/pipa-keep-clients/references/keep-clients.md`
- `skills/pipa-improve-operations/references/improve-operations.md`
- `skills/pipa/evals/evals.json`

**Approach:**

- Reference breakout skills as connected capabilities under relevant lanes.
- Add `pipa-time-tracking` to Pipa's connected-capability framing if it is currently missing.
- Keep breakout-specific setup, confirmation, and execution rules inside each breakout skill.
- Use a clear rule: Pipa routes into a breakout only when the user asks for that breakout's specific job.
- Do not edit any files under breakout skill directories.

**Patterns To Follow:**

- Existing `pipa-tools/SKILL.md` routing guardrails.
- README breakout list and descriptions.
- AGENTS.md rule to preserve standalone breakouts.

**Test Scenarios:**

- `Pipa deliver work every Friday at 9` routes toward triggers only after trigger proposal confirmation.
- `Pipa remind me to chase this invoice Friday` routes to follow-up reminders only as a one-shot email reminder to the verified user.
- `Pipa get paid: review billable time` can route to time tracking for time-record review but does not claim invoicing/payroll support.
- `Pipa define work by voice` routes to huddle only when the user wants live voice.
- `Pipa learn from this session as an audio brief` routes to audio brief only because audio/listenable intent is explicit.
- `Pipa get work from Gmail` routes through Composio discovery/schema rules if live Gmail access is required.

**Verification:**

- Git diff shows no modifications in `skills/pipa-triggers/`, `skills/pipa-time-tracking/`, `skills/pipa-follow-up-reminders/`, `skills/pipa-audio-brief/`, `skills/pipa-huddle-beta/`, or `skills/composio/`.
- Breakout-positive and breakout-negative evals validate.

### U4. Update Help Menu And README Around The Lane Model

**Goal:** Make public docs match the new Pipa mental model.

**Requirements:** Advances the acceptance that the visible command surface is lane-based and that breakouts appear as connected capabilities.

**Dependencies:** U1 and U2.

**Files:**

- `skills/pipa/references/help-menu.md`
- `README.md`
- `skills/pipa/evals/evals.json`

**Approach:**

- Update `help-menu.md` to recommend lane commands first.
- Keep `help-menu.md` tiny if `SKILL.md` contains the main menu.
- Rewrite README first screen around Pipa's six operating lanes.
- Keep the breakout table, but frame breakouts as separately installable connected capabilities instead of competing core products.
- Keep proprietary internal context out of public README copy.

**Patterns To Follow:**

- Current README structure: install first, what Pipa adds, core skill, breakout skills.
- `skills/pipa/references/help-menu.md` concise help response shape.

**Test Scenarios:**

- `Pipa help` with sparse context returns the six lanes and a small connected-capability note.
- Unknown Pipa command returns the lane menu and asks at most one clarifying question.
- README lists all existing breakouts without implying they were merged into core Pipa.

**Verification:**

- README and command menu use the same six command names as `SKILL.md`.
- Lifecycle commands are compatibility notes, not the public first screen.

### U5. Expand Pipa Eval Coverage For Routing Safety

**Goal:** Make the rearchitecture testable through generic public eval fixtures.

**Requirements:** Ensures the lane rewrite does not regress old compatibility or route generic lane work into narrow breakout workflows.

**Dependencies:** U1 through U4.

**Files:**

- `skills/pipa/evals/evals.json`
- `skills/pipa/evals/trigger-eval-set.json`
- `evals/cross-lane-handoffs/evals.json`

**Approach:**

- Add six lane happy-path evals.
- Keep lifecycle aliases as compatibility evals.
- Add negative routing evals for audio brief, reminders, triggers, Composio, huddle, and time tracking.
- Update cross-lane handoff evals to use lane chains where useful.
- Keep public eval data generic and free of customer/private context.

**Patterns To Follow:**

- Existing Pipa eval fixture style.
- Repo validators for skill frontmatter and eval fixtures.

**Test Scenarios:**

- Six lane happy paths pass.
- Old `plan`, `execute`, `monitor`, and `close` prompts still route through compatibility behavior.
- Negative breakout prompts do not over-route.
- External-send prompt drafts only and requires explicit confirmation before sending.
- Cross-lane chain examples recommend next lanes without executing multiple lanes unless asked.

**Verification:**

- Skill frontmatter validation passes.
- Skill eval validation passes.
- Relevant test suite passes or any unrelated failures are documented.

---

## System-Wide Impact

- Users see Pipa as one operating-lane skill, not a PM lifecycle catalog.
- Existing lifecycle references remain available to implementation agents as internal utilities.
- Breakout skills remain independently installable and retain their safety contracts.
- README and evals become the guardrail against future drift back to lifecycle-first routing.

---

## Risk Analysis

| Risk | Mitigation |
|---|---|
| Breakout skills accidentally modified | Treat breakout directories as out of scope and verify with git diff. |
| Generic prompts over-route into narrow breakouts | Add explicit precedence rules and negative evals. |
| Lane references become generic AI prose | Require source-method citations and reused lifecycle references in every lane. |
| Lifecycle commands disappear too abruptly | Keep compatibility aliases, but hide them from the primary menu. |
| Public docs and evals drift from command names | Use one canonical command list across `SKILL.md`, README, menu, and evals. |

---

## Verification Plan

- Validate skill frontmatter.
- Validate skill eval fixtures.
- Run the repository's relevant test suite if available.
- Review git diff for the no-breakout-edit invariant.
- Manually inspect `Pipa help` output shape, six lane routes, lifecycle compatibility, and breakout-negative cases.

---

## Acceptance Criteria

- `skills/pipa/SKILL.md` exposes the six lane commands as the primary public routes.
- Public command names use action verbs, with sensible aliases for gerund wording.
- `help-menu.md` recommends lane commands and common lane paths.
- Six lane reference files exist and cite existing lifecycle references as source methods.
- Existing lifecycle references remain usable and are not deleted or flattened.
- Breakout skills remain standalone and unedited.
- Core Pipa references breakouts only as connected capabilities with their original guardrails.
- README presents Pipa around the lane-based operating surface.
- Pipa evals include six lane happy paths, lifecycle compatibility, and breakout-negative cases.
- No new top-level standalone skills are added for the six lanes.
- Version bumps remain deferred until merge-finalization.

---

## Implementation Notes

- Prefer the smallest diff that changes the public mental model: core router, lane references, menu, README, evals.
- Do not solve every deep wedge during this pass. If a lane exposes a deeper product opportunity, cite it as deferred follow-up.
- Use connected tools only through the existing Composio/Pipa breakout rules and include concise provenance when live records are used.
