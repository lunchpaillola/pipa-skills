# Privacy And Retention

The default privacy posture is transient raw audio and transcript. Save only the handoff summary when the user explicitly asks to continue or preserve it.

## Required Labels

Before starting a session, label:

- where audio is processed
- whether speech recognition may leave the browser/device
- whether a provider room is involved
- whether raw transcript is stored
- what durable artifact, if any, will remain

## Local OpenCode Bridge

Use this wording unless implementation verifies stronger guarantees:

> Browser speech is browser-mediated and may use cloud speech services depending on the browser and OS. Browser transcript state is in-memory. Turns sent to OpenCode become part of local OpenCode session history according to OpenCode's normal behavior.

The bridge should bind to `127.0.0.1` by default. Treat `0.0.0.0` or LAN use as explicit testing mode.

## Provider Rooms

If using Daily/WebRTC or another hosted provider, document before use:

- room expiry
- link access rules
- whether recording is disabled by default
- whether transcription is disabled by default
- provider visibility into media or metadata
- required environment variables or account setup

If these facts are unknown, block rather than start the session.

## Handoff Retention

The optional handoff is a concise durable output for V1. It should contain synthesized context, decisions, open questions, and a continuation prompt. It should not contain raw transcript unless the user explicitly asks for transcript export and the transport supports safe export.

## Sensitive Work

For confidential client, hiring, legal, health, financial, or security topics, prefer the local bridge unless the configured provider privacy posture is known. Ask before creating any shareable link.
