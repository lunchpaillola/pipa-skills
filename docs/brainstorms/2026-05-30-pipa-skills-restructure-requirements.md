---
date: 2026-05-30
topic: pipa-skills-restructure
---

# Pipa Skills Restructure Requirements

## Summary

Pipa will become the single memorable PM brain for this repository: one primary skill surface with command-driven workflows underneath. The existing PM skill sprawl will collapse into Pipa commands and references, high-value adjacent workflows will remain separately discoverable and invocable from Pipa, and the public documentation should borrow Impeccable's command-centered product shape.

---

## Problem Frame

The current repository has broad PM workflow coverage, but the surface area is hard to remember. Users must choose between many lifecycle skills and router skills before they can get the work done, which makes the repository feel like a catalog of separate tools rather than one coherent assistant.

The strongest external pattern is not another layer of routers. Impeccable shows the value of one memorable skill with explicit commands, while Hallmark shows the value of an opinionated product surface with a small number of verbs and strong defaults. The current PM lifecycle model is still useful as internal workflow structure, but it should not remain the main public mental model.

Impeccable's public docs provide the clearest style and layout reference for Pipa. They lead with a sharp product claim, describe the system as “1 skill, many commands,” group commands by lifecycle category, show command chains, and use a docs site to teach how the commands work together instead of only listing features. Pipa should adapt that pattern for PM/delivery work: one brain, clear verbs, practical command paths, and docs that help users decide what to run next.

---

## Actors

- A1. User: Installs and invokes Pipa to get project delivery work done without remembering many skill names.
- A2. Agent: Uses the Pipa entry point to route explicit commands and natural-language PM requests into the right workflow.
- A3. Maintainer: Evolves the repository, decides which workflows belong inside Pipa, and keeps standalone breakout skills discoverable.
- A4. Downstream planner/implementer: Uses this requirements document to create an implementation plan without inventing product behavior or migration boundaries.

---

## Key Flows

- F1. Explicit Pipa command flow
  - **Trigger:** A user invokes Pipa with a known command such as initiate, plan, execute, monitor, close, status, triage, budget, risk, help, audio, automate, trigger, or composio.
  - **Actors:** A1, A2
  - **Steps:** The agent recognizes the command, loads the matching workflow reference, applies shared communication/style expectations, and returns the workflow output without requiring the user to know the old PM skill name.
  - **Outcome:** The user gets the requested PM output through one memorable Pipa surface.
  - **Covered by:** R1, R2, R4, R5, R6
- F2. Natural-language PM request flow
  - **Trigger:** A user asks for PM work without an explicit Pipa command, such as “give me a status update” or “triage these tickets.”
  - **Actors:** A1, A2
  - **Steps:** The agent recognizes the PM intent, routes to the appropriate Pipa command/workflow, and explains the selected route only when useful.
  - **Outcome:** Pipa behaves like one PM brain rather than a command-only tool that fails without exact syntax.
  - **Covered by:** R1, R3, R5, R6
- F3. Breakout skill discovery flow
  - **Trigger:** A user needs an adjacent high-value workflow such as audio briefing, Composio-connected tool work, or Pipa automation/trigger management.
  - **Actors:** A1, A2, A3
  - **Steps:** The workflow remains available as its own top-level skill while Pipa may also reference or route to it where useful.
  - **Outcome:** High-value workflows remain discoverable outside the core PM brain instead of being hidden behind Pipa.
  - **Covered by:** R8, R9, R10
- F3b. Breakout invocation flow
  - **Trigger:** A user asks Pipa for an explicit audio/listenable/spoken brief, Composio-connected tool work, Pipa trigger management, or Pipa recurring automation work.
  - **Actors:** A1, A2
  - **Steps:** Pipa recognizes the intent, loads or invokes the appropriate standalone workflow, preserves that workflow's safety rules, and returns the result through the Pipa interaction surface.
  - **Outcome:** Pipa feels like one skill while still reusing high-value standalone workflows.
  - **Covered by:** R11, R12, R13, R14, R15
- F4. Repository migration flow
  - **Trigger:** The repository is renamed and restructured for the Pipa release.
  - **Actors:** A3, A4
  - **Steps:** The public positioning changes from Project Management Skills to Pipa Skills, PM standalone skill folders are removed rather than maintained as compatibility shims, and the PM workflows remain preserved as internal Pipa references.
  - **Outcome:** The repository has a cleaner product surface and a simpler install/use story.
  - **Covered by:** R7, R8, R11, R12, R13
- F5. Documentation navigation flow
  - **Trigger:** A user lands on the README or future Pipa docs without knowing which PM command they need.
  - **Actors:** A1, A3
  - **Steps:** The docs explain Pipa as one PM brain, recommend a few starting commands, group the full command list by work phase or job type, and show common command chains.
  - **Outcome:** The user can choose the next Pipa command from intent, not from memorized skill names.
  - **Covered by:** R16, R17, R18, R19, R20, R21, R22, R23
- F6. Evaluation flow
  - **Trigger:** A maintainer changes Pipa command routing, workflow references, docs, or standalone invocation behavior.
  - **Actors:** A3, A4
  - **Steps:** The maintainer runs targeted evals that cover command routing, natural-language routing, standalone workflow invocation, safety gates, and documentation clarity.
  - **Outcome:** Large restructuring changes can be reviewed against expected behavior instead of relying only on manual inspection.
  - **Covered by:** R25, R26, R27, R28, R29

---

## Requirements

**Product surface**
- R1. The repository must be repositioned from “Project Management Skills” to “Pipa Skills.”
- R2. Pipa must be presented as a product name, not an acronym.
- R3. Pipa must be described as one PM brain from the user perspective.
- R4. Pipa must be implemented as a command framework from the workflow architecture perspective.
- R5. The primary user experience must reduce the need to remember many separate PM skill names.
- R6. Pipa must support both explicit command-style invocation and natural-language auto-routing for recognizable PM requests.

**Workflow consolidation**
- R7. Existing PM lifecycle workflows must be preserved as reusable workflow references behind Pipa.
- R8. The old PM router model must be collapsed into Pipa’s unified command dispatch rather than kept as separate top-level router skills.
- R9. PM workflow commands should cover the core lifecycle jobs currently represented by initiate, plan, execute, monitor/status, triage, budget, risk/escalation, and close workflows.
- R10. Shared PM communication behavior must remain available as a common reference or contract used by Pipa commands.

**Breakout skills**
- R11. `pipa-audio-brief` must remain a separately discoverable top-level skill.
- R12. `composio` must remain a separately discoverable top-level skill.
- R13. `pipa-triggers` and `pipa-workflow-automation` must remain separately discoverable top-level skills.
- R14. Breakout skills should be reserved for workflows that are high-value, tool/product-specific, or independently discoverable beyond the core PM brain.
- R15. Pipa must be able to route into or invoke the audio brief, Composio, Pipa trigger, and Pipa recurring automation workflows from the Pipa entry skill.
- R16. When Pipa invokes a standalone workflow, it must preserve that workflow's safety gates, setup checks, required confirmations, and output contracts rather than flattening them into a generic Pipa response.
- R17. `pipa-audio-brief`, `composio`, `pipa-triggers`, and `pipa-workflow-automation` must be treated as read-only during this restructure. Pipa Audio Brief took significant iteration and should stay exactly as it is; the other named breakout skills should also not be edited.
- R17a. Pipa must route to Pipa Audio Brief only when the user explicitly asks for an audio, listenable, spoken, listening-page, or phone-friendly brief. Generic “brief this,” “write a brief,” “requirements brief,” or “project brief” language must stay in PM/document workflow routing instead.

**Migration and public documentation**
- R18. The first Pipa release must remove old standalone `pm-*` skill folders rather than keeping compatibility shims.
- R19. The README must lead with the simpler Pipa mental model before listing detailed command/workflow coverage.
- R20. Installation and usage examples must teach users to install and invoke Pipa first, with breakout skills documented separately.
- R21. Documentation must avoid presenting the old PM lifecycle lane taxonomy as the primary public organizing model, while allowing it to remain internally useful.

**Docs style and layout**
- R22. Pipa documentation should take structural inspiration from Impeccable's public docs: a clear product claim, a command-first navigation model, command groups, and practical usage examples.
- R23. Pipa documentation should group commands by user job or lifecycle category, not by old skill folder names.
- R24. Pipa documentation should show common command chains, such as planning before execution, triage before escalation, or status before closeout.
- R25. Pipa documentation should recommend a few high-value next commands when the user does not know where to start, while still exposing the full command menu.
- R26. Pipa public copy should be direct, opinionated, and concrete, avoiding generic AI-tool marketing and over-explaining the PM lifecycle.
- R27. Pipa may eventually support a docs site or generated docs layer, but the first release only needs the repository README and skill documentation to establish the Impeccable-inspired structure.

**Skill quality and evals**
- R28. Pipa must follow the lessons in `tasks/03-27-lessons-from-building-skills.md`: concise entry skill, progressive disclosure, concrete trigger descriptions, high-signal gotchas, explicit setup patterns, and curated non-overlapping workflows.
- R29. Pipa must include eval coverage for explicit command routing, natural-language routing, PM reference selection, standalone workflow invocation, and command menu clarity.
- R30. Evals must include negative cases where Pipa should not over-route into a standalone workflow, skip a confirmation gate, collapse a specialized workflow's safety rules, or require edits to read-only breakout skills.
- R31. The first Pipa release should include lightweight evals sufficient for this early-stage restructure without creating a large eval framework that slows iteration.

---

## Acceptance Examples

- AE1. **Covers R3, R5, R6.** Given a user asks “give me a project status update,” when Pipa is available, the agent routes the request to the appropriate status workflow without requiring the user to name the old status skill.
- AE2. **Covers R4, R8, R9.** Given a user invokes a Pipa command for planning, when the command is recognized, the agent uses the appropriate planning workflow reference instead of delegating to a separate top-level PM router skill.
- AE3. **Covers R11, R12, R13, R14.** Given a user searches available skills for audio brief, Composio, or Pipa automation work, when the repository is installed or listed, those workflows remain visible as standalone skills.
- AE4. **Covers R15, R16, R17.** Given a user asks Pipa to create a recurring Pipa automation, when Pipa routes the request, Pipa points to the existing automation workflow contract without editing it, and the automation workflow still requires schedule, timezone, delivery destination, execution prompt, and final confirmation before create.
- AE5. **Covers R15, R16, R17, R17a.** Given a user asks Pipa to make an audio brief from a URL, when Pipa routes the request, Pipa points to the existing Pipa Audio Brief workflow without editing it, and the audio brief workflow still verifies source access, creates a spoken brief script, runs the audio generation path, and returns the listening result or a clear blocker.
- AE5b. **Covers R17a.** Given a user says “brief this PR” without asking for audio, listenable, spoken, listening-page, or phone-friendly output, when Pipa routes the request, it must not route to Pipa Audio Brief.
- AE6. **Covers R18, R19, R20.** Given a user reads the Pipa Skills README after migration, when they look for how to start, the first path teaches the Pipa entry point rather than a list of `pm-*` skill names.
- AE7. **Covers R22, R23, R24, R25.** Given a user opens the docs without knowing what command to run, when they scan the command section, they see grouped commands, recommended starting paths, and examples of commands that naturally chain together.
- AE8. **Covers R26.** Given a maintainer writes public Pipa copy, when the copy is reviewed, it should make a specific claim about Pipa's PM brain/command value rather than using generic productivity or AI assistant language.
- AE9. **Covers R29, R30, R31.** Given a maintainer changes Pipa routing, when evals run, they catch at least one representative failure in command routing, natural-language routing, standalone invocation, skipped confirmation/safety behavior, and attempted edits to read-only breakout skills.

---

## Success Criteria

- Users can understand the repository as “use Pipa for PM/delivery work” in one sentence.
- Users no longer need to remember dozens of `pm-*` skill names to access core project delivery workflows.
- The Pipa command surface feels closer to Impeccable/Hallmark: memorable, opinionated, and command-driven rather than catalog-driven.
- Existing PM workflow value is preserved behind Pipa instead of lost during the rename.
- Breakout workflows remain discoverable where hiding them inside Pipa would reduce adoption or clarity.
- Pipa can invoke the named breakout workflows without weakening their safety requirements or output contracts.
- The README and skill docs feel like a product surface, not an inventory dump.
- Users can infer useful command chains from documentation without needing a maintainer to explain the architecture.
- Maintainers have lightweight evals that make this large restructure reviewable before and after implementation.
- A downstream planner can turn this document into a migration plan without deciding the product positioning, deletion policy, breakout criteria, or command mental model from scratch.

---

## Scope Boundaries

### Deferred for later

- Exact file moves, command parser structure, and reference loading mechanics.
- Exact command names beyond the core examples already discussed.
- Version bump timing and release sequencing.
- Local install testing details and final verification matrix.
- Whether Pipa should later gain additional standalone high-value skills beyond the currently named breakouts.
- A full public documentation website equivalent to `impeccable.style/docs/`.
- A dedicated CLI/plugin distribution layer modeled after Impeccable's installer and harness-specific builds.
- Heavyweight usage instrumentation beyond lightweight evals and simple undertriggering checks.

### Outside this product's identity

- Maintaining all current PM workflows as independent public top-level skills.
- Providing compatibility shims for every old `pm-*` skill in the first Pipa release.
- Editing `pipa-audio-brief`, `composio`, `pipa-triggers`, or `pipa-workflow-automation` as part of this restructure.
- Reframing Pipa as a generic all-purpose agent brain beyond project, delivery, and PM work.
- Expanding Pipa into a forced acronym.
- Treating the PM lifecycle lane taxonomy as the main public product story.
- Copying Impeccable's design-domain command set or visual brand literally.
- Flattening specialized standalone workflows so much that Pipa bypasses their confirmations, setup rules, or gotchas.

---

## Key Decisions

- Pipa is one PM brain: This is the primary product promise and the public mental model.
- Pipa is not an acronym: The name should stay lightweight and brandable rather than over-explained.
- Commands replace remembered skill names: The interaction model should resemble one skill with verbs, not a catalog of PM lifecycle skills.
- PM routers collapse into Pipa: Router behavior remains useful, but it belongs inside the Pipa entry point instead of being exposed as separate skills.
- Old `pm-*` folders are deleted in the first release: The migration is a clean product simplification, not a long compatibility period.
- Audio brief, Composio, and Pipa workflows remain standalone: These are discoverable, high-value, or tool/product-specific enough to justify separate top-level skills.
- Pipa invokes the breakouts too: Standalone discoverability and one-skill invocation are both required, not competing options.
- Impeccable is the docs/layout model: Pipa should adapt its one-skill, many-commands, grouped-docs structure for PM work.
- README first, docs site later: The first release should establish the product/documentation shape without requiring a full website build.
- Evals are part of the restructure: The change is broad enough that routing and safety behavior need lightweight regression coverage from the first Pipa release.

---

## Dependencies / Assumptions

- The implementation plan will validate the exact current skill list before moving or deleting files.
- The repository rename will be coordinated with README install examples and package/registry expectations.
- Existing PM workflow content is still useful enough to preserve as references rather than rewrite from scratch.
- Inspiration from Impeccable and Hallmark is architectural and product-surface inspiration, not a requirement to copy their exact command set or design-domain behavior.
- Impeccable references reviewed for this brainstorm include `https://impeccable.style/docs/`, `https://github.com/pbakaus/impeccable`, and the public README, PRODUCT.md, STYLE.md, and `skill/SKILL.src.md` from that repository.
- Skill quality lessons from `tasks/03-27-lessons-from-building-skills.md` are authoritative planning input for the Pipa restructure.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R6][Technical] What exact command parsing and natural-language routing pattern should Pipa use in `SKILL.md`?
- [Affects R7, R10][Technical] How should cross-references be rewritten so workflow references load cleanly after consolidation?
- [Affects R11, R12, R13, R15][Needs research] Should breakout skills duplicate any shared references from Pipa, or should they link back to Pipa-owned references?
- [Affects R17, R19][Technical] What local install and command-invocation tests are needed before deleting old `pm-*` folders?
- [Affects R21, R22, R23][Needs research] What exact command categories should Pipa use so the docs feel command-first without reverting to the old lifecycle taxonomy?
- [Affects R26][Product] Should a Pipa docs site be part of a later release, or is the repository README enough for the foreseeable future?
- [Affects R28, R29, R30][Technical] What minimal eval harness and fixture format should this repo use for skill-routing evals?
