#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PIPA_VOICE_SESSION_PORT || 8787);
const host = process.env.PIPA_VOICE_SESSION_HOST || "127.0.0.1";
const projectDir = process.env.PIPA_VOICE_SESSION_DIR || process.cwd();
const opencodeBin = process.env.OPENCODE_BIN || "opencode";
const openCodeTurnTimeoutMs = Number(process.env.PIPA_VOICE_SESSION_TURN_TIMEOUT_SECONDS || 300) * 1000;
const assetDir = join(projectDir, "skills", "pipa-huddle-beta", "assets");
let localSessionEnded = false;

function soundDesignAsset(url) {
  if (url === "/sound-design-entering-chat.mp3") return join(assetDir, "sound-design-entering-chat.mp3");
  if (url === "/sound-design-thinking.mp3") return join(assetDir, "sound-design-thinking.mp3");
  return "";
}

function imageAsset(url) {
  if (url === "/pipa-mark.png") return join(assetDir, "pipa-mark.png");
  return "";
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "").trim();
}

function extractJsonResponse(stdout) {
  const chunks = [];
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;

    try {
      const event = JSON.parse(trimmed);
      const candidates = [
        event.message,
        event.text,
        event.content,
        event.delta,
        event.data?.message,
        event.data?.text,
        event.data?.content,
        event.properties?.content
      ];
      for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) chunks.push(candidate.trim());
      }
    } catch (_error) {
      // Non-JSON log lines are ignored; default output parsing handles them.
    }
  }
  return chunks.join("\n").trim();
}

function runOpenCodeTurn({ message, sessionId, continueLast }) {
  return new Promise((resolve, reject) => {
    const args = ["run", message, "--dir", projectDir];
    if (sessionId) args.push("--session", sessionId);
    else if (continueLast !== false) args.push("--continue");

    const child = spawn(opencodeBin, args, {
      cwd: projectDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`OpenCode turn timed out after ${Math.round(openCodeTurnTimeoutMs / 1000)} seconds`));
    }, openCodeTurnTimeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      const parsed = extractJsonResponse(stdout);
      const text = parsed || stripAnsi(stdout);
      if (code === 0 && text) {
        resolve({ text, stderr: stripAnsi(stderr) });
      } else {
        reject(new Error(stripAnsi(stderr) || text || `OpenCode exited with code ${code}`));
      }
    });
  });
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      const html = await readFile(join(__dirname, "index.html"), "utf8");
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(html);
      return;
    }

    if (req.method === "GET") {
      const assetPath = soundDesignAsset(req.url || "");
      if (assetPath) {
        const audio = await readFile(assetPath);
        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store"
        });
        res.end(audio);
        return;
      }

      const imagePath = imageAsset(req.url || "");
      if (imagePath) {
        const image = await readFile(imagePath);
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        });
        res.end(image);
        return;
      }
    }

    if (req.method === "GET" && req.url === "/api/status") {
      if (localSessionEnded) {
        sendJson(res, 410, { ok: false, state: "ended", error: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
        return;
      }
      sendJson(res, 200, {
        ok: true,
        mode: "local-opencode-bridge",
        projectDir,
        opencodeBin,
        retention: "Browser transcript state is in-memory; OpenCode session history follows local OpenCode behavior."
      });
      return;
    }

    if (req.method === "POST" && req.url === "/api/turn") {
      if (localSessionEnded) {
        sendJson(res, 410, { ok: false, state: "ended", error: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
        return;
      }
      const rawBody = await readRequestBody(req);
      const body = JSON.parse(rawBody || "{}");
      const message = String(body.message || "").trim();
      if (!message) {
        sendJson(res, 400, { ok: false, error: "Missing message" });
        return;
      }

      const result = await runOpenCodeTurn({
        message,
        sessionId: body.sessionId ? String(body.sessionId).trim() : "",
        continueLast: body.continueLast !== false
      });
      sendJson(res, 200, { ok: true, reply: result.text, stderr: result.stderr });
      return;
    }

    if (req.method === "POST" && req.url === "/api/end") {
      localSessionEnded = true;
      sendJson(res, 200, { ok: true, state: "ended", message: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Pipa voice session bridge: http://${host}:${port}`);
  console.log(`Project directory: ${projectDir}`);
  console.log("Voice turns will call: opencode run <message> --continue --dir <project>");
});
