---
date: 2026-05-31
topic: post-amplify-skill
---

# Post Amplify Skill Requirements

## Summary

Create a reusable post-amplify workflow that takes a polished canonical blog post, uses a user amplification profile to choose destination types and adapters, proposes a concise blast plan, and then sends or drafts it to the right external surfaces with minimal rewriting, canonical attribution, and explicit approval.

---

## Problem Frame

Lunch Pail Labs writing is becoming a core studio surface. Lola is willing to spend real energy writing canonical essays on the owned site, but distribution creates a second job: choosing where to share, formatting each destination, remembering platform norms, and manually reposting across surfaces.

The motivating pain is not that the canonical posts need more AI rewriting. The posts are already the work. The missed opportunity is that good writing often stops at the owned blog when it could reach more people through Dev.to, Medium, social channels, communities, newsletters, or other relevant surfaces. Draft.dev's blog promotion checklist captures the underlying thesis: publishing and promotion are both part of making writing discoverable. For this workflow, that checklist should inform the agent's judgment and action plan rather than become another checklist the writer must work through manually.

---

## Actors

- A1. Writer: Provides a canonical source post and approves any external publication or draft creation.
- A2. Amplification agent: Reads the source post, recommends suitable surfaces, prepares minimal syndicated variants, and performs approved actions where supported.
- A3. External surfaces: Destination platforms or communities where the post may be reposted, drafted, linked, or skipped based on fit.
- A4. Amplification profile: The user's configured canonical site, destination preferences, attribution defaults, approval posture, and enabled adapters.

---

## Key Flows

- F1. Amplify a canonical post
  - **Trigger:** The writer provides a blog URL or Markdown post and asks to amplify it.
  - **Actors:** A1, A2, A3, A4
  - **Steps:** The agent reads the source and amplification profile, identifies post type and audience, maps the post to destination types and enabled adapters, proposes a concise blast plan with surfaces to use or skip, requests explicit approval for the plan or individual destinations, prepares minimal destination-ready content, and completes approved posting or draft creation where supported.
  - **Outcome:** The post has been syndicated, drafted, linked, or prepared for the right surfaces without turning promotion into a manual checklist for the writer.
  - **Covered by:** R1, R2, R3, R4, R5, R8, R9

- F2. Skip a poor-fit destination
  - **Trigger:** A surface is available but the post does not fit its norms or would require excessive adaptation.
  - **Actors:** A1, A2
  - **Steps:** The agent explains why the surface is a poor fit, excludes it from the default action plan, and offers an override only if the writer explicitly asks.
  - **Outcome:** Amplification remains selective and low-fatigue rather than becoming a blast-everywhere content machine.
  - **Covered by:** R2, R6, R10

- F3. Fall back when posting is unavailable
  - **Trigger:** A selected destination lacks a configured integration, has an unavailable API, or requires unsupported manual context.
  - **Actors:** A1, A2
  - **Steps:** The agent still prepares the appropriate content, attribution, and checklist item, then clearly marks the remaining manual action.
  - **Outcome:** The workflow remains useful even when it cannot complete every external action directly.
  - **Covered by:** R7, R8, R9

---

## Requirements

**Source and classification**
- R1. The workflow must accept a canonical blog URL or Markdown draft as the source reference.
- R2. The workflow must classify the post enough to recommend destinations, including whether the post is technical, practical, conceptual, personal, product-oriented, or community-specific.
- R3. The workflow must treat the source post as the canonical artifact and avoid unnecessary rewriting by default.

**Surface recommendation**
- R4. The workflow must propose a concise blast plan with destinations to use, based on post fit and likely reader context.
- R5. The workflow must use technical blog promotion checklist practices as internal strategy input, not as a user-facing checklist the writer is expected to execute manually.
- R6. The workflow must recommend destinations to skip with brief reasons, especially when a surface would create spam risk, poor audience fit, or disproportionate effort.

**Destination model and profile**
- R7. The workflow must reason over destination types rather than only a fixed platform list.
- R8. V1 destination types must include article syndication, social broadcast, demand discovery, and manual community surfaces.
- R9. The workflow must use an amplification profile to know the user's canonical site, attribution defaults, preferred surfaces, disabled surfaces, and available adapters.
- R10. The workflow must support a low-friction first run when no profile exists by inferring a temporary plan, asking only for missing essentials before external action, and saving minimal profile decisions opportunistically.
- R11. V1 profile memory should be limited to channels and attribution: canonical site, default attribution line, enabled destinations, disabled destinations, and adapter availability.
- R12. The workflow must keep platform-specific behavior inside adapters so new destinations can be added without changing the core product model.

**Syndication preparation**
- R13. The workflow must minimally prepare destination content while preserving the original post's substance and voice.
- R14. The workflow must append or include canonical attribution, defaulting for Lunch Pail Labs to: `This post originally appeared on the Lunch Pail Labs blog.`
- R15. The workflow must include the canonical link wherever the destination format supports visible attribution or canonical metadata.

**External actions and approval**
- R16. The workflow must require explicit writer approval before posting, creating external drafts, submitting to communities, or taking any other external action.
- R17. The workflow must report completed actions, created drafts, manual blockers, and skipped destinations after the blast run.
- R18. The workflow must degrade gracefully when a destination cannot be posted to directly by producing ready-to-use copy and clear manual instructions.
- R19. Demand discovery adapters, including Reddit discovery, must not post or comment in V1; they may surface recent relevant opportunities and draft answer-shaped material for human review.

**Product surface**
- R20. The workflow should be available as a reusable standalone skill and also exposed through Pipa as an amplification route.
- R21. The reusable skill must not require Lunch Pail Labs-specific assumptions, while still allowing a configured attribution line, canonical domain, and preferred surfaces.

---

## Acceptance Examples

- AE1. **Covers R1, R2, R4, R6.** Given a technical builder tutorial from the Lunch Pail Labs blog, when the writer asks to amplify it, the workflow recommends article syndication and relevant discovery surfaces, considers social broadcast, and skips poor-fit community surfaces.
- AE2. **Covers R3, R13, R14, R15.** Given a polished canonical essay, when preparing an article-syndication destination, the workflow preserves the body with only destination-required formatting changes and adds canonical attribution back to the original post.
- AE3. **Covers R7, R8, R9, R12.** Given a user profile with enabled article-syndication and social-broadcast adapters, when the workflow builds a blast plan, it reasons by destination type and then selects the configured destination adapters that match the post.
- AE4. **Covers R10, R11, R16, R18.** Given no profile exists, when the writer asks to amplify a post, the workflow may infer a temporary plan but must ask for required approval and destination details before taking external action, then remember only channel and attribution decisions from the run.
- AE5. **Covers R16, R17.** Given the workflow has proposed a destination plan, when the writer approves one destination but not another, the workflow may create or publish only the approved item and must leave the other untouched while reporting it as not approved.
- AE6. **Covers R19.** Given a practical how-to post, when Reddit discovery finds recent related questions, the workflow may surface those opportunities and prepare answer-shaped drafts but must not post comments in V1.
- AE7. **Covers R18.** Given an article-syndication destination is selected but no connected posting tool is available, when the workflow reaches that destination, it produces the prepared post, attribution, and manual publishing instructions rather than failing the whole amplification run.

---

## Success Criteria

- A writer can start from one canonical post and complete a useful amplification pass without manually working through a promotion checklist.
- The workflow increases the blast radius of good writing while preserving the canonical post as the home base.
- The workflow reliably recommends fewer, better-fit surfaces rather than pushing every post everywhere.
- The workflow can generalize beyond Lunch Pail Labs because destination behavior is profile-configured and adapter-based.
- External actions are never taken without explicit approval.
- Downstream planning can implement the workflow without inventing the product stance on rewriting, attribution, approval, surface fit, or fallback behavior.

---

## Scope Boundaries

- Heavy rewriting or platform-native content transformation is not part of V1.
- Generating many alternate hooks, tones, threads, or copy variants is not required for V1.
- Analytics, scheduling, recurring reminders, and long-running promotion calendars are deferred.
- One-time automations, snoozes, and delayed follow-up reminders are deferred, though the workflow may be designed so those can wrap it later.
- Tracking a historical syndication queue across many posts is deferred.
- Reddit commenting, forum posting, and community submissions are outside V1 execution even when those surfaces are used for discovery.
- Fully automated posting without approval is outside the product identity.
- Generic AI content generation from thin prompts is outside the product identity.
- Growth-hacking tactics, engagement bait, and community spam are outside the product identity.

---

## Key Decisions

- Syndication first, adaptation second: The workflow exists to amplify already-good posts, not to rewrite them into a campaign.
- Canonical first: The owned blog remains the source of truth, and external surfaces point back to it through attribution and links.
- Selective blast radius: The workflow should make distribution broader without making it indiscriminate.
- Checklist-informed, not checklist-shaped: Promotion checklist ideas should shape the agent's plan and actions, not become the primary artifact.
- Types plus adapters: The core workflow should reason in reusable destination types, while specific platform behavior lives in adapters.
- Profile-configured: Reuse depends on a lightweight profile that captures user-specific destinations and guardrails without making the first run feel like setup work.
- Opportunistic memory: The profile should grow from real amplification runs, but V1 should only remember channels and attribution to avoid turning setup into a taste-management product.
- Approval-gated actions: Posting and external draft creation are valuable, but trust requires explicit approval at each destination.
- Both standalone and routed: The workflow should be discoverable as its own reusable skill while also fitting into Pipa's command surface.

---

## Dependencies / Assumptions

- Destination-specific posting or draft creation depends on available connected tools, authenticated accounts, and current platform policies.
- Some surfaces support canonical metadata, while others only support visible attribution and links.
- The initial user value does not depend on analytics or performance tracking.
- Lunch Pail Labs can provide a default attribution line and preferred canonical domain, but the reusable skill should allow other users to configure their own.
- Reddit discovery depends on search availability and should bias toward recent, relevant how-to questions rather than broad community scraping.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R10, R12][Needs research] Which destination integrations are available and reliable enough for the first implementation pass?
- [Affects R4, R6][Needs research] What destination taxonomy should V1 use for common post types and communities?
- [Affects R8, R9][Technical] How should the workflow represent destination-specific attribution requirements without hard-coding platform implementation details into the product contract?
