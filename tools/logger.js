#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 17321;
const LOG_DIR = path.resolve(__dirname, "..", "AsyncSceneLogs");
const LAST_FILE = path.join(LOG_DIR, "last.jsonl");
const MAX_LAST_LINES = 5000;

let lastLines = [];

const ensureLogDir = () => {
  return fs.promises.mkdir(LOG_DIR, { recursive: true });
};

const loadLastLines = async () => {
  try {
    const data = await fs.promises.readFile(LAST_FILE, "utf8");
    lastLines = data.split("\n").filter(Boolean);
    if (lastLines.length > MAX_LAST_LINES) {
      lastLines = lastLines.slice(-MAX_LAST_LINES);
    }
  } catch (_) {
    lastLines = [];
  }
};

const appendDaily = async (lines) => {
  if (!lines.length) return;
  const now = new Date();
  const suffix = now.toISOString().replace(/[:.]/g, "-").replace(/T/, "_").split("Z")[0];
  const target = path.join(LOG_DIR, `asyncscene-${suffix}.jsonl`);
  await fs.promises.appendFile(target, lines.join("\n") + "\n");
};

const writeLast = async () => {
  try {
    await fs.promises.writeFile(LAST_FILE, lastLines.join("\n") + (lastLines.length ? "\n" : ""));
  } catch (err) {
    console.error("Failed to write last.jsonl:", err.message);
  }
};

const handleLog = async (payload) => {
  if (!payload || !Array.isArray(payload.entries) || payload.entries.length === 0) {
    return;
  }
  const lines = payload.entries
    .map(e => {
      try {
        return JSON.stringify(e);
      } catch (_) {
        return null;
      }
    })
    .filter(Boolean);
  if (!lines.length) return;
  await appendDaily(lines);
  lastLines = lastLines.concat(lines);
  if (lastLines.length > MAX_LAST_LINES) {
    lastLines = lastLines.slice(-MAX_LAST_LINES);
  }
  await writeLast();
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(data || "{}");
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/ping") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method === "POST" && req.url === "/log") {
      const payload = await parseBody(req);
      await ensureLogDir();
      await handleLog(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error("Logger error:", err.message);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: err.message }));
  }
});

const start = async () => {
  await ensureLogDir();
  await loadLastLines();
  server.listen(PORT, () => {
    console.log(`AsyncScene logger listening on http://localhost:${PORT}`);
  });
};

start().catch(err => {
  console.error("Failed to start logger:", err.message);
  process.exit(1);
});
