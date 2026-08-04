---
title: "Refactor Pipa references into operation skills"
type: refactor
status: completed
date: 2026-08-04
origin: https://linear.app/lunchpaillabs/document/pipa-skill-architecture-lanes-as-entry-surfaces-operation-skills-as-20e627fea5c0
---

# Refactor Pipa References Into Operation Skills

## Summary

Keep the six business lanes as broad automatic entry surfaces. Promote the 24 substantial workflows approved in STU-498 into narrowly described operation skills, migrate one lane at a time, and delete old workflow references after their routes and evals move.

## Decisions

- A **lane** is one of six broad business entry surfaces. A **meta surface** routes Pipa configuration or utilities. An **operation skill** owns one substantial workflow. A **specialized capability** is a tool/product-specific standalone skill. A **reference** is a non-routing implementation asset.
- Generic natural language enters a lane. Explicit operation invocation wins; otherwise the lane selects one operation and preserves the business objective.
- Operation descriptions permit only explicit invocation or delegation from the owning lane/meta surface. Generic job language remains lane-owned. Each operation owns its workflow, output contract, safety rules, positive/negative trigger cases, and behavior evals.
- Promoted workflow references are deleted, not kept as compatibility shims. Missing operations fail clearly instead of running an inline copy.
- References remain only for templates, schemas, examples, and source-handling rules. Shared presentation preferences live at optional runtime path `~/.pipa/communication-style.md`; `pipa-setup` owns its packaged default and approved writes.
- Daily Plan and Daily Shutdown keep their same-conversation contract: only the latest explicitly accepted Daily Plan with matching date and canonical IANA timezone is a valid shutdown baseline.
- Get Work and Keep Clients remain lane-native in this pass because neither currently contains a substantial child workflow with a distinct trigger boundary.
- Existing specialized capabilities remain unchanged: `pipa-audio-brief`, `pipa-huddle-beta`, `pipa-follow-up-reminders`, `pipa-time-tracking`, `pipa-triggers`, and `composio-mcp`.
- Version bumps remain deferred until merge finalization.

## Migration Matrix

| Entry surface | New operation skill | Source to migrate |
|---|---|---|
| Manage Pipa | `pipa-setup` | `skills/pipa-manage/references/setup.md` |
| Manage Pipa | `pipa-connectors` | `skills/pipa-manage/references/connectors.md` |
| Define Work | `pipa-project-charter` | `skills/pipa-define-work/references/initiate-charter-and-viability-gate.md` |
| Define Work | `pipa-problem-framing` | `skills/pipa-define-work/references/initiate-problem-framing.md` |
| Define Work | `pipa-stakeholder-map` | `skills/pipa-define-work/references/initiate-stakeholder-map.md` |
| Define Work | `pipa-daily-plan` | `skills/pipa-define-work/references/plan-daily-planning.md` |
| Define Work | `pipa-decision-log` | `skills/pipa-define-work/references/plan-raid-raci-decision-setup.md` |
| Define Work | `pipa-requirements-brief` | `skills/pipa-define-work/references/plan-requirements-brief.md` |
| Define Work | `pipa-roadmap` | `skills/pipa-define-work/references/plan-roadmap-and-prioritization.md` |
| Define Work | `pipa-scope-baseline` | `skills/pipa-define-work/references/plan-scope-schedule-baseline.md` |
| Deliver Work | `pipa-work-coordination` | `skills/pipa-deliver-work/references/execute-work-package-coordination.md` |
| Deliver Work | `pipa-iteration-cycle` | `skills/pipa-deliver-work/references/execute-iteration-cycle.md` |
| Deliver Work | `pipa-dependency-handoff` | `skills/pipa-deliver-work/references/execute-dependency-and-handoff.md` |
| Deliver Work | `pipa-risk-escalation` | `skills/pipa-deliver-work/references/monitor-risk-escalation.md` |
| Deliver Work | `pipa-status-update` | `skills/pipa-deliver-work/references/monitor-status.md` |
| Deliver Work | `pipa-ticket-triage` | `skills/pipa-deliver-work/references/monitor-ticket-triage.md` |
| Get Paid | `pipa-change-control` | `skills/pipa-get-paid/references/execute-change-control.md` |
| Get Paid | `pipa-budget-setup` | `skills/pipa-get-paid/references/initiate-budget.md` |
| Get Paid | `pipa-budget-review` | `skills/pipa-get-paid/references/monitor-budget.md` |
| Improve Operations | `pipa-acceptance-signoff` | `skills/pipa-improve-operations/references/close-acceptance-signoff.md` |
| Improve Operations | `pipa-closeout-review` | `skills/pipa-improve-operations/references/close-benefits-review-and-archive.md` |
| Improve Operations | `pipa-daily-shutdown` | `skills/pipa-improve-operations/references/close-daily-shutdown.md` |
| Improve Operations | `pipa-handover` | `skills/pipa-improve-operations/references/close-handover-transition.md` |
| Improve Operations | `pipa-retrospective` | `skills/pipa-improve-operations/references/close-lessons-learned.md` |
| Get Work | none | Fold `skills/pipa-get-work/references/get-work.md` into the lane; retain examples |
| Keep Clients | none | Fold `skills/pipa-keep-clients/references/keep-clients.md` into the lane; retain examples |

Delete these secondary routers after their selection rules move into their lanes:

- Define Work: `references/initiate.md`, `references/plan.md`, `references/define-work.md`
- Deliver Work: `references/execute.md`, `references/monitor.md`, `references/deliver-work.md`
- Get Paid: `references/getting-paid.md`
- Improve Operations: `references/close.md`, `references/improve-operations.md`

## Implementation Slices

### U1. Guardrails and Manage Pipa Pilot

- **Change:** Update `AGENTS.md` and `CONTRIBUTING.md`; add `pipa-setup` and `pipa-connectors`; thin `pipa-manage`; add a small tested architecture validator for matching skill names, broken local links, stale promoted paths, and inline fallback copies.
- **Tests:** `scripts/validate_skill_architecture_test.rb`, both operation eval directories, `skills/pipa-manage/evals/`, and root router cases in `skills/pipa/evals/`.
- **Gate:** Before U2, run and record a full-pack review for direct invocation, adjacent negatives, lane handoff, specialized-capability preservation, and router size. Fixture shape validation alone is not behavioral acceptance.

### U2. Define Work

- **Change:** Create the eight Define Work operations, move cross-reference recommendations to operation names, thin `pipa-define-work`, then delete its promoted workflows and secondary routers.
- **Tests:** Operation-local trigger/behavior evals plus root cases for generic lane routing, explicit invocation, operation overlap, recurring Daily Plan routing, read-only writes, and accepted-baseline creation.
- **Gate:** “Plan this project” must not select Daily Plan without workday priority/capacity intent.

### U3. Deliver Work and Get Paid

- **Change:** Create six Deliver Work and three Get Paid operations; thin both lanes; migrate cross-lane handoffs; delete old workflows and secondary routers.
- **Tests:** Operation-local evals, root trigger cases, and `evals/cross-lane-handoffs/evals.json` for status/triage/risk separation and budget/change-control ownership.
- **Gate:** New budget baseline routes to Budget Setup; burn/variance/margin routes to Budget Review; only money-impacting scope changes route to Change Control.

### U4. Improve Operations

- **Change:** Create five operations, thin `pipa-improve-operations`, replace reference chains with operation names, and delete old workflows and routers.
- **Tests:** Operation-local evals plus root cases for formal closeout versus Daily Shutdown, accepted/missing/mismatched baselines, read-only writes, and ritual completion versus project completion.
- **Gate:** Daily Shutdown can degrade without a baseline but cannot claim accurate plan-versus-actual comparison.

### U5. Get Work and Keep Clients Inventory

- **Change:** Fold each broad lane reference into its `SKILL.md`; retain examples; add no child skills.
- **Tests:** Root and lane cases for new opportunity versus existing-client referral, prospect versus relationship follow-up, payment follow-up, and opportunity-tied versus generic content work.
- **Gate:** New opportunity acquisition belongs to Get Work; existing-client trust/referral asks belong to Keep Clients; invoice/payment actions belong to Get Paid.

### U6. Public Cutover

- **Change:** Update `README.md`, `skills/pipa/references/help-menu.md`, root routing, cross-lane evals, and the canonical inventory. Remove every stale reference path. Finalize changed versions only when preparing merge.
- **Tests:** Repository validators plus a recorded full-inventory model-backed or documented manual routing review covering all operation positives, adjacent negatives, lane handoffs, and specialized-capability safety gates.
- **Gate:** README, help, router, lanes, operations, and evals name the same inventory with no unresolved routing collisions.

Each slice must add its operation skills, local evals, lane/root handoffs, and old-path deletions together. U1 through U6 are the recommended follow-on Linear ticket boundaries.

## Deferred Follow-Ups

- `pailkit` runtime rollout: update revision pins, rebuild images, refresh existing machines, and verify E2B/Fly inventory parity after this repository migration merges.
- A reusable model-backed eval runner. This migration records a manual or available model-backed full-inventory run before publication rather than pretending the current JSON validator executes behavior.
- Any global rewrite of references inside specialized capability skills.

## Verification

- All 24 operation directories have matching `name` frontmatter, narrow descriptions, output contracts, and public trigger/behavior evals.
- Six business lanes remain the only broad business entry surfaces and choose one operation at a time.
- Direct operation invocation works without broad automatic-trigger competition.
- No promoted workflow body survives in a lane, old reference, or inline fallback.
- All local Markdown links resolve; deleted reference names are absent from Markdown and JSON.
- Daily Plan and Daily Shutdown preserve date, timezone, acceptance, source-state, provenance, and write-confirmation behavior.
- Specialized capability directories and their safety contracts remain unchanged.
- Get Work and Keep Clients have explicit lane-native ownership with no speculative children.
- Repository tests pass; behavioral routing evidence is recorded before publication.

## Sources

- [STU-498](https://linear.app/lunchpaillabs/issue/STU-498/rework-pipa-skill-architecture-lanes-as-entry-surfaces-breakouts-as)
- [Pipa Skill Architecture](https://linear.app/lunchpaillabs/document/pipa-skill-architecture-lanes-as-entry-surfaces-operation-skills-as-20e627fea5c0)
- `AGENTS.md`
- `CONTRIBUTING.md`
- `skills/pipa/SKILL.md`
- `docs/plans/2026-07-17-pipa-operating-lane-reference-rearchitecture.md` (superseded for workflow ownership; retained for lane and safety context)
