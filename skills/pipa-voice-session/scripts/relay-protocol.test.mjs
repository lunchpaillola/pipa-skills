import assert from "node:assert/strict";
import test from "node:test";

import {
  createRelaySession,
  createRelayStore,
  parseRelayFrame,
  redactForLog,
  validateRelayMessage
} from "./relay-protocol.mjs";

test("valid browser user_turn with turn_id passes schema validation", () => {
  const result = validateRelayMessage("browser", { type: "user_turn", turn_id: "turn-1", text: "Let's plan the rollout." });

  assert.equal(result.ok, true);
  assert.equal(result.message.type, "user_turn");
});

test("valid bridge assistant_reply with matching turn_id passes schema validation", () => {
  const result = validateRelayMessage("bridge", { type: "assistant_reply", turn_id: "turn-1", text: "Start with the risks." }, { activeTurnId: "turn-1" });

  assert.equal(result.ok, true);
  assert.equal(result.message.type, "assistant_reply");
});

test("session creation returns separate browser and bridge credentials", () => {
  const session = createRelaySession({ now: 1_000, pairingTtlMs: 60_000 });

  assert.equal(session.browser.role, "browser");
  assert.equal(session.bridge.role, "bridge");
  assert.notEqual(session.browser.token, session.bridge.token);
  assert.notEqual(session.browser.tokenHash, session.bridge.tokenHash);
  assert.equal(session.expiresAt, null);
  assert.equal(session.browser.pairingExpiresAt, session.bridge.pairingExpiresAt);
});

test("duplicate turn_id is reported before forwarding", () => {
  const context = { seenTurnIds: new Set(["turn-1"]) };
  const result = validateRelayMessage("browser", { type: "user_turn", turn_id: "turn-1", text: "Repeat" }, context);

  assert.equal(result.ok, false);
  assert.equal(result.code, "duplicate_turn");
});

test("command-like RPC shape is rejected", () => {
  const result = validateRelayMessage("browser", { type: "user_turn", turn_id: "turn-1", text: "Run something", command: "rm -rf" });

  assert.equal(result.ok, false);
  assert.equal(result.code, "command_shape_not_allowed");
});

test("wrong role tokens are rejected", () => {
  const store = createRelayStore({ now: () => 1_000 });
  const session = store.createSession({ ttlMs: 60_000 });

  const browserAsBridge = store.authenticate({ sessionId: session.id, role: "bridge", token: session.browser.token });
  const bridgeAsBrowser = store.authenticate({ sessionId: session.id, role: "browser", token: session.bridge.token });

  assert.equal(browserAsBridge.ok, false);
  assert.equal(browserAsBridge.code, "invalid_token");
  assert.equal(bridgeAsBrowser.ok, false);
  assert.equal(bridgeAsBrowser.code, "invalid_token");
});

test("replaying token after session end is rejected", () => {
  const store = createRelayStore({ now: () => 1_000 });
  const session = store.createSession({ ttlMs: 60_000 });

  store.endSession(session.id, "test ended");
  const result = store.authenticate({ sessionId: session.id, role: "browser", token: session.browser.token });

  assert.equal(result.ok, false);
  assert.equal(result.code, "session_ended");
});

test("oversized transcript payload is rejected clearly", () => {
  const result = validateRelayMessage("browser", { type: "user_turn", turn_id: "turn-1", text: "x".repeat(32) }, { maxTextBytes: 10 });

  assert.equal(result.ok, false);
  assert.equal(result.code, "payload_too_large");
});

test("binary frame is rejected", () => {
  const result = parseRelayFrame(Buffer.from("hello"));

  assert.equal(result.ok, false);
  assert.equal(result.code, "binary_not_allowed");
});

test("browser and bridge can pair in either order", () => {
  const store = createRelayStore({ now: () => 1_000 });
  const session = store.createSession({ ttlMs: 60_000 });

  assert.equal(store.attachConnection({ sessionId: session.id, role: "browser", token: session.browser.token, connectionId: "browser-1" }).state, "browser_waiting");
  assert.equal(store.attachConnection({ sessionId: session.id, role: "bridge", token: session.bridge.token, connectionId: "bridge-1" }).state, "paired");

  const second = store.createSession({ ttlMs: 60_000 });
  assert.equal(store.attachConnection({ sessionId: second.id, role: "bridge", token: second.bridge.token, connectionId: "bridge-2" }).state, "bridge_waiting");
  assert.equal(store.attachConnection({ sessionId: second.id, role: "browser", token: second.browser.token, connectionId: "browser-2" }).state, "paired");
});

test("second active browser is rejected, but grace reconnect can replace same role", () => {
  let now = 1_000;
  const store = createRelayStore({ now: () => now, reconnectGraceMs: 5_000 });
  const session = store.createSession({ ttlMs: 60_000 });

  store.attachConnection({ sessionId: session.id, role: "browser", token: session.browser.token, connectionId: "browser-1" });
  const duplicate = store.attachConnection({ sessionId: session.id, role: "browser", token: session.browser.token, connectionId: "browser-2" });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, "role_already_connected");

  store.detachConnection(session.id, "browser", "browser-1");
  now += 1_000;
  const reconnect = store.attachConnection({ sessionId: session.id, role: "browser", token: session.browser.token, connectionId: "browser-2" });
  assert.equal(reconnect.ok, true);
  assert.equal(reconnect.state, "browser_waiting");
});

test("expired pairing token asks for a new session", () => {
  let now = 1_000;
  const store = createRelayStore({ now: () => now });
  const session = store.createSession({ ttlMs: 60_000, pairingTtlMs: 1_000 });
  now = 3_000;

  const result = store.authenticate({ sessionId: session.id, role: "browser", token: session.browser.token });

  assert.equal(result.ok, false);
  assert.equal(result.code, "session_expired");
});

test("paired session survives pairing deadline until idle timeout", () => {
  let now = 1_000;
  const store = createRelayStore({ now: () => now });
  const session = store.createSession({ pairingTtlMs: 1_000, idleTimeoutMs: 60_000 });
  store.attachConnection({ sessionId: session.id, role: "browser", token: session.browser.token, connectionId: "browser-1" });
  store.attachConnection({ sessionId: session.id, role: "bridge", token: session.bridge.token, connectionId: "bridge-1" });
  now = 3_000;

  const result = store.authenticate({ sessionId: session.id, role: "browser", token: session.browser.token });

  assert.equal(result.ok, true);
});

test("ended and expired sessions are removed so capacity recovers", () => {
  let now = 1_000;
  const store = createRelayStore({ now: () => now, maxSessions: 1 });
  const session = store.createSession({ pairingTtlMs: 1_000 });
  now = 3_000;

  assert.equal(store.createSession({ pairingTtlMs: 1_000 }).ok, false);
  assert.equal(store.cleanupExpired(), 1);
  const next = store.createSession({ pairingTtlMs: 1_000 });

  assert.equal(typeof next.id, "string");
  assert.notEqual(next.id, session.id);
});

test("assistant reply without active browser turn is rejected", () => {
  const result = validateRelayMessage("bridge", { type: "assistant_reply", turn_id: "turn-1", text: "Unsolicited" });

  assert.equal(result.ok, false);
  assert.equal(result.code, "no_active_turn");
});

test("only one turn can be in flight and replies clear it", () => {
  const store = createRelayStore({ now: () => 1_000 });
  const session = store.createSession({ ttlMs: 60_000 });

  assert.equal(store.beginTurn(session.id, "turn-1").ok, true);
  const second = store.beginTurn(session.id, "turn-2");
  assert.equal(second.ok, false);
  assert.equal(second.code, "turn_in_flight");
  assert.equal(store.finishTurn(session.id, "turn-1").ok, true);
  assert.equal(store.beginTurn(session.id, "turn-2").ok, true);
});

test("redaction removes token and message bodies from logs", () => {
  const redacted = redactForLog({ token: "secret", text: "transcript", message: "reply", localPath: "/Users/example/repo", type: "status" });

  assert.equal(redacted.token, "[redacted]");
  assert.equal(redacted.text, "[redacted]");
  assert.equal(redacted.message, "[redacted]");
  assert.equal(redacted.localPath, "[redacted]");
  assert.equal(redacted.type, "status");
});
