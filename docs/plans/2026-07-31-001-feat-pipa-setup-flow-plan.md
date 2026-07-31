---
title: "feat: Add Pipa first-time setup flow"
type: feat
status: completed
date: 2026-07-31
origin: https://linear.app/lunchpaillabs/issue/STU-421/build-pipa-setup-skills
---

# feat: Add Pipa first-time setup flow

## Summary

Extend `pipa-manage` with a conversational first-time setup flow. Save business context globally at `~/.pipa/profile.md`, inspect and offer relevant tool connections through the existing connector workflow, and keep project-context intake separate and optional.

## Decisions

- This work covers Pipa setup only. Daily Brief remains separate under STU-477.
- Setup lives inside `pipa-manage`; there is no standalone onboarding skill.
- The linked [Pipa onboarding setup skill draft](https://linear.app/lunchpaillabs/document/pipa-onboarding-setup-skill-draft-0a058c322a6f) is the product-flow source.
- `~/.pipa/profile.md` is the global source of truth for setup completion and durable business context.
- Profile facts do not need a separate "approved durable facts" or Supermemory write flow.
- `.agents/project-context.md` remains project-specific and must not be required during first-time Pipa setup.
- Tool readiness is the primary practical outcome because Pipa's workflows depend on connected systems.
- Profile questions should quickly establish which tools matter, then move into connector discovery, status checks, and relevant connection offers.
- A declined, unavailable, or failed connection must not erase the captured profile or trap the user in setup.
- Defer Anthropic-style capability placeholders and the user's global connector map to a linked follow-up issue; this implementation only uses the existing connector discovery and authorization workflow during setup.
- Remove the legacy project-context intake that repeatedly prompts users to create `.agents/project-context.md` and project packs.
- Keep the rest of the initiate family for now, including problem framing, stakeholder mapping, charter readiness, and budget setup.
- Load `~/.pipa/profile.md` once from each top-level business lane instead of checking `.agents/project-context.md` throughout individual workflow references.
- Missing profiles may produce a soft, non-blocking setup CTA during relevant Pipa use.
- The initial CTA checks only whether `~/.pipa/profile.md` exists.
- After the user accepts setup, run a read-only preflight for existing profile context, available Supermemory context, and connected-tool status before asking questions.
- Use preflight results to avoid redundant questions, but do not write memory, start OAuth, or mutate connected tools during preflight.
- V1 may optionally read a user-provided company website to draft the business, offer, audience, and positioning portions of the profile.
- Website enrichment is read-only and best-effort. Skip it when no URL or web-reading capability is available; do not add an enrichment service or reverse-lookup people by email.
- V1 asks exactly three core biographical questions: `What do you do?`, `Who do you help or work with?`, and `How do you like to work?`
- Ask a follow-up only when an answer is unclear. Do not add team structure, approval, process, or current-focus intake to first-time setup.
- Users may skip any or all biographical questions. Missing answers do not block connector review or setup completion.
- Save each answered or skipped question incrementally to `~/.pipa/profile.md` with `setup_status: incomplete`; mark it `complete` after connector review.
- Do not bump skill versions or `VERSIONS.md` until merge finalization.

## Requirements

- Ask the three core setup questions conversationally, one at a time.
- Capture what the user does, who they help or work with, and how they like to work.
- Capture stated facts without inventing missing context.
- Recommend only tool connections relevant to the requested help.
- Prioritize relevant tool discovery and connection readiness after the minimum business context is known.
- Offer website-assisted profile drafting only when the user provides a company URL.
- Discover connection support and status before making availability claims.
- Ask before starting OAuth or other external authorization.
- Verify completed connections with the smallest safe read-only check.
- Never request raw credentials or test a connection using a write action.
- Save the completed profile globally at `~/.pipa/profile.md`.
- Include an explicit setup marker in the profile so future runs can detect completion deterministically.
- Finish with a concise summary of the profile, connection state, and one optional next step.
- Do not create tasks, reminders, automations, triggers, or recurring workflows during setup.
- If the user arrives with concrete work, do not force setup ahead of that work.
- Do not run connected-tool or memory preflight checks until the user accepts setup.
- Do not prompt users to create workspace or project context as a prerequisite for ordinary Pipa work.

## Scope Boundaries

### In scope

- First-time setup behavior in `pipa-manage`.
- Global profile format and completion detection.
- Relevant connector recommendations and safe connection checks.
- Optional public website context from a user-provided company URL.
- Routing and eval coverage for first-time, completed, skipped, and interrupted setup states.
- Removal of the legacy project-context mode, its routes, and repeated `.agents/project-context.md` checks in live workflow references.
- Optional global-profile loading from each top-level Pipa business lane.

### Deferred to Follow-Up Work

- Daily Brief behavior from STU-477.
- Homepage copy and CTA changes in `flow-homepage`.
- Automatic profile enrichment from later conversations.
- [STU-480](https://linear.app/lunchpaillabs/issue/STU-480/adopt-connector-placeholders-across-pipa-skills): Anthropic-style `~~connector` placeholders, global `~/.pipa/CONNECTORS.md`, and business-lane connector migrations.

## Key Technical Decisions

- Keep `skills/pipa-manage/SKILL.md` concise and place the detailed setup workflow in `skills/pipa-manage/references/setup.md`.
- Use one human-readable global profile file for both context and completion state. Do not add a second marker file or infer completion from memory contents.
- Record a small setup metadata block in the profile, including setup status/version and last update time, followed by the business context learned during setup.
- Check the global profile before offering first-time setup. Never treat missing project context as incomplete Pipa setup.
- Continue using `skills/pipa-manage/references/connectors.md` and the Composio discovery flow for connection setup rather than duplicating connector mechanics.
- Delete only `skills/pipa-define-work/references/initiate-project-context.md`; preserve the other initiate references.
- Remove `.agents/project-context.md` checks from focused workflow references. Project facts should come from the current request, connected tools, and available project artifacts.
- Let each top-level business lane read `~/.pipa/profile.md` when present so direct lane invocation still receives global context without duplicating intake logic.

## Setup Workflow

Before executing, copy this checklist and keep it updated in working notes:

```text
Pipa Setup Progress
- [ ] Step 1 complete: global profile state checked
- [ ] Step 2 complete: setup accepted and read-only preflight completed
- [ ] Step 3 complete: three biographical questions answered or skipped
- [ ] Step 4 complete: optional website context gathered when requested
- [ ] Step 5 complete: relevant tool connections reviewed and offered
- [ ] Step 6 complete: profile marked complete and setup summary returned
```

1. Check `~/.pipa/profile.md`. Resume incomplete setup, route completed profiles to review/update, or show a soft CTA when missing.
2. After the user accepts setup, read existing profile context, available Supermemory context, and connected-tool status. Do not write or authorize during preflight.
3. Ask `What do you do?`, `Who do you help or work with?`, and `How do you like to work?` one at a time. Allow skips and save progress after each answer.
4. If the user provides a company URL and wants help drafting context, read the public website and add only supported facts.
5. Recommend and offer only relevant tool connections using `references/connectors.md` and Composio discovery. Keep OAuth explicit and verify successful connections read-only.
6. Mark `setup_status: complete` after connector review, then return the captured profile, connection state, and one optional next step.

## Open Questions

- How often should the soft setup CTA repeat while the profile remains absent?
- What exact completion summary and homepage handoff language should the flow use?

## Implementation Units

### U1. Add the first-time setup workflow

**Goal:** Extend `pipa-manage` with profile detection, conversational intake, optional connector setup, and deterministic completion.

**Dependencies:** Remaining behavior questions resolved through the implementation grill.

**Files:**
- Modify: `skills/pipa-manage/SKILL.md`
- Create: `skills/pipa-manage/references/setup.md`
- Reuse: `skills/pipa-manage/references/connectors.md`
- Test: `skills/pipa-manage/evals/evals.json`

**Approach:**
- Route setup intent from `pipa-manage` into the focused setup reference.
- Check `~/.pipa/profile.md` before choosing first-time setup versus profile review/update.
- Ask only unanswered setup questions and update the profile after each answer or skip.
- Resume an incomplete profile at the first unanswered question instead of restarting setup.
- Keep OAuth and connector checks behind their own explicit confirmation and outside profile completion requirements.

**Test scenarios:**
- First-time user completes setup and receives a global profile with a completion marker.
- Existing profile routes to review/update instead of restarting setup.
- Missing `.agents/project-context.md` does not trigger project-context intake.
- User arrives with concrete work and setup does not block that request.
- User declines connectors and still completes setup.
- Disconnected recommended tool requires authorization confirmation before an auth flow begins.
- Connected tool is verified with a read-only check; no write action is used.
- Interrupted setup preserves confirmed answers and resumes only missing questions.

**Verification:** The skill contract clearly distinguishes first-time setup, existing-profile management, connector setup, and project context.

### U4. Remove legacy project-context intake

**Goal:** Stop ordinary Pipa work from routing into the legacy workspace/project context questionnaire while preserving the useful initiate workflows.

**Dependencies:** U1.

**Files:**
- Delete: `skills/pipa-define-work/references/initiate-project-context.md`
- Modify: `skills/pipa-define-work/references/define-work.md`
- Modify: `skills/pipa-define-work/references/initiate.md`
- Modify: `skills/pipa-get-work/SKILL.md`
- Modify: `skills/pipa-define-work/SKILL.md`
- Modify: `skills/pipa-deliver-work/SKILL.md`
- Modify: `skills/pipa-get-paid/SKILL.md`
- Modify: `skills/pipa-keep-clients/SKILL.md`
- Modify: `skills/pipa-improve-operations/SKILL.md`
- Modify live references under `skills/pipa-define-work/references/`, `skills/pipa-deliver-work/references/`, `skills/pipa-get-paid/references/`, and `skills/pipa-improve-operations/references/` that check `.agents/project-context.md`
- Test: `skills/pipa/evals/evals.json`
- Test: `skills/pipa-manage/evals/evals.json`

**Approach:**
- Remove the project-context route from the Define Work reference index and initiate router.
- Preserve initiate routes for problem framing, stakeholder mapping, charter readiness, and budget setup.
- Delete repeated `.agents/project-context.md` checks rather than replacing them in every focused reference.
- Add one optional `~/.pipa/profile.md` read to each top-level business-lane skill.
- Continue gathering project-specific facts from the request and source artifacts; the global profile does not replace project evidence.

**Test scenarios:**
- Missing `.agents/project-context.md` never causes a setup question or context-creation offer.
- `Plan this work` routes to planning without entering project-context intake.
- Existing `~/.pipa/profile.md` is available to a directly invoked business-lane skill.
- Missing `~/.pipa/profile.md` does not block ordinary lane work and produces at most the agreed soft setup CTA.
- Problem framing, stakeholder mapping, charter readiness, and budget setup still route to their existing initiate references.
- No live skill or reference instructs users to create `.agents/project-context.md` or `.agents/flow-projects/`.

**Verification:** Live skill instructions contain no project-context creation route or repeated `.agents/project-context.md` checks, while non-context initiate workflows remain reachable.

### U2. Add routing and regression coverage

**Goal:** Protect setup triggering, profile detection, and the boundary against unwanted project-context prompting.

**Dependencies:** U1 and U4.

**Files:**
- Modify: `skills/pipa/SKILL.md`
- Modify: `skills/pipa/evals/evals.json`
- Modify: `skills/pipa/evals/trigger-eval-set.json`
- Create: `skills/pipa-manage/evals/evals.json`
- Create: `skills/pipa-manage/evals/trigger-eval-set.json`

**Approach:**
- Keep setup/onboarding language routed to `pipa-manage`.
- Add positive cases for first-time setup and profile updates.
- Add negative cases proving ordinary work and absent project context do not restart setup.

**Test scenarios:**
- "Set up Pipa" routes to `pipa-manage` setup.
- "Update my business profile" routes to profile review/update.
- "Help me with this Linear ticket" routes to the relevant work flow without demanding setup.
- An existing completed profile suppresses first-time questions.
- Missing project context is not treated as missing global profile context.

**Verification:** Public eval fixtures validate and cover both correct triggering and non-interruption behavior.

### U3. Validate the finished skill change

**Goal:** Confirm the skill pack remains valid without publishing draft version changes.

**Dependencies:** U1, U2, and U4.

**Files:**
- Verify: `skills/pipa-manage/SKILL.md`
- Verify: `skills/pipa-manage/references/setup.md`
- Verify: `skills/pipa-manage/evals/evals.json`
- Verify: `skills/pipa-manage/evals/trigger-eval-set.json`
- Verify: `README.md`

**Approach:**
- Run the repository's skill-eval validation and relevant tests.
- Search live skill instructions for stale claims that Supermemory or project context is required for setup.
- Update README only if the existing `pipa-manage` description no longer accurately describes the completed behavior.

**Test scenarios:**
- All eval JSON matches repository schema.
- No live setup instruction requires Supermemory writes.
- No live setup instruction requires `.agents/project-context.md`.
- Existing Pipa routing and skill-eval validation remain green.

**Verification:** Relevant tests pass and the final diff contains no draft version bump.

## Risks

- Agents may repeatedly prompt when no profile exists. Resolve the proactive-offer rule explicitly and cover it with a negative eval.
- A global profile can sprawl. Keep it limited to durable person and business context.
- Profile and project context can be conflated. Name their separate purposes directly in the setup workflow.
- Removing legacy context checks could accidentally remove useful initiate workflows. Delete only the project-context route and cover the preserved initiate modes in evals.
- Connector setup can derail onboarding. Make it central, but preserve a clear outcome when authorization is declined, unavailable, or fails.

## Sources

- [STU-421: Build Pipa setup skills](https://linear.app/lunchpaillabs/issue/STU-421/build-pipa-setup-skills)
- [Pipa onboarding setup skill draft](https://linear.app/lunchpaillabs/document/pipa-onboarding-setup-skill-draft-0a058c322a6f)
- [Anthropic knowledge-work plugin connector pattern](https://github.com/anthropics/knowledge-work-plugins/blob/main/customer-support/CONNECTORS.md)
- `skills/pipa-manage/SKILL.md`
- `skills/pipa-manage/references/connectors.md`
- `skills/pipa/SKILL.md`
- `skills/pipa-define-work/references/initiate-project-context.md`
