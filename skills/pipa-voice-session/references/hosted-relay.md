# Hosted Relay

The hosted relay is the primary path when the user needs to talk to the active agent from a sandboxed or remote browser. Production runs at `https://voice.usepipa.com` as a Cloudflare Worker with one Durable Object per voice session. It wraps the existing local OpenCode bridge with outbound-only WebSocket connections and a stable HTTPS browser page. Localhost remains the same-machine development and fallback path.

## When To Use It

Use hosted relay mode when the user needs:

- a browser voice session from a machine that is not running OpenCode
- HTTPS/WSS microphone support without a personal ngrok setup
- a branded or stable voice-session link
- sandbox-to-local-agent access through outbound bridge connectivity only

Prefer local mode for confidential client, hiring, legal, health, financial, or security work unless the relay deployment's privacy and logging posture has been verified.

## Runtime Shape

```text
Browser HTTPS page `/s/<session-id>` -> hosted WSS relay `/ws/<session-id>` <- local bridge WebSocket client -> `opencode run`
```

Both participants connect outbound to the relay. The relay never opens an inbound connection to the user's machine.

The relay routes only these message families:

- browser to bridge: `user_turn`, `interrupt`, `end`
- bridge to browser: `assistant_reply`, `status`, `error`, `end`
- relay lifecycle status to either side: waiting, paired, reconnecting, expired, ended, blocked

The relay must reject generic RPC, command, shell, file, tool, or execution messages. A message such as `{ "type": "exec", "command": "rm -rf" }` is invalid and must not be forwarded.

## Session Lifecycle

Each hosted session gets its own generated session id and role-separated credentials. Browser links use `https://voice.usepipa.com/s/<session-id>#token=...`. The browser token stays in the URL fragment and the bridge token is printed only to the local bridge process.

Each hosted session is in one of these states:

- `created`: session credentials exist, but neither role has connected
- `browser_waiting`: the browser is connected and waiting for the local bridge
- `bridge_waiting`: the bridge is connected and waiting for the browser
- `paired`: both roles are connected and ready
- `active_turn`: one `user_turn` is in flight to OpenCode
- `degraded`: one role disconnected during the reconnect grace window
- `expired`: unused pairing link, idle timeout, or reconnect timeout closed the session
- `ended`: browser or bridge explicitly ended the session
- `revoked`: credentials were invalidated after end, expiry, or invalid takeover

User-facing labels should map these states to plain language: waiting for local bridge, paired, sending to OpenCode, reconnecting, expired, ended, or blocked.

## Credentials

Hosted relay sessions use short-lived opaque credentials:

- one browser credential and one bridge credential per session
- credentials are role-separated and cannot be exchanged between roles
- credentials are high entropy and stored hashed in memory by the relay
- credentials have explicit pairing, idle, and absolute expiry
- credentials are revoked on explicit end, expiry, or invalid takeover attempts
- credential values must not be logged, printed in crash reports, or embedded in request logs

Browser bootstrap keeps the browser token in the URL fragment and sends WebSocket credentials through `Sec-WebSocket-Protocol` values rather than query parameters by default. Query-string token auth is local/debug-only and requires explicit opt-in. Serve the hosted page with `Referrer-Policy: no-referrer`.

## Local Bridge Safety Boundary

Hosted relay mode can send remote browser text to a local agent, so the local bridge must fail closed unless a mechanical OpenCode restriction is configured. Prompt instructions alone are not a safety boundary.

Hosted mode does not add OpenCode flags by default and does not pass `--dangerously-skip-permissions`. It forwards spoken/text turns to `opencode run`; OpenCode's normal session and permission behavior still applies. The bridge pins the OpenCode session id at startup and then uses `--session <id>` for turns, so the voice session stays on the thread that was active when the bridge started instead of following whatever later becomes the last session. Custom `PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS` must use flags supported by the installed OpenCode version; unsupported safety flags such as `--no-tools` are not passed through.

Hosted relay mode is not spoken approval. If the user asks to approve file edits, shell commands, or tool calls by voice, return a scope blocker and offer to use voice for planning or clarification before normal agent execution.

## Privacy And Retention

The relay privacy default is lifecycle-only logging. Do not retain by default:

- raw audio
- raw transcript
- message bodies
- local paths
- token values

Disclose the component boundary clearly:

- browser speech recognition may use browser, OS, or vendor speech services
- relay forwards final text turns and assistant replies without retaining bodies by default
- local bridge logs should avoid raw turn bodies
- OpenCode local session history may persist final text turns according to normal local OpenCode behavior
- durable user-facing output remains an optional synthesized handoff

## Normal User Flow

For sandboxed or remote-browser voice sessions, use the Pipa hosted relay path:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs --hosted
```

The command should create a relay session, connect the local bridge, and print one browser URL. It should not ask the user to manually assemble relay URLs, session ids, bridge tokens, Wrangler commands, or Cloudflare settings.

The active session stays alive while it is being used. An unused pairing link expires after about 15 minutes. A paired but idle session ends after about 10 minutes without meaningful activity. Manual end revokes immediately.

## Operator Configuration

Production deployment uses:

- `cloudflare/worker.mjs`: Worker and `VoiceSession` Durable Object
- `cloudflare/wrangler.jsonc`: `voice.usepipa.com/*` route, Durable Object binding, migration, and production vars
- `POST /api/sessions`: creates one session package
- `GET /s/<session-id>#token=...`: browser voice page
- `WSS /ws/<session-id>`: browser and bridge WebSocket endpoint

The local Node relay remains for development/debugging. Its configuration is:

- `PIPA_VOICE_RELAY_PUBLIC_BASE_URL`: public HTTPS origin for browser links
- `PIPA_VOICE_RELAY_ALLOWED_ORIGINS`: comma-separated allowed browser origins
- `PIPA_VOICE_RELAY_PORT`: HTTP server port, default `8788`
- `PIPA_VOICE_RELAY_PAIRING_TTL_SECONDS`: time to wait for both roles to join
- `PIPA_VOICE_RELAY_IDLE_TIMEOUT_SECONDS`: idle close timeout, default 10 minutes
- `PIPA_VOICE_RELAY_MAX_MESSAGE_BYTES`: maximum text frame size
- `PIPA_VOICE_RELAY_MAX_SESSIONS`: max in-memory concurrent sessions
- `PIPA_VOICE_RELAY_DISABLED`: kill switch; when truthy, new session creation is blocked
- `PIPA_VOICE_RELAY_PRINT_SESSION`: local-dev convenience only; prints initial session credentials when explicitly enabled
- `PIPA_VOICE_RELAY_OPERATOR_TOKEN`: optional bearer or `x-pipa-relay-operator-token` credential for `POST /api/sessions`; when unset, session creation is self-serve and protected by capability-token pairing
- `PIPA_VOICE_RELAY_ALLOW_QUERY_TOKEN`: local/debug-only compatibility switch for query-string WebSocket credentials

The local bridge hosted mode can accept explicit internals for operator debugging, but normal users should use `--hosted` instead:

- `PIPA_VOICE_RELAY_URL`: hosted relay WebSocket URL
- `PIPA_VOICE_RELAY_SESSION_ID`: session id returned by the relay
- `PIPA_VOICE_RELAY_BRIDGE_TOKEN`: bridge role credential
- `PIPA_VOICE_SESSION_OPENCODE_SESSION`: optional explicit OpenCode session id to pin; otherwise resolved at bridge startup
- `PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS`: optional OpenCode args for hosted mode; unset by default

## Deployment Checklist

Before exposing a public relay URL:

- terminate TLS and expose HTTPS/WSS only
- enable HSTS on branded domains
- validate browser `Origin` against configured allowed origins
- configure secrets through the hosting platform or secret store
- keep all session state in memory unless a later design explicitly adds encrypted storage
- disable or redact request URL, authorization header, token, and body logging
- decide whether session creation is self-serve or operator-authorized before exposing `POST /api/sessions`
- if operator-authorized, keep `PIPA_VOICE_RELAY_OPERATOR_TOKEN` in a managed secret store
- if self-serve, keep pairing TTLs short and use Cloudflare rate limiting or WAF rules if abuse appears
- keep query-string WebSocket token auth disabled for hosted deployments
- ensure APM and crash tooling do not capture message bodies or local paths
- emit lifecycle-only structured app logs
- verify a test session's platform logs contain no tokens, transcripts, message bodies, or local filesystem paths
- keep an emergency kill switch that blocks new session creation

Operational signals may include active sessions, rejected handshakes, invalid frames, rate-limit events, reconnects, expiries, and relay-disabled state. They must not include transcript text or assistant replies.

Production should not use a Cloudflare Tunnel to a developer machine. Deploy the Worker with `npm run deploy:voice-relay` after `npx wrangler login`; the route `voice.usepipa.com/*` should point at the Worker. Production monitoring, accounts, and team access controls are follow-up work.

## Blocker Wording

Missing relay configuration:

```md
Voice session blocked.

- **Blocked at:** hosted relay configuration
- **Why:** no reachable hosted relay can create a session for this bridge
- **Next:** restore or deploy the Worker at `voice.usepipa.com`, or use local mode until hosted relay is available
```

Expired link:

```md
Voice session blocked.

- **Blocked at:** session lifecycle
- **Why:** this hosted voice link expired or was ended
- **Next:** start a new hosted voice session and open the new browser link
```

Wrong-role token:

```md
Voice session blocked.

- **Blocked at:** relay authentication
- **Why:** the credential is not valid for this participant role
- **Next:** use the browser link for the browser and the bridge token only in the local bridge command
```

Unknown privacy posture:

```md
Voice session blocked.

- **Blocked at:** privacy
- **Why:** the hosted relay deployment's logging and retention settings are not verified
- **Next:** use local mode for this topic, or verify relay/platform logs before using a hosted link
```

OpenCode permission prompt:

```md
Voice session blocked.

- **Blocked at:** OpenCode permission flow
- **Why:** OpenCode requires normal permission handling for this action
- **Next:** respond through the normal OpenCode session permission flow
```
