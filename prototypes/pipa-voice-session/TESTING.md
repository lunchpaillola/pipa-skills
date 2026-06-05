# Pipa Voice Session Prototype Testing

Open the static prototype directly or run the scratch server from this folder:

```bash
node prototypes/pipa-voice-session/server.mjs
```

Then open `http://127.0.0.1:8787`.

The operational hosted/local voice session still runs from the repository root:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

## Manual Scenarios

1. **Page loads**
   Verify the page shows three prototype directions: Join Lobby, Live Words, and Chat Strip.

2. **Join Lobby pre-join**
   Enter a name, click `Test speaker`, then click `Join huddle`. Verify the orb becomes the main focus and copy addresses the named user.

3. **Speaker activation**
   Click `Test speaker` in each direction. Verify browser speech attempts to speak a short confirmation.

4. **Orb state loop**
   Click the orb repeatedly. Verify states cycle through ready, listening, processing, and speaking with visible copy changes and motion changes.

5. **Live Words text generation**
   Switch to `Live Words`. Verify the page shows interim transcription, the finalized user turn, and the generated agent reply under the orb.

6. **Chat Strip transcript surface**
   Switch to `Chat Strip`. Verify transcript is the primary surface and the orb becomes a smaller bottom voice control.

7. **Mobile layout**
   Resize to a phone width. Verify all three variants avoid horizontal scrolling and keep the primary action reachable.

8. **Processing sound hook**
   Add a local `processing.mp3` next to `index.html`, click until the processing state appears, and verify the file is attempted at low volume.

9. **Reduced motion**
   Enable reduced motion. Verify state remains visible through text even when animation is disabled.

## Expected Limits

- No automatic OpenCode tool approval or live shell/file control by voice.
- No durable transcript persistence.
- No Daily/WebRTC hosted room.
- No spoken approval for tools, files, or shell commands.
- No real speech-to-text or WebSocket relay in this static prototype.
