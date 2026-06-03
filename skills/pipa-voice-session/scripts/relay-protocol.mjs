import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const ROLES = Object.freeze(["browser", "bridge"]);
export const BROWSER_TO_BRIDGE_TYPES = Object.freeze(["user_turn", "interrupt", "end"]);
export const BRIDGE_TO_BROWSER_TYPES = Object.freeze(["assistant_reply", "status", "error", "end"]);
export const RELAY_STATUS_TYPES = Object.freeze(["status", "error", "end"]);

const DEFAULT_MAX_TEXT_BYTES = 32_000;
const DEFAULT_PAIRING_TTL_MS = 5 * 60 * 1000;
const DEFAULT_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_RECONNECT_GRACE_MS = 15_000;
const BODY_KEYS = new Set(["token", "browserToken", "bridgeToken", "authorization", "text", "message", "reply", "transcript", "command", "localPath", "path"]);

export function tokenHash(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function randomId() {
  return randomBytes(12).toString("base64url");
}

function byteLength(value) {
  return Buffer.byteLength(String(value), "utf8");
}

function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), "hex");
  const right = Buffer.from(String(b), "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createRelaySession(options = {}) {
  const now = options.now ?? Date.now();
  const pairingTtlMs = options.pairingTtlMs ?? DEFAULT_PAIRING_TTL_MS;
  const absoluteExpiresAt = Number.isFinite(options.ttlMs) && options.ttlMs > 0 ? now + options.ttlMs : null;
  const browserToken = randomToken();
  const bridgeToken = randomToken();

  return {
    id: options.id || randomId(),
    state: "created",
    createdAt: now,
    expiresAt: absoluteExpiresAt,
    pairingExpiresAt: now + pairingTtlMs,
    idleExpiresAt: now + (options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS),
    idleTimeoutMs: options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS,
    endedAt: null,
    endReason: "",
    activeTurnId: null,
    seenTurnIds: new Set(),
    invalidFrames: 0,
    connections: {
      browser: null,
      bridge: null
    },
    disconnectedAt: {
      browser: null,
      bridge: null
    },
    browser: {
      role: "browser",
      token: browserToken,
      tokenHash: tokenHash(browserToken),
      pairingExpiresAt: now + pairingTtlMs
    },
    bridge: {
      role: "bridge",
      token: bridgeToken,
      tokenHash: tokenHash(bridgeToken),
      pairingExpiresAt: now + pairingTtlMs
    }
  };
}

export function parseRelayFrame(frame, options = {}) {
  if (Buffer.isBuffer(frame) || frame instanceof ArrayBuffer) {
    return { ok: false, code: "binary_not_allowed", error: "Binary relay messages are not allowed" };
  }

  const maxMessageBytes = options.maxMessageBytes ?? DEFAULT_MAX_TEXT_BYTES;
  const raw = String(frame || "");
  if (byteLength(raw) > maxMessageBytes) {
    return { ok: false, code: "payload_too_large", error: "Relay message is too large" };
  }

  try {
    const message = JSON.parse(raw);
    if (!message || Array.isArray(message) || typeof message !== "object") {
      return { ok: false, code: "invalid_json_shape", error: "Relay message must be a JSON object" };
    }
    return { ok: true, message };
  } catch (_error) {
    return { ok: false, code: "invalid_json", error: "Relay message must be valid JSON" };
  }
}

export function validateRelayMessage(role, message, context = {}) {
  if (!ROLES.includes(role)) {
    return { ok: false, code: "invalid_role", error: "Relay role must be browser or bridge" };
  }
  if (!message || Array.isArray(message) || typeof message !== "object") {
    return { ok: false, code: "invalid_message", error: "Relay message must be an object" };
  }

  const type = String(message.type || "");
  const allowedTypes = role === "browser" ? BROWSER_TO_BRIDGE_TYPES : BRIDGE_TO_BROWSER_TYPES;
  if (!allowedTypes.includes(type)) {
    return { ok: false, code: "unknown_type", error: `Message type ${type || "(missing)"} is not allowed for ${role}` };
  }

  if (message.command || message.rpc || message.exec || message.shell || message.tool || message.files) {
    return { ok: false, code: "command_shape_not_allowed", error: "Relay messages cannot contain command or RPC fields" };
  }

  const maxTextBytes = context.maxTextBytes ?? DEFAULT_MAX_TEXT_BYTES;
  if ((type === "user_turn" || type === "assistant_reply") && !String(message.turn_id || "").trim()) {
    return { ok: false, code: "missing_turn_id", error: "Message requires turn_id" };
  }

  if (type === "user_turn") {
    const text = String(message.text || "").trim();
    if (!text) return { ok: false, code: "missing_text", error: "User turn requires text" };
    if (byteLength(text) > maxTextBytes) return { ok: false, code: "payload_too_large", error: "User turn is too large" };
    if (context.seenTurnIds?.has(message.turn_id)) return { ok: false, code: "duplicate_turn", error: "This turn was already handled" };
  }

  if (type === "assistant_reply") {
    const text = String(message.text || "").trim();
    if (!text) return { ok: false, code: "missing_text", error: "Assistant reply requires text" };
    if (byteLength(text) > maxTextBytes) return { ok: false, code: "payload_too_large", error: "Assistant reply is too large" };
    if (!context.activeTurnId) {
      return { ok: false, code: "no_active_turn", error: "No browser turn is in flight" };
    }
    if (context.activeTurnId && message.turn_id !== context.activeTurnId) {
      return { ok: false, code: "turn_mismatch", error: "Assistant reply turn_id does not match the active turn" };
    }
  }

  if ((type === "status" || type === "error") && !String(message.message || "").trim()) {
    return { ok: false, code: "missing_message", error: `${type} requires message` };
  }

  return { ok: true, message: { ...message, type } };
}

function computeState(session) {
  const hasBrowser = Boolean(session.connections.browser);
  const hasBridge = Boolean(session.connections.bridge);
  if (session.endedAt) return session.state;
  if (hasBrowser && hasBridge) return session.activeTurnId ? "active_turn" : "paired";
  if (hasBrowser) return "browser_waiting";
  if (hasBridge) return "bridge_waiting";
  if (session.disconnectedAt.browser || session.disconnectedAt.bridge) return "degraded";
  return "created";
}

function isExpired(session, now) {
  const pairedOnce = Boolean(session.connections.browser && session.connections.bridge) || ["paired", "active_turn", "degraded"].includes(session.state);
  return (session.expiresAt !== null && now >= session.expiresAt) || (!pairedOnce && now >= session.pairingExpiresAt) || now >= session.idleExpiresAt;
}

export function createRelayStore(options = {}) {
  const sessions = new Map();
  const now = options.now || (() => Date.now());
  const reconnectGraceMs = options.reconnectGraceMs ?? DEFAULT_RECONNECT_GRACE_MS;
  const maxSessions = options.maxSessions ?? 100;

  function getSession(id) {
    return sessions.get(id) || null;
  }

  function expireIfNeeded(session) {
    if (!session || session.endedAt) return session;
    if (isExpired(session, now())) {
      session.state = "expired";
      session.endedAt = now();
      session.endReason = "expired";
      session.connections.browser = null;
      session.connections.bridge = null;
    }
    return session;
  }

  function authenticate({ sessionId, role, token }) {
    if (!ROLES.includes(role)) return { ok: false, code: "invalid_role", error: "Invalid relay role" };
    const session = expireIfNeeded(getSession(sessionId));
    if (!session) return { ok: false, code: "unknown_session", error: "Unknown relay session" };
    if (session.state === "ended" || session.state === "revoked") return { ok: false, code: "session_ended", error: "This hosted voice session has ended" };
    if (session.state === "expired") return { ok: false, code: "session_expired", error: "This hosted voice link expired. Start a new session." };

    const credential = session[role];
    const candidateHash = tokenHash(token || "");
    if (!safeEqualHex(candidateHash, credential.tokenHash)) {
      return { ok: false, code: "invalid_token", error: "Relay credential is not valid for this participant role" };
    }

    return { ok: true, session };
  }

  return {
    sessions,
    getSession,
    createSession(config = {}) {
      if (sessions.size >= maxSessions) {
        return { ok: false, code: "max_sessions", error: "Relay is at its session limit" };
      }
      const session = createRelaySession({ now: now(), ...config });
      sessions.set(session.id, session);
      return session;
    },
    authenticate,
    attachConnection({ sessionId, role, token, connectionId }) {
      const auth = authenticate({ sessionId, role, token });
      if (!auth.ok) return auth;
      const session = auth.session;
      const existing = session.connections[role];
      if (existing && existing !== connectionId) {
        return { ok: false, code: "role_already_connected", error: `${role} is already connected` };
      }

      const disconnectedAt = session.disconnectedAt[role];
      if (disconnectedAt && now() - disconnectedAt > reconnectGraceMs) {
        session.state = "expired";
        session.endedAt = now();
        session.endReason = "reconnect grace expired";
        return { ok: false, code: "reconnect_expired", error: "Reconnect grace expired. Start a new session." };
      }

      session.connections[role] = connectionId;
      session.disconnectedAt[role] = null;
      session.idleExpiresAt = now() + (session.idleTimeoutMs || DEFAULT_IDLE_TIMEOUT_MS);
      session.state = computeState(session);
      return { ok: true, session, state: session.state };
    },
    detachConnection(sessionId, role, connectionId) {
      const session = getSession(sessionId);
      if (!session || session.connections[role] !== connectionId) return { ok: false };
      session.connections[role] = null;
      session.disconnectedAt[role] = now();
      session.state = computeState(session);
      return { ok: true, session, state: session.state };
    },
    beginTurn(sessionId, turnId) {
      const session = expireIfNeeded(getSession(sessionId));
      if (!session || session.endedAt) return { ok: false, code: "session_unavailable", error: "Session is unavailable" };
      if (session.activeTurnId) return { ok: false, code: "turn_in_flight", error: "A voice turn is already in flight" };
      if (session.seenTurnIds.has(turnId)) return { ok: false, code: "duplicate_turn", error: "This turn was already handled" };
      session.activeTurnId = turnId;
      session.seenTurnIds.add(turnId);
      session.state = computeState(session);
      return { ok: true, session, state: session.state };
    },
    finishTurn(sessionId, turnId) {
      const session = getSession(sessionId);
      if (!session || session.activeTurnId !== turnId) return { ok: false, code: "turn_mismatch", error: "No matching turn is in flight" };
      session.activeTurnId = null;
      session.state = computeState(session);
      return { ok: true, session, state: session.state };
    },
    endSession(sessionId, reason = "ended") {
      const session = getSession(sessionId);
      if (!session) return { ok: false };
      session.state = "ended";
      session.endedAt = now();
      session.endReason = reason;
      session.activeTurnId = null;
      session.connections.browser = null;
      session.connections.bridge = null;
      return { ok: true, session };
    },
    cleanupExpired() {
      for (const session of sessions.values()) expireIfNeeded(session);
      let removed = 0;
      for (const [id, session] of sessions.entries()) {
        if (session.endedAt) {
          sessions.delete(id);
          removed += 1;
        }
      }
      return removed;
    }
  };
}

export function publicSessionPackage(session, publicBaseUrl = "") {
  const base = publicBaseUrl.replace(/\/$/, "");
  const fragment = `session=${encodeURIComponent(session.id)}&token=${encodeURIComponent(session.browser.token)}`;
  return {
    session_id: session.id,
    browser_url: base ? `${base}/session#${fragment}` : `/session#${fragment}`,
    idle_timeout_seconds: Math.floor(session.idleTimeoutMs / 1000),
    browser: {
      role: "browser",
      token: session.browser.token,
      pairing_expires_at: new Date(session.browser.pairingExpiresAt).toISOString()
    },
    bridge: {
      role: "bridge",
      token: session.bridge.token,
      pairing_expires_at: new Date(session.bridge.pairingExpiresAt).toISOString()
    }
  };
}

export function redactForLog(value) {
  if (Array.isArray(value)) return value.map(redactForLog);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, BODY_KEYS.has(key) ? "[redacted]" : redactForLog(item)]));
}
