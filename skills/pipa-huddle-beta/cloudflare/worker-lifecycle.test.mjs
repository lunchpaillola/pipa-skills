import assert from "node:assert/strict";
import test from "node:test";

import { VoiceSession } from "./worker.mjs";

globalThis.WebSocket ??= {};
globalThis.WebSocket.READY_STATE_OPEN ??= 1;

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    async get(key) {
      return values.get(key);
    },
    async put(key, value) {
      values.set(key, value);
    },
    async setAlarm(value) {
      values.set("alarm", value);
    }
  };
}

function createVoiceSession(storage, env = {}) {
  return new VoiceSession({ storage }, env);
}

async function internalStatus(sessionObject) {
  const response = await sessionObject.fetch(new Request("https://voice-session/internal/status"));
  return {
    status: response.status,
    body: await response.json()
  };
}

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

test("hosted Worker does not expire a previously paired session at pairing TTL after restart", async (t) => {
  const now = 10_000;
  t.mock.method(Date, "now", () => now);
  const storage = createStorage({
    session: {
      id: "session-1",
      state: "paired",
      createdAt: now - 600_000,
      lastActivityAt: now - 1_000,
      pairingExpiresAt: now - 1,
      idleTimeoutMs: 600_000,
      activeTurnId: "",
      browser: { tokenHash: "browser-hash", pairingExpiresAt: now - 1 },
      bridge: { tokenHash: "bridge-hash", pairingExpiresAt: now - 1 }
    }
  });

  const restartedObject = createVoiceSession(storage);

  const status = await internalStatus(restartedObject);

  assert.equal(status.status, 200);
  assert.equal(status.body.gone, false);
  assert.equal(status.body.state, "degraded");
});
