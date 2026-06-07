# Pipa Huddle Hosted Relay Diagnosis Plan

## Scope

Handle GitHub issues:

- https://github.com/lunchpaillola/pipa-skills/issues/24
- https://github.com/lunchpaillola/pipa-skills/issues/23

## Diagnosis Result

The confirmed failure is a hosted relay lifecycle bug: the Cloudflare Worker Durable Object used live in-memory sockets as the source of truth for whether a session had paired. If the Durable Object restarted or lost socket memory while durable session metadata survived, a previously paired session could regress to `created`, `bridge_waiting`, or `browser_waiting`. Once the original pairing TTL elapsed, the same session could expire even though it had already paired successfully.

The deterministic feedback loop is `skills/pipa-huddle-beta/cloudflare/worker-lifecycle.test.mjs`. It recreates a Durable Object with preserved stored session data and an empty in-memory socket map.

Before the fix, the loop failed with:

```text
actual: "created"
expected: "degraded"

410 !== 200
```

After the fix, the loop passes.

## Hypotheses Tested

1. Worker state is derived from in-memory sockets instead of durable paired metadata.
2. Pairing TTL is applied to restarted paired sessions because the Worker treats them as never paired.
3. Browser WebSocket close is terminal, so transient network or relay disconnects require a new huddle.
4. The launcher defaults local unless `--hosted` is passed, which conflicts with issue 23.
5. Sparse lifecycle logs make future hosted disconnects hard to diagnose.

The first two are confirmed by the new failing-then-passing regression loop. The third and fourth were addressed directly in this branch. The fifth is partially addressed with lifecycle-only Worker logs.

## Execution Plan

1. Keep the Worker regression suite in the normal `npm test` path.
2. Persist paired lifecycle facts in Worker durable storage with `pairedAt` and per-role `disconnectedAt` timestamps.
3. Treat missing sockets after a paired session as `degraded`, not as a fresh unpaired session.
4. Apply pairing TTL only to never-paired sessions.
5. Apply reconnect grace only after paired role disconnects.
6. Add hosted browser reconnect behavior for transient WebSocket closes.
7. Make hosted launch the default path and require `--local` for local fallback.
8. Verify generated hosted template sync, relay tests, and Worker lifecycle tests.
9. For production, deploy the Worker and run a five-to-six-minute hosted huddle smoke test with multiple turns.

## Related Learning

See `docs/solutions/logic-errors/hosted-worker-paired-session-lifecycle-expiry-2026-06-06.md` for the reusable debugging lesson and code-level rationale.
