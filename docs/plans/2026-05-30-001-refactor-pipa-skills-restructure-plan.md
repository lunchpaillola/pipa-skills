---
title: "refactor: Restructure PM skills into Pipa"
type: refactor
status: active
date: 2026-05-30
origin: docs/brainstorms/2026-05-30-pipa-skills-restructure-requirements.md
---

# refactor: Restructure PM skills into Pipa

## Summary

Build `pipa` as the primary entry skill, move PM workflows behind Pipa references, preserve selected standalone skills without editing them, and add lightweight eval coverage before deleting the old `pm-*` public surface. The implementation should prioritize a concise command router, progressive disclosure, preserved safety gates, and a README that teaches Pipa as one PM brain.

---

## Problem Frame

The current repo has strong PM workflow coverage, but users must choose among many `pm-*` skills and routers before getting work done. The requirements establish a new product shape: Pipa is one PM brain with commands underneath, not a catalog of lifecycle skills.

---

## Requirements

- R1. Reposition the repository from Project Management Skills to Pipa Skills.
- R2. Present Pipa as a product name, not an acronym.
- R3. Describe Pipa as one PM brain from the user perspective.
- R4. Implement Pipa as a command framework from the workflow architecture perspective.
- R5. Reduce the need to remember separate PM skill names.
- R6. Support explicit command invocation and natural-language PM routing.
- R7. Preserve existing PM lifecycle workflows as reusable Pipa references.
- R8. Collapse old PM router behavior into Pipa command dispatch.
- R9. Cover core lifecycle jobs: initiate, plan, execute, monitor/status, triage, budget, risk/escalation, and close.
- R10. Preserve shared PM communication behavior as a common Pipa reference or contract.
- R11. Keep `agent-audio-brief` as a separately discoverable top-level skill.
- R12. Keep `composio` as a separately discoverable top-level skill.
- R13. Keep `pailflow-triggers` and `pailflow-workflow-automation` as separately discoverable top-level skills.
- R14. Reserve breakout skills for high-value, tool/product-specific, or independently discoverable workflows.
- R15. Let Pipa route into audio brief, Composio, PailFlow trigger, and PailFlow recurring automation workflows.
- R16. Preserve breakout workflow safety gates, setup checks, confirmations, and output contracts when Pipa routes into them.
- R17. Treat `agent-audio-brief`, `composio`, `pailflow-triggers`, and `pailflow-workflow-automation` as read-only during this restructure. Agent Audio Brief took significant iteration and should stay exactly as it is; the other named breakout skills should also not be edited.
- R18. Remove old standalone `pm-*` skill folders in the first Pipa release rather than keeping compatibility shims.
- R19. Lead README with the Pipa mental model before detailed command coverage.
- R20. Teach users to install/invoke Pipa first and document breakout skills separately.
- R21. Avoid presenting the old PM lifecycle taxonomy as the primary public organizing model.
- R22. Borrow Impeccable's command-first docs structure: product claim, command navigation, command groups, and practical examples.
- R23. Group commands by user job or lifecycle category, not old skill folder names.
- R24. Show common command chains.
- R25. Recommend high-value next commands when the user does not know where to start.
- R26. Keep public copy direct, opinionated, and concrete.
- R27. Defer a full docs site; v1 only needs README and skill docs to establish the structure.
- R28. Follow `tasks/03-27-lessons-from-building-skills.md`: concise entry skill, progressive disclosure, concrete trigger descriptions, gotchas, explicit setup patterns, and curated non-overlap.
- R29. Add eval coverage for explicit command routing, natural-language routing, PM reference selection, standalone workflow invocation, and command menu clarity.
- R30. Include negative evals for over-routing, skipped confirmations, weakened safety rules, and attempted edits to read-only breakout skills.
- R31. Keep eval coverage lightweight for the first release.

**Origin actors:** A1 User, A2 Agent, A3 Maintainer, A4 Downstream planner/implementer
**Origin flows:** F1 explicit command routing, F2 natural-language routing, F3 breakout discovery, F3b breakout invocation, F4 repository migration, F5 documentation navigation, F6 evaluation
**Origin acceptance examples:** AE1 status routing, AE2 planning routing, AE3 breakout discovery, AE4 PailFlow automation safety, AE5 audio brief routing, AE6 README start path, AE7 command docs, AE8 public copy, AE9 eval coverage

---

## Scope Boundaries

### Deferred for later

- Full public docs site equivalent to `impeccable.style/docs/`.
- Dedicated CLI/plugin distribution layer modeled after Impeccable's installer and harness-specific builds.
- Heavyweight usage instrumentation beyond lightweight evals and simple undertriggering checks.
- New standalone high-value skills beyond the named breakouts.
- Version bumps and `VERSIONS.md` updates until final merge prep, per `AGENTS.md`.

### Outside this product's identity

- Maintaining all current PM workflows as independent public top-level skills.
- Providing compatibility shims for every old `pm-*` skill in the first Pipa release.
- Editing `agent-audio-brief`, `composio`, `pailflow-triggers`, or `pailflow-workflow-automation` as part of this restructure.
- Reframing Pipa as a generic all-purpose agent brain beyond project, delivery, and PM work.
- Expanding Pipa into a forced acronym.
- Treating the PM lifecycle lane taxonomy as the main public product story.
- Copying Impeccable's design-domain command set or visual brand literally.
- Flattening specialized standalone workflows so Pipa bypasses their confirmations, setup rules, or gotchas.

### Deferred to Follow-Up Work

- Repo rename on GitHub and registry/package rename coordination if those require owner-side actions outside file changes.
- Future docs site or generated docs layer after the README and skill docs prove the Pipa shape.

---

## Context & Research

### Relevant Code and Patterns

- Current skill folders follow `skills/<skill-name>/SKILL.md` with optional `references/`, `scripts/`, `assets/`, and `evals/`.
- `skills/pm-initiate/SKILL.md`, `skills/pm-plan/SKILL.md`, `skills/pm-execute/SKILL.md`, `skills/pm-monitor/SKILL.md`, and `skills/pm-close/SKILL.md` are thin routers that select one primary mode and preserve unknowns as `TBD`.
- `skills/pm-communication-style/SKILL.md` is a shared presentation contract referenced by PM skills and `skills/agent-audio-brief/SKILL.md`.
- `skills/agent-audio-brief/SKILL.md` has source safety, Kokoro generation, publishing, and cleanup rules, plus scripts under `skills/agent-audio-brief/scripts/`.
- `skills/composio/SKILL.md` and `skills/composio/rules/` cover external app access, setup/auth, search/link/execute, and no guessed tool slugs.
- `skills/pailflow-triggers/SKILL.md` and `skills/pailflow-workflow-automation/SKILL.md` contain required-input and explicit-confirmation gates for ongoing access.
- Existing evals use lightweight JSON under `skills/*/evals/` and `evals/cross-lane-handoffs/evals.json`.
- `scripts/validate_skill_frontmatter.rb` and `.github/workflows/validate-skill-frontmatter.yml` validate skill frontmatter.

### Institutional Learnings

- `tasks/03-27-lessons-from-building-skills.md` says skills are folders, not just markdown, and details belong in `references/`, `scripts/`, and `assets/`.
- The same learning doc warns that mixed-purpose skills underperform, so Pipa must stay concise and command-routed rather than becoming an all-purpose instruction dump.
- It also recommends concrete trigger descriptions, high-signal gotchas, progressive disclosure, setup patterns, helper scripts, curation, composition, and lightweight usage/eval checks.
- `AGENTS.md` says not to bump versions during draft/branch work; version updates happen only when finalizing for merge to main.

### External References

- `https://impeccable.style/docs/` provides the command-first docs model: one skill, grouped commands, command chains, and recommended starting paths.
- `https://github.com/pbakaus/impeccable` shows a product README structured around “1 skill, many commands,” references, commands, usage examples, installer docs, and supported tools.
- Impeccable's public `STYLE.md` is useful as copy inspiration: direct claims, concrete language, no generic AI-tool marketing.

---

## Key Technical Decisions

- Create `skills/pipa/SKILL.md` as the only new PM entry skill: This satisfies the one-brain product model while preserving command dispatch internally.
- Keep the Pipa entry skill concise: Deep workflows move into Pipa references to follow progressive disclosure and avoid mixed-purpose trigger confusion.
- Use a command matrix in the Pipa skill: The router should define canonical commands, aliases, routed reference/standalone target, and tie-breakers.
- Start with lifecycle commands plus monitor shortcuts: The v1 public surface should emphasize `initiate`, `plan`, `execute`, `monitor`, and `close`, with `status`, `triage`, `budget`, and `risk` as frequent monitor shortcuts.
- Keep connected workflows in a separate help/menu section: `brief`, `automate`, `trigger`, and `composio` should be visible as connected workflow routes, not mixed into the core lifecycle commands.
- Add `help` as a Pipa command, not a separate skill: Bare Pipa and `/pipa help` should explain the command surface from inside `skills/pipa/SKILL.md`.
- Make help lightly context-aware: Lead with 2-3 likely next commands when there is enough context, then show the stable grouped command list.
- Treat standalone breakout skills as authoritative and read-only when routed from Pipa: Pipa should route into their existing workflows and preserve required inputs, setup checks, confirmation gates, blockers, and output contracts without editing those skills.
- Move representative PM evals before deleting old folders: Deletion should not destroy the existing regression signal.
- Drop or defer `amplify` from first-release commands unless it is mapped to a concrete workflow: It is currently named in the brainstorm but not grounded in an existing PM workflow.
- Keep one primary route as the default: Preserve the existing router discipline by selecting one main command and listing secondary follow-ups unless the user explicitly asks for a chain.
- Keep version bumps out of this implementation pass unless finalizing for merge: This follows `AGENTS.md` and avoids draft-version churn.

---

## Open Questions

### Resolved During Planning

- Should Pipa invoke standalone workflows or only list them separately? Resolution: Pipa must invoke them, while they also remain top-level skills.
- Should old `pm-*` skills stay as shims? Resolution: no. Delete old PM folders after Pipa references, docs, and evals are in place.
- Should v1 include a full docs site? Resolution: no. README and skill docs are enough for v1.

### Deferred to Implementation

- Exact reference filenames after migration: The plan recommends command/job-oriented names, but implementation may preserve old names where that lowers risk.
- Exact eval runner command: The repo has eval JSON but no confirmed universal runner in scope; implementation should keep eval files compatible with current patterns and document manual review expectations if no runner exists.
- Exact frontmatter version bumps: defer until merge-finalization.

---

## Output Structure

```text
skills/
  pipa/
    SKILL.md
    references/
      communication-style.md
      command-menu.md
      standalone-invocation.md
      initiate.md
      initiate-project-context.md
      initiate-budget.md
      initiate-problem-framing.md
      initiate-stakeholder-map.md
      initiate-charter-and-viability-gate.md
      plan.md
      plan-requirements-brief.md
      plan-scope-schedule-baseline.md
      plan-roadmap-and-prioritization.md
      plan-raid-raci-decision-setup.md
      execute.md
      execute-work-package-coordination.md
      execute-iteration-cycle.md
      execute-change-control.md
      execute-dependency-and-handoff.md
      monitor.md
      monitor-ticket-triage.md
      monitor-status.md
      monitor-budget.md
      monitor-risk-escalation.md
      close.md
      close-acceptance-signoff.md
      close-handover-transition.md
      close-lessons-learned.md
      close-benefits-review-and-archive.md
    evals/
      evals.json
      trigger-eval-set.json
```

This tree is directional. The implementing agent may adjust filenames if it preserves command clarity, cross-reference integrity, and eval traceability.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

Pipa should dispatch through a command matrix rather than a chain of exposed routers.

| Command group | Canonical commands | Routes to | Notes |
|---|---|---|---|
| Lifecycle commands | `initiate`, `plan`, `execute`, `monitor`, `close` | Pipa lifecycle references | Primary v1 PM surface. |
| Monitor shortcuts | `status`, `triage`, `budget`, `risk` | Pipa monitor references | Frequent daily commands; `budget` tie-breaks between setup and health by wording. |
| Connected workflows | `audio`, `automate`, `trigger`, `composio` | Read-only standalone skills | Separate menu section; preserve standalone safety and setup rules. `brief` alone is not enough to route to Agent Audio Brief. |
| Help | `help`, `menu`, no argument | Pipa command menu | Lightly context-aware: recommend 2-3 starting commands plus full grouped list. |

Runtime routing rules should follow this order:

1. If the first word is a known Pipa command or alias, load the mapped reference or standalone workflow.
2. If no command is present but the request clearly matches a PM job, route by natural-language intent.
3. If the request implies recurrence, future scheduled delivery, or existing automation management, route to PailFlow automation rather than one-time PM execution.
4. If the request implies event reaction, webhook, watcher, listener, or trigger management, route to PailFlow triggers.
5. If the request requires external app actions through Composio, route to Composio and preserve search/link/execute discipline.
6. If the request explicitly asks for an audio brief, listenable brief, spoken walkthrough, listening page, or phone-friendly audio review for a work artifact, route to Agent Audio Brief and preserve source safety and publishing rules. Do not route generic “brief this,” “write a brief,” “requirements brief,” or “project brief” language to Agent Audio Brief.
7. If multiple commands match, choose one primary route and list secondary follow-ups unless the user explicitly asks for a chain.
8. If unknown, return the help/menu response and ask one clarifying question only when needed.

---

## Implementation Units

### U1. Create the Pipa entry skill and command matrix

**Goal:** Add `skills/pipa/SKILL.md` as the concise entry skill with frontmatter, trigger description, command groups, routing rules, standalone invocation rules, and gotchas.

**Requirements:** R1, R2, R3, R4, R5, R6, R9, R15, R16, R17, R22, R25, R28; F1, F2, F3b, F5; AE1, AE2, AE4, AE5, AE7

**Dependencies:** None

**Files:**
- Create: `skills/pipa/SKILL.md`
- Create: `skills/pipa/references/command-menu.md`
- Create: `skills/pipa/references/standalone-invocation.md`
- Test: `skills/pipa/evals/trigger-eval-set.json`
- Test: `skills/pipa/evals/evals.json`

**Approach:**
- Write frontmatter `description` as concrete “when to use this” trigger language covering PM/delivery jobs, command invocation, and natural-language PM requests.
- Keep the entry skill short: product promise, setup expectations, command table, routing rules, gotchas, and reference-loading instructions.
- Put detailed menu copy and standalone invocation rules into references so `SKILL.md` stays readable.
- Include `help` and no-argument behavior as a built-in Pipa command, not a separate skill.
- Make help lightly context-aware: recommend 2-3 likely next commands when context is available, then show the stable grouped list.
- Define tie-breakers for `budget`, `brief`, `triage`, `status`, `plan`, recurring language, and trigger/event language.
- Treat `amplify` as deferred unless the implementation maps it to a concrete workflow.

**Execution note:** Build trigger and routing evals alongside this unit, before old `pm-*` folders are deleted.

**Patterns to follow:**
- `skills/pm-monitor/SKILL.md` for one-primary-mode routing discipline.
- `skills/pm-initiate/SKILL.md` for route selection plus handoff summary structure.
- `tasks/03-27-lessons-from-building-skills.md` for progressive disclosure and trigger-description guidance.
- Impeccable `skill/SKILL.src.md` pattern for one entry skill with grouped commands.

**Test scenarios:**
- Happy path: `Pipa status for the steering meeting` routes to the status workflow reference and does not mention old `pm-monitor-status` as the user-facing command.
- Happy path: `Pipa triage these customer tickets` routes to ticket triage.
- Happy path: no argument or `Pipa help` returns recommended starting commands plus grouped command menu.
- Edge case: `Pipa budget` asks or tie-breaks between budget setup and budget health based on wording instead of guessing silently when ambiguous.
- Edge case: `Pipa brief this PR` does not route to Agent Audio Brief unless the user explicitly asks for an audio/listenable/spoken brief.
- Edge case: `Pipa audio brief this requirements doc` routes to Agent Audio Brief because the user explicitly asked for audio.
- Error path: unknown command returns a help/menu response with a clarification path rather than hallucinating a workflow.
- Covers AE1. Natural-language `give me a project status update` routes to status.
- Covers AE2. Explicit `Pipa plan` uses the planning workflow reference instead of delegating to a top-level `pm-plan` skill.

**Verification:**
- `skills/pipa/SKILL.md` exists and is concise enough to function as an entry skill.
- The command matrix covers core PM, breakout, and help/menu behavior.
- Initial Pipa eval files include explicit command and natural-language trigger cases.

---

### U2. Move PM workflow content into Pipa references

**Goal:** Preserve the existing PM workflow value by moving PM router and subskill instructions into `skills/pipa/references/`, then rewriting internal references away from top-level `pm-*` skill names.

**Requirements:** R7, R8, R9, R10, R18, R21, R28; F1, F2, F4; AE1, AE2

**Dependencies:** U1

**Files:**
- Create: `skills/pipa/references/communication-style.md`
- Create: `skills/pipa/references/initiate.md`
- Create: `skills/pipa/references/initiate-project-context.md`
- Create: `skills/pipa/references/initiate-budget.md`
- Create: `skills/pipa/references/initiate-problem-framing.md`
- Create: `skills/pipa/references/initiate-stakeholder-map.md`
- Create: `skills/pipa/references/initiate-charter-and-viability-gate.md`
- Create: `skills/pipa/references/plan.md`
- Create: `skills/pipa/references/plan-requirements-brief.md`
- Create: `skills/pipa/references/plan-scope-schedule-baseline.md`
- Create: `skills/pipa/references/plan-roadmap-and-prioritization.md`
- Create: `skills/pipa/references/plan-raid-raci-decision-setup.md`
- Create: `skills/pipa/references/execute.md`
- Create: `skills/pipa/references/execute-work-package-coordination.md`
- Create: `skills/pipa/references/execute-iteration-cycle.md`
- Create: `skills/pipa/references/execute-change-control.md`
- Create: `skills/pipa/references/execute-dependency-and-handoff.md`
- Create: `skills/pipa/references/monitor.md`
- Create: `skills/pipa/references/monitor-ticket-triage.md`
- Create: `skills/pipa/references/monitor-status.md`
- Create: `skills/pipa/references/monitor-budget.md`
- Create: `skills/pipa/references/monitor-risk-escalation.md`
- Create: `skills/pipa/references/close.md`
- Create: `skills/pipa/references/close-acceptance-signoff.md`
- Create: `skills/pipa/references/close-handover-transition.md`
- Create: `skills/pipa/references/close-lessons-learned.md`
- Create: `skills/pipa/references/close-benefits-review-and-archive.md`
- Test: `skills/pipa/evals/evals.json`

**Approach:**
- Copy existing workflow bodies first, then edit only what must change for reference context: names, cross-references, “delegate to skill” language, and shared communication reference paths.
- Preserve operational output contracts: owners, next actions, due/review date, status, evidence/source, and explicit `TBD` unknowns.
- Convert router instructions from “prefer delegating to `pm-*`” into “load the matching Pipa reference” or “run the equivalent workflow inline.”
- Keep old lifecycle concepts as internal reference organization, not public product positioning.
- Add a migration inventory in implementation notes or PR description if needed, but avoid creating permanent docs unless they serve future maintenance.

**Patterns to follow:**
- Existing `skills/pm-*/SKILL.md` files for workflow contracts.
- `evals/cross-lane-handoffs/evals.json` for shared output contract assertions.

**Test scenarios:**
- Happy path: status workflow reference still requires current state, changes, blockers, decisions, owner follow-through, and source gaps.
- Happy path: initiate-to-plan handoff preserves blocked/minimum-input behavior.
- Happy path: close workflow preserves acceptance, handover, lessons, benefits/archive gates.
- Edge case: unknown owner/date/source remains `TBD` after reference migration.
- Integration: Pipa `plan` command can route from router reference to requirements, baseline, roadmap, or RAID/RACI sub-reference without naming deleted top-level skills.
- Covers AE2. Pipa planning uses reference dispatch instead of public router delegation.

**Verification:**
- Every old PM skill has a Pipa reference destination or is explicitly deferred.
- Pipa references contain no live instruction to delegate to a soon-deleted `pm-*` skill.
- Shared communication style exists under Pipa and is used by PM references.

---

### U3. Wire Pipa invocation to read-only standalone breakouts

**Goal:** Keep `agent-audio-brief`, `composio`, `pailflow-triggers`, and `pailflow-workflow-automation` exactly as they are while making Pipa able to route into them without weakening safety gates.

**Requirements:** R11, R12, R13, R14, R15, R16, R17; F3, F3b; AE3, AE4, AE5

**Dependencies:** U1

**Files:**
- Modify: `skills/pipa/SKILL.md`
- Modify: `skills/pipa/references/standalone-invocation.md`
- Read-only: `skills/agent-audio-brief/SKILL.md`
- Read-only: `skills/composio/SKILL.md`
- Read-only: `skills/pailflow-triggers/SKILL.md`
- Read-only: `skills/pailflow-workflow-automation/SKILL.md`
- Test: `skills/pipa/evals/evals.json`
- Test: `skills/pipa/evals/trigger-eval-set.json`

**Approach:**
- In Pipa, state that standalone workflows are authoritative when routed: follow their `SKILL.md`, setup checks, required inputs, confirmation gates, blockers, and output contract.
- Add command aliases or routing entries for likely user language: explicit audio/listenable brief language for Agent Audio Brief, `composio` or external-app action language for Composio, `trigger` for event-driven workflows, and `automate` or recurring language for recurring automations.
- Do not edit `agent-audio-brief`, `composio`, `pailflow-triggers`, or `pailflow-workflow-automation` in this restructure. Agent Audio Brief took significant iteration and should remain exactly as-is.
- Do not copy standalone workflow logic into Pipa. Pipa should point to the existing standalone workflow as authoritative; copying creates drift.
- If implementation discovers a dangling dependency from a read-only breakout to deleted PM content, stop and raise it as a plan issue instead of editing the breakout skill.

**Patterns to follow:**
- `skills/pailflow-workflow-automation/SKILL.md` for schedule/timezone/destination/prompt confirmation.
- `skills/pailflow-triggers/SKILL.md` for event trigger confirmation and stale-event rules.
- `skills/composio/SKILL.md` and `skills/composio/rules/` for search/link/execute and no guessed slugs.
- `skills/agent-audio-brief/SKILL.md` for source safety, audio generation, publishing, and clear blockers.

**Test scenarios:**
- Covers AE4. `Pipa automate a weekly budget debrief every Monday` routes to recurring automation and still requires schedule, timezone, destination, execution prompt, and confirmation.
- Covers AE5. `Pipa make an audio brief from this URL` routes to audio brief and preserves source extraction, script generation, audio generation, and blocker behavior.
- Happy path: `Pipa use Composio to create a GitHub issue` routes to Composio search/link/execute discipline and does not invent a tool slug.
- Happy path: `Pipa trigger this when a Linear issue is created` routes to PailFlow trigger workflow and requires trigger proposal confirmation before create.
- Negative: `give me a weekly status update now` should not create a recurring automation unless the user asks for future recurring delivery.
- Negative: `brief this PR` should not route to Agent Audio Brief unless the user asks for an audio, listenable, spoken, or phone-friendly brief.
- Negative: `summarize this PR` should not route to Agent Audio Brief unless the user asks for an audio, listenable, spoken, or phone-friendly brief.
- Negative: a PailFlow create request without final confirmation must not proceed to create.

**Verification:**
- Breakout skills remain present under `skills/`.
- Git diff shows no modifications inside `skills/agent-audio-brief/`, `skills/composio/`, `skills/pailflow-triggers/`, or `skills/pailflow-workflow-automation/`.
- Pipa routing references the standalone workflows without duplicating all specialized rules.
- Any discovered read-only breakout dependency on deleted PM content is called out for user decision rather than silently changed.

---

### U4. Build lightweight Pipa eval coverage and migrate representative existing evals

**Goal:** Add a first-release eval suite that makes the restructure reviewable: command routing, natural-language routing, PM reference selection, breakout invocation, safety gates, docs/menu clarity, and negative cases.

**Requirements:** R6, R15, R16, R17, R28, R29, R30, R31; F1, F2, F3b, F6; AE1, AE2, AE4, AE5, AE9

**Dependencies:** U1, U2, U3

**Files:**
- Create: `skills/pipa/evals/evals.json`
- Create: `skills/pipa/evals/trigger-eval-set.json`
- Modify: `evals/cross-lane-handoffs/evals.json`
- Read/migrate from: `skills/pm-*/evals/evals.json`
- Read/migrate from: `skills/pm-*/evals/trigger-eval-set.json`

**Approach:**
- Use the existing lightweight eval JSON style instead of inventing a new framework.
- Migrate representative coverage before deleting old PM folders. Prioritize one or two high-signal evals per old router/subworkflow rather than moving every case blindly.
- Add explicit trigger evals for Pipa as a broad PM brain, covering old trigger surfaces now collapsed into one description.
- Add negative evals for over-routing into automations, triggers, audio brief, and Composio.
- Update expected names and assertions away from `pm-*` public skill names and toward Pipa commands/references.
- Do not migrate or edit eval files inside read-only breakout skill directories. Add Pipa-owned evals for Pipa routing to those workflows instead.

**Patterns to follow:**
- `skills/pm-monitor/evals/evals.json` for routing assertion shape.
- `skills/pm-initiate/evals/trigger-eval-set.json`, `skills/pm-plan/evals/trigger-eval-set.json`, and similar trigger evals for positive/negative trigger format.
- `evals/cross-lane-handoffs/evals.json` for shared output contract coverage.

**Test scenarios:**
- Happy path: explicit `Pipa status`, `Pipa triage`, `Pipa budget`, `Pipa plan`, `Pipa execute`, `Pipa close`, and `Pipa initiate` route correctly.
- Happy path: natural-language PM requests trigger Pipa and select the expected workflow reference.
- Happy path: no-argument Pipa help/menu returns grouped commands and recommended next commands.
- Integration: cross-lane handoff evals still validate initiate-to-plan, plan-to-execute, execute-to-monitor, monitor-to-close, and close-to-archive behavior after naming updates.
- Negative: one-time PM work does not become a PailFlow automation.
- Negative: event-trigger language requires trigger workflow and confirmation.
- Negative: Composio flow must not guess slugs.
- Negative: generic `brief this PR` does not route to Agent Audio Brief.
- Negative: Agent Audio Brief routing only happens for explicit audio/listenable/spoken/phone-friendly brief requests, and then must block when source cannot be read well enough.

**Verification:**
- Pipa eval files exist before old `pm-*` eval directories are removed.
- Eval assertions cover both routing correctness and safety-preservation behavior.
- Cross-lane handoff evals remain available after migration.

---

### U5. Rewrite public docs and repository guidance around Pipa

**Goal:** Replace catalog-first PM skill docs with Pipa-first product docs inspired by Impeccable's “1 skill, many commands” shape.

**Requirements:** R1, R2, R3, R5, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28; F5; AE6, AE7, AE8

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/brainstorms/2026-05-30-pipa-skills-restructure-requirements.md` only if implementation discovers a product-scope mismatch
- Test: `skills/pipa/evals/evals.json`

**Approach:**
- Rewrite README opening around Pipa: one PM brain, many commands, project delivery work.
- Replace the current PM skill inventory as the primary surface with command groups, starting paths, common command chains, and breakout skill section.
- Keep installation examples Pipa-first. Show breakout skills separately.
- Remove or rewrite the `pm-<phase>-<noun>` naming guidance so new PM workflows become Pipa commands/references by default.
- Keep the old lifecycle taxonomy available only as internal architecture/context where helpful.
- Update `AGENTS.md` and `CONTRIBUTING.md` to match the new rules: Pipa references for PM workflows, standalone skills only for high-value/tool-specific breakouts, no version bump until merge-finalization.
- Keep public copy direct and concrete. Avoid generic productivity claims.

**Patterns to follow:**
- Impeccable README: product claim, why, included references, command table, usage examples, installation, supported tools.
- Impeccable docs page: command groups, command chains, recommended starting paths.
- `tasks/03-27-lessons-from-building-skills.md` for curation and trigger reliability.

**Test scenarios:**
- Happy path: README first screen communicates Pipa as one PM brain and does not start with a list of 31 skills.
- Happy path: README includes grouped commands and at least three common command chains.
- Happy path: install examples teach installing/invoking Pipa first.
- Happy path: breakout skills are still listed separately and clearly described.
- Edge case: old `pm-*` lifecycle taxonomy is not presented as the public naming convention.
- Covers AE8. Public copy makes a specific claim about Pipa's PM brain/command value rather than generic AI assistant language.

**Verification:**
- README, AGENTS, and CONTRIBUTING agree on the Pipa-first architecture.
- Documentation references existing files/skills after migration.
- Docs acceptance evals or manual assertions cover the key README changes.

---

### U6. Delete old PM skill folders and clean stale references

**Goal:** Remove the old public `pm-*` skill surface after Pipa references, standalone invocation, docs, and evals are in place.

**Requirements:** R5, R7, R8, R10, R17, R20; F4; AE2, AE6

**Dependencies:** U1, U2, U3, U4, U5

**Files:**
- Delete: `skills/pm-initiate/`
- Delete: `skills/pm-initiate-project-context/`
- Delete: `skills/pm-initiate-budget/`
- Delete: `skills/pm-initiate-problem-framing/`
- Delete: `skills/pm-initiate-stakeholder-map/`
- Delete: `skills/pm-initiate-charter-and-viability-gate/`
- Delete: `skills/pm-plan/`
- Delete: `skills/pm-plan-requirements-brief/`
- Delete: `skills/pm-plan-scope-schedule-baseline/`
- Delete: `skills/pm-plan-roadmap-and-prioritization/`
- Delete: `skills/pm-plan-raid-raci-decision-setup/`
- Delete: `skills/pm-execute/`
- Delete: `skills/pm-execute-work-package-coordination/`
- Delete: `skills/pm-execute-iteration-cycle/`
- Delete: `skills/pm-execute-change-control/`
- Delete: `skills/pm-execute-dependency-and-handoff/`
- Delete: `skills/pm-monitor/`
- Delete: `skills/pm-monitor-ticket-triage/`
- Delete: `skills/pm-monitor-status/`
- Delete: `skills/pm-monitor-budget/`
- Delete: `skills/pm-monitor-risk-escalation/`
- Delete: `skills/pm-close/`
- Delete: `skills/pm-close-acceptance-signoff/`
- Delete: `skills/pm-close-handover-transition/`
- Delete: `skills/pm-close-lessons-learned/`
- Delete: `skills/pm-close-benefits-review-and-archive/`
- Delete: `skills/pm-communication-style/`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `evals/cross-lane-handoffs/evals.json`

**Approach:**
- Perform deletion only after migration inventory is complete and evals have representative coverage.
- Run a stale-reference search for `skills/pm-`, `pm-communication-style`, and old install examples.
- Historical plans and brainstorms may mention old names, but live README, skills, and current evals should not depend on deleted paths unless clearly archival.
- Preserve `.gitkeep` if needed to keep empty directories tracked.

**Patterns to follow:**
- `AGENTS.md` requirement to update README when skills are added or removed.

**Test scenarios:**
- Happy path: current public skill list includes `pipa`, `agent-audio-brief`, `composio`, `pailflow-triggers`, and `pailflow-workflow-automation`.
- Error path: stale-reference scan finds no live skill instructions pointing to deleted `pm-*` paths.
- Integration: Pipa evals still cover migrated PM workflows after old folders are removed.
- Integration: standalone skills still validate and still route independently.

**Verification:**
- Old PM folders are removed.
- No live docs or skills instruct users to install old `pm-*` skills.
- Pipa references and evals preserve the PM workflow behavior.

---

### U7. Validate, review, and prepare release handoff

**Goal:** Verify the restructure as a coherent skill-pack release without performing final version bumps until merge-finalization.

**Requirements:** R18, R19, R20, R28, R29, R30, R31; F4, F6; AE6, AE9

**Dependencies:** U1, U2, U3, U4, U5, U6

**Files:**
- Read/verify: `scripts/validate_skill_frontmatter.rb`
- Read/verify: `.github/workflows/validate-skill-frontmatter.yml`
- Modify if needed: `README.md`
- Modify if needed: `skills/pipa/SKILL.md`
- Modify if needed: `skills/pipa/evals/evals.json`
- Modify if needed: `skills/pipa/evals/trigger-eval-set.json`

**Approach:**
- Validate skill frontmatter for all remaining skills.
- Review Pipa trigger description for undertriggering risk now that old `pm-*` descriptions are gone.
- Review eval coverage against the command matrix and safety gates.
- Check README, AGENTS, and CONTRIBUTING for consistency.
- Prepare a release checklist that notes version bumps and `VERSIONS.md` updates are intentionally deferred until final merge prep.

**Patterns to follow:**
- `AGENTS.md` versioning policy.
- Existing frontmatter validation workflow.
- `tasks/03-27-lessons-from-building-skills.md` guidance on measuring undertriggering.

**Test scenarios:**
- Happy path: all remaining skill frontmatter passes validation.
- Happy path: Pipa trigger eval positives cover each command group.
- Negative: Pipa trigger eval negatives prevent non-PM requests from overtriggering.
- Negative: safety evals catch skipped PailFlow confirmation or guessed Composio slug behavior.
- Docs check: README and CONTRIBUTING do not contradict Pipa-first architecture.

**Verification:**
- Validation passes or failures are understood and fixed.
- The PR/release handoff can say what changed, what was intentionally removed, what remains standalone, and what eval coverage protects the restructure.

---

## System-Wide Impact

- **Interaction graph:** Pipa becomes the primary PM entry point. It loads internal PM references and routes to standalone skills for audio brief, Composio, PailFlow triggers, and PailFlow automations.
- **Error propagation:** Breakout blockers must remain owned by their workflows. Pipa should not turn setup/auth/source/confirmation blockers into generic PM responses.
- **State lifecycle risks:** PailFlow recurring automation and trigger workflows create ongoing behavior; confirmation gates and scoped-account behavior must survive Pipa routing.
- **API surface parity:** Public skill list, README install examples, eval files, and skill frontmatter all change together.
- **Integration coverage:** Eval coverage should prove both direct Pipa commands and natural-language routing, plus standalone invocation paths.
- **Unchanged invariants:** Standalone breakouts remain installable/discoverable as separate skills. PM outputs still preserve owners, actions, dates, status, evidence, unknowns, and source gaps.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Pipa becomes too broad and undertriggers or overtriggers | Keep `SKILL.md` concise, use concrete description language, add positive/negative trigger evals. |
| Deleting `pm-*` folders removes useful workflow logic | Move PM content into references before deletion and verify every old skill has a destination. |
| Deleting `pm-*` folders removes eval coverage | Migrate representative evals into Pipa evals before deletion. |
| `pm-communication-style` deletion breaks standalone audio brief or PM references | Move style contract into Pipa references and make standalone skills self-contained or point to a safe shared reference. |
| Pipa weakens PailFlow confirmations or Composio verification | Add explicit standalone invocation rule and negative evals for skipped confirmation or guessed slug behavior. |
| README drifts back into catalog mode | Use Impeccable-inspired structure and docs acceptance checks. |
| Existing eval assertions are stale | Audit migrated PM assertions during migration; do not edit read-only breakout evals as part of this restructure. |
| Versioning churn during draft work | Do not bump versions or `VERSIONS.md` until merge-finalization. |

---

## Alternative Approaches Considered

- Keep old `pm-*` skills as shims: Rejected because the requirements call for a clean first release and curation improves trigger reliability.
- Keep both Pipa and all old PM skills fully maintained: Rejected because it preserves catalog sprawl and doubles maintenance.
- Move every standalone workflow fully inside Pipa: Rejected because audio brief, Composio, and PailFlow workflows are discoverable and safety-sensitive enough to remain standalone.
- Build a full Pipa docs site in v1: Deferred because README and skill docs can establish the product shape with lower carrying cost.

---

## Documentation / Operational Notes

- README should become the main v1 product surface: sharp claim, why Pipa, command groups, command chains, usage examples, installation, breakout skills, contributing.
- CONTRIBUTING should say new PM workflows normally become Pipa commands/references, while new standalone skills require breakout justification.
- AGENTS should update repository expectations around Pipa-first architecture and versioning policy.
- Release notes should call out removal of old `pm-*` public skills and list the new Pipa command surface.
- Do not bump `metadata.version` or `VERSIONS.md` until final merge prep.

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-30-pipa-skills-restructure-requirements.md](../brainstorms/2026-05-30-pipa-skills-restructure-requirements.md)
- Skill-building lessons: [tasks/03-27-lessons-from-building-skills.md](../../tasks/03-27-lessons-from-building-skills.md)
- Current README: [README.md](../../README.md)
- Repo guidance: [AGENTS.md](../../AGENTS.md)
- Current PM router example: [skills/pm-monitor/SKILL.md](../../skills/pm-monitor/SKILL.md)
- Audio brief skill: [skills/agent-audio-brief/SKILL.md](../../skills/agent-audio-brief/SKILL.md)
- Composio skill: [skills/composio/SKILL.md](../../skills/composio/SKILL.md)
- PailFlow triggers skill: [skills/pailflow-triggers/SKILL.md](../../skills/pailflow-triggers/SKILL.md)
- PailFlow automation skill: [skills/pailflow-workflow-automation/SKILL.md](../../skills/pailflow-workflow-automation/SKILL.md)
- Cross-lane evals: [evals/cross-lane-handoffs/evals.json](../../evals/cross-lane-handoffs/evals.json)
- Impeccable docs reference: [https://impeccable.style/docs/](https://impeccable.style/docs/)
- Impeccable repository reference: [https://github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable)
