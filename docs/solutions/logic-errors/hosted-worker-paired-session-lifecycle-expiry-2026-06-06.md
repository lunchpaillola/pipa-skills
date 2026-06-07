---
title: Hosted Worker Sessions Must Persist Pairing State Across Restarts
date: 2026-06-06
category: docs/solutions/logic-errors/
module: pipa-huddle-beta hosted Cloudflare Worker relay
problem_type: logic_error
component: assistant
symptoms:
  - Previously paired hosted huddle sessions could appear new after a Worker restart.
  - Paired sessions could expire at the original pairing TTL after restart.
  - Disconnects did not reliably expose a degraded or reconnecting lifecycle state.
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - tooling
  - testing_framework
tags:
  - pipa-huddle-beta
  - cloudflare-worker
  - durable-objects
  - lifecycle
  - websocket
  - reconnect-grace
---

# Hosted Worker Sessions Must Persist Pairing State Across Restarts

## Problem

Pipa Huddle beta hosted sessions are coordinated through a Cloudflare Worker Durable Object with two websocket roles: `browser` and `bridge`. The Worker previously inferred whether a session had paired from the in-memory socket map, so a Durable Object restart or role disconnect could make an already paired session look unpaired.

That confused the first-pairing lifecycle with post-pair recovery. A recoverable paired session could regress to a waiting state or expire at the original `pairingExpiresAt` TTL instead of remaining degraded and recoverable.

## Symptoms

- `/internal/status` could report a previously paired session as effectively new after the Durable Object restarted with an empty socket map.
- A session that had already paired could expire once the original pairing TTL elapsed.
- Missing browser or bridge sockets after pairing did not have durable state for degraded or reconnect behavior.
- Production debugging had limited lifecycle-only signal for pairing, detaching, ending, and expiring transitions.

## What Didn't Work

- Treating socket presence as the source of truth for pairing was insufficient because Durable Object memory can be cleared by restart, deployment, idle eviction, or transient disconnect.
- Reusing `pairingExpiresAt` for all missing-socket cases collapsed two different states: never paired and paired before the current socket state was lost.
- Checking only `session.state` was not enough because older stored sessions may not include the new lifecycle fields and state strings can lag the underlying lifecycle facts.

## Solution

Persist lifecycle facts in the stored session record and use in-memory sockets only for current connectivity.

New sessions now include durable lifecycle fields. This lifecycle-only shape shows the fields that matter for the fix:

```js
const session = {
  id,
  state: "created",
  createdAt: now,
  pairedAt: null,
  disconnectedAt: { browser: null, bridge: null },
  lastActivityAt: now,
  pairingExpiresAt,
  idleTimeoutMs,
  browser: { tokenHash: browserHash },
  bridge: { tokenHash: bridgeHash }
};
```

Every path that reads a session normalizes older stored records before making lifecycle decisions:

```js
function normalizeLifecycle(session) {
  session.disconnectedAt ||= { browser: null, bridge: null };
  session.disconnectedAt.browser ||= null;
  session.disconnectedAt.bridge ||= null;
  session.pairedAt ||= ["paired", "active_turn", "degraded"].includes(session.state)
    ? session.lastActivityAt || session.createdAt || Date.now()
    : null;
  return session;
}

function hasPaired(session) {
  normalizeLifecycle(session);
  return Boolean(session.pairedAt);
}
```

Status and websocket attach decisions now separate first-pairing expiry from post-pair recovery:

```js
if (!hasPaired(session) && Date.now() > session.pairingExpiresAt) {
  await this.expire(session, "Expired. Start a new session.");
  return json({ ok: false, gone: true, state: "expired" }, 410);
}

if (this.reconnectExpired(session)) {
  await this.expire(session, "Reconnect grace expired. Start a new session.");
  return json({ ok: false, gone: true, state: "expired" }, 410);
}
```

Reconnect grace is role-specific and starts when a role detaches:

```js
reconnectExpired(session, now = Date.now()) {
  if (!hasPaired(session)) return false;
  return ["browser", "bridge"].some((role) =>
    !this.sockets.has(role) && this.roleReconnectExpired(session, role, now)
  );
}

roleReconnectExpired(session, role, now = Date.now()) {
  const disconnectedAt = session.disconnectedAt?.[role];
  return Boolean(disconnectedAt && now - disconnectedAt >= this.reconnectGraceMs());
}
```

On attach, the role's disconnect marker is cleared and `pairedAt` is set once both roles are connected:

```js
this.sockets.set(auth.role, server);
session.disconnectedAt[auth.role] = null;
if (this.isPaired() && !session.pairedAt) session.pairedAt = Date.now();
await this.touch(session);
```

On detach, the missing role is recorded durably:

```js
async detach(role) {
  this.sockets.delete(role);
  this.invalidFrames.delete(role);

  const session = await this.ctx.storage.get("session");
  if (session && !session.endedAt) {
    normalizeLifecycle(session);
    session.disconnectedAt[role] = Date.now();
    await this.touch(session);
  }
}
```

The state machine reports `degraded` for already paired sessions that are missing one side:

```js
state(session) {
  normalizeLifecycle(session);
  if (session.endedAt) return session.state;
  if (this.sockets.has("browser") && this.sockets.has("bridge") && session.activeTurnId) return "active_turn";
  if (this.sockets.has("browser") && this.sockets.has("bridge")) return "paired";
  if (hasPaired(session)) return "degraded";
  if (this.sockets.has("browser")) return "browser_waiting";
  if (this.sockets.has("bridge")) return "bridge_waiting";
  return "created";
}
```

Regression tests capture the restart case by preserving stored session data while constructing a fresh `VoiceSession` with no in-memory sockets:

```js
test("hosted Worker treats a restarted paired session as degraded instead of new", async (t) => {
  const now = 10_000;
  t.mock.method(Date, "now", () => now);
  const storage = createStorage({
    session: {
      id: "session-1",
      state: "paired",
      createdAt: now - 1_000,
      lastActivityAt: now - 100,
      pairingExpiresAt: now + 60_000,
      idleTimeoutMs: 600_000,
      activeTurnId: "",
      browser: { tokenHash: "browser-hash", pairingExpiresAt: now + 60_000 },
      bridge: { tokenHash: "bridge-hash", pairingExpiresAt: now + 60_000 }
    }
  });

  const restartedObject = createVoiceSession(storage);
  const status = await internalStatus(restartedObject);

  assert.equal(status.status, 200);
  assert.equal(status.body.gone, false);
  assert.equal(status.body.state, "degraded");
});
```

## Why This Works

`pairedAt` is a durable fact that the session successfully paired at least once. It survives Worker restarts and lets the code distinguish "never paired" from "paired but currently missing a socket."

`disconnectedAt` is a durable timestamp per role when the Worker observes a detach. It lets the Worker apply reconnect grace after pairing for an actually disconnected role. If the Durable Object restarts with no sockets and no detach timestamps, `pairedAt` still prevents the session from being treated as never paired; the session can report `degraded` rather than expiring on the first-pairing TTL.

That keeps the short first-pairing TTL strict for unpaired sessions while preserving expected recovery behavior for active or recently paired sessions.

The `normalizeLifecycle` helper keeps the fix safe for existing stored sessions by deriving `pairedAt` from legacy lifecycle states when possible and ensuring `disconnectedAt` always has both role keys.

## Prevention

- Persist lifecycle facts that need to survive process restarts; reserve socket maps for live transport state only.
- Keep lifecycle predicates centralized (`normalizeLifecycle`, `hasPaired`, `reconnectExpired`, `roleReconnectExpired`) so status, attach, and alarm paths cannot drift.
- Test restart behavior by recreating the Durable Object instance while preserving storage and clearing in-memory sockets.
- Cover both expiration windows: first-pairing TTL for never-paired sessions and reconnect grace for already paired sessions.
- Include alarm/reschedule tests so paired sessions with an old pairing TTL do not get pulled back into first-pairing expiry behavior.
- Log lifecycle-only events such as session initialization, attach, detach, end, and expiry, but avoid logging tokens, message bodies, transcripts, or user audio data.

## Related Issues

- GitHub issue: https://github.com/lunchpaillola/pipa-skills/issues/24
- Related reference: `skills/pipa-huddle-beta/references/hosted-relay.md`
- Related plan: `docs/plans/2026-06-03-002-feat-pipa-voice-session-hosted-relay-plan.md`
- Related privacy guidance: `skills/pipa-huddle-beta/references/privacy-and-retention.md`
