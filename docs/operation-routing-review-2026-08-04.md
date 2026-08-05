# Operation Routing Review: 2026-08-04

## Review Status

**Overall: PASS for promoted-operation routing. Specialized capabilities remain unchanged; one pre-existing confirmation-contract conflict is documented below.**

This was a **model-assisted documented manual review**, not an automated routing or eval execution. No prompt was run through an eval runner or live router. Each fixture was read and compared semantically against the root precedence rules, owning lane/meta selection rules, operation frontmatter boundary, destination safety contract, and neighboring fixtures.

## Method

For each case, the review applied this order:

1. Exact promoted operation invocation must route directly to that operation.
2. An explicit owner delegation must route to the named operation.
3. Generic business language must remain owned by one of the six business lanes; generic Pipa configuration or utility language must remain owned by its meta surface.
4. The owner lane/meta surface may then select one operation or specialized capability without making the narrow destination an automatic generic trigger.
5. Adjacent wording must follow the documented tie-breakers, including project plan versus Daily Plan, status versus triage versus escalation, budget setup versus review, money-impacting versus non-money change control, delivery handoff versus operational handover, acceptance criteria versus final signoff, workday shutdown versus formal closeout, and new-prospect versus existing-client versus payment follow-up.
6. A direct destination must retain its own source verification, tool discovery/schema, provenance, read-only analysis, write approval, result confirmation, privacy, recipient, timezone, and unsupported-flow boundaries.

The review marked a case failed when the written routing surfaces could not satisfy the fixture and destination contract at the same time. Fixture shape validation was not treated as behavioral evidence.

## Inventory Reviewed

The review covered **101 repository files** and **397 semantic cases**. The 13 root specialized-capability cases below are a subset of the 54 root behavior cases and are not double-counted in the 397 total.

### Required Routing Surfaces

- Root router, 1 file: `skills/pipa/SKILL.md`.
- Six business lanes, 6 files: `skills/pipa-get-work/SKILL.md`, `skills/pipa-define-work/SKILL.md`, `skills/pipa-deliver-work/SKILL.md`, `skills/pipa-get-paid/SKILL.md`, `skills/pipa-keep-clients/SKILL.md`, and `skills/pipa-improve-operations/SKILL.md`.
- Meta surfaces, 2 files: `skills/pipa-manage/SKILL.md` and `skills/pipa-tools/SKILL.md`.
- Root trigger cases, 1 file and 33 cases: `skills/pipa/evals/trigger-eval-set.json` with 26 positives and 7 negatives.
- Root behavior/routing cases, 1 file and 54 cases: `skills/pipa/evals/evals.json`.
- Cross-lane handoffs, 1 file and 14 cases: `evals/cross-lane-handoffs/evals.json`.

### Promoted Operations

All **24 operation `SKILL.md` frontmatters**, all **24 operation `evals/trigger-eval-set.json` files**, and all **24 operation `evals/evals.json` files** were reviewed. Their trigger sets contain **163 cases: 63 intended positives and 100 negatives**. The negatives comprise **24 explicit `generic-lane-owned` cases** and **76 adjacent or out-of-scope cases**. Their behavior suites contain **86 cases**.

- Manage Pipa: `pipa-setup`, `pipa-connectors`.
- Define Work: `pipa-project-charter`, `pipa-problem-framing`, `pipa-stakeholder-map`, `pipa-daily-plan`, `pipa-decision-log`, `pipa-requirements-brief`, `pipa-roadmap`, `pipa-scope-baseline`.
- Deliver Work: `pipa-work-coordination`, `pipa-iteration-cycle`, `pipa-dependency-handoff`, `pipa-risk-escalation`, `pipa-status-update`, `pipa-ticket-triage`.
- Get Paid: `pipa-change-control`, `pipa-budget-setup`, `pipa-budget-review`.
- Improve Operations: `pipa-acceptance-signoff`, `pipa-closeout-review`, `pipa-daily-shutdown`, `pipa-handover`, `pipa-retrospective`.

For each named operation, the exact files reviewed were `skills/<operation>/SKILL.md`, `skills/<operation>/evals/trigger-eval-set.json`, and `skills/<operation>/evals/evals.json`.

### Specialized Capabilities

Six destination contracts were reviewed:

- `skills/pipa-audio-brief/SKILL.md`
- `skills/pipa-huddle-beta/SKILL.md`
- `skills/pipa-follow-up-reminders/SKILL.md`
- `skills/pipa-time-tracking/SKILL.md`
- `skills/pipa-triggers/SKILL.md`
- `skills/composio/SKILL.md` (`composio-mcp`)

Specialized-capability fixtures comprised **60 cases**:

- 13 root route/safety cases in `skills/pipa/evals/evals.json`: `pipa-composio-utility-1`, audio positive/negative, huddle positive/negative, follow-up negative/reminder positive, trigger positive/negative, Composio positive/negative, and time-tracking positive/negative.
- 10 audio trigger cases in `skills/pipa-audio-brief/evals/trigger-eval-set.json`.
- 12 audio safety/behavior cases in `skills/pipa-audio-brief/evals/evals.json`.
- 13 huddle trigger cases in `skills/pipa-huddle-beta/evals/trigger-eval-set.json`.
- 12 huddle safety/behavior cases in `skills/pipa-huddle-beta/evals/evals.json`.

### Supporting Architecture Context

Seven additional files were read to establish the canonical inventory and review standard: `AGENTS.md`, `README.md`, `DESIGN.md`, `PRODUCT.md`, `docs/plans/2026-08-04-001-refactor-operation-skill-promotion-plan.md`, `docs/plans/2026-07-17-pipa-operating-lane-reference-rearchitecture.md`, and `scripts/validate_skill_architecture.rb`.

## Results

| Review area | Result | Manual finding |
|---|---:|---|
| Promoted operation positives | PASS | 63/63 explicitly invoke the operation or delegate from the documented owner and route to the intended narrow surface. |
| Generic operation negatives | PASS | 24/24 remain lane/meta-owned and do not make operation descriptions broad automatic triggers. |
| Adjacent operation negatives | PASS | 76/76 stay outside the reviewed operation and have a coherent neighboring lane, operation, meta, or unsupported destination. |
| Root trigger classification | PASS | 33/33 match the root trigger boundary: 26 Pipa/service-operation positives and 7 unrelated negatives. |
| Root semantic routing | PASS | All 54 cases have a coherent primary surface under the root rules, including lifecycle aliases, no-command context, exact-operation precedence, lane-native ownership, and missing-operation stop behavior. |
| Cross-lane and collision handling | PASS | 14/14 preserve one primary route, handoff gates, `TBD` gaps, and follow-ups without silently executing multiple lanes. |
| Direct promoted-operation safety/tool contracts | PASS | The 86 operation behavior cases consistently preserve source-state distinctions, Composio discovery and complete-schema checks where live tools are needed, provenance, conservative evidence handling, read-only-first analysis, separately scoped write approvals, and confirmed write results. |
| Specialized-capability surface selection | PASS | Audio, huddle, reminders, triggers, Composio, and time tracking route to the intended standalone capability; generic lane work remains lane-owned. |
| Specialized-capability contract preservation | Unchanged | The review found a pre-existing root/meta confirmation rule that conflicts with four destination workflows. This PR intentionally leaves those standalone capabilities and their routing contract unchanged. |

## Pre-existing Finding Left Unchanged

### F1. `pipa-tools` confirmation gates conflict with destination contracts

The review found that `skills/pipa-tools/SKILL.md` required a confirmation gate before publishing, reminders, huddles, or time-record changes, while four destination skills treat the explicit user request as authorization after their own validation and blocker checks:

- `pipa-audio-brief` publishes the completed listening page as its normal output without a second publish confirmation.
- `pipa-huddle-beta` starts the bridge after confirming intent and stating context/privacy limits, without a second start approval.
- `pipa-follow-up-reminders` explicitly says that after payload validation it must not ask for extra confirmation and should create the reminder.
- `pipa-time-tracking` creates or mutates the requested record directly when required inputs are resolved, except for its documented ambiguity and existing-running-timer checks.

Affected prompts and expected routes:

| Prompt | Expected route | Contract failure |
|---|---|---|
| `Pipa audio brief this requirements doc so I can listen to it on my phone.` | `pipa` -> `pipa-tools` -> `pipa-audio-brief` | Preserve the audio skill's normal safe build-and-publish workflow; the meta rule inserts an undocumented second publish confirmation. |
| `Pipa voice session so I can talk this plan through while walking.` | `pipa` -> `pipa-tools` -> `pipa-huddle-beta` | Preserve the huddle intent/privacy/transport checks and start contract; the meta rule inserts an undocumented second huddle confirmation. |
| `Pipa remind me by email next Friday at 9 to chase this invoice.` | `pipa` -> `pipa-tools` -> `pipa-follow-up-reminders` | Preserve verified-self-recipient, timezone, future-time, payload, and idempotency checks, then create without extra confirmation; the root eval currently asserts confirmation before create. |
| `Pipa track time for this client call.` | `pipa` -> `pipa-tools` -> `pipa-time-tracking` | Preserve required credentials and timer-state checks, then start the requested timer; the meta rule inserts an undocumented confirmation before mutation. |

No affected prompt selects the wrong destination surface. The conflict predates this operation-promotion work and is recorded without changing `pipa-tools`, `pipa-audio-brief`, `pipa-huddle-beta`, or their root confirmation behavior.

## Collision Notes

- Broad project planning stays with Define Work and selects `pipa-requirements-brief`; only workday priority/capacity intent selects `pipa-daily-plan`.
- Defining acceptance criteria selects `pipa-requirements-brief`; assessing delivered work for final acceptance selects `pipa-acceptance-signoff`.
- Project status, incoming-item triage, and breach/authority escalation separate cleanly into `pipa-status-update`, `pipa-ticket-triage`, and `pipa-risk-escalation`.
- Active dependency/artifact handoff selects `pipa-dependency-handoff`; post-delivery ownership/support transition selects `pipa-handover`.
- New budget/tracker setup selects `pipa-budget-setup`; burn/variance/forecast/margin selects `pipa-budget-review`; only explicit fee/cost/budget/margin impact selects `pipa-change-control`.
- Workday wrap-up selects `pipa-daily-shutdown`; formal acceptance, handover, benefits, archive, or project closeout overrides incidental `today` wording.
- New-prospect acquisition remains Get Work; existing-client trust/referral remains Keep Clients; invoice/payment action remains Get Paid.
- One-time status and follow-up remain lane-owned; recurring/event-driven work routes to management/triggers, and a future self-email reminder routes to the reminder capability.
- Exact promoted operation names win over adjacent language, and missing operations stop without inline fallback behavior.

## Residual Limitations

- This is a documented manual semantic review. It does not demonstrate how a particular runtime model will respond to the prompts, and it must not be cited as automated eval execution.
- No live Composio, gateway, reminder, trigger, time-record, publishing, or voice-session call was made. Tool and safety findings compare written contracts and fixtures only.
- Only audio brief and huddle have capability-local trigger and behavior JSON suites. Follow-up reminders, time tracking, triggers, and Composio rely on their `SKILL.md` contracts plus root cases, so local regression evidence is thinner for those four capabilities.
- Promoted operation bodies were not re-audited line by line in this routing review; their frontmatter, complete trigger suites, complete behavior suites, owner-lane rules, and root/cross-lane interactions were reviewed. The pass on direct-operation safety means the documented behavior contracts are preserved, not that every implementation instruction was independently verified.
- Several fixtures intentionally permit a follow-up route or one of two formal-closeout operations. Those cases pass because the primary owner and safety boundary are deterministic even when the final operation depends on evidence supplied at runtime.
