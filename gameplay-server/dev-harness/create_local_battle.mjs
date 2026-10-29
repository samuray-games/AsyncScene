import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { assertLoopbackApiBase } from "./api.mjs";

const API = assertLoopbackApiBase("http://127.0.0.1:8787");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

async function registerSyntheticPerson({ base, adminToken, fetchImpl }) {
  const response = await fetchImpl(base + "/v1/admin/persons", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    headers: {
      authorization: "Bearer " + adminToken,
      "content-type": "application/json",
      "idempotency-key": randomBytes(32).toString("base64url"),
    },
    body: "{}",
  });
  let body;
  try { body = await response.json(); } catch { throw new Error("Local Worker returned invalid person JSON"); }
  if (!response.ok || !UUID.test(body?.personId || "")) {
    throw new Error("Local person registration failed (" + response.status + ", " + (body?.error || "invalid response") + ")");
  }
  return body.personId;
}

export async function createSyntheticBattle({ adminToken, fetchImpl = globalThis.fetch, baseUrl = API }) {
  const base = assertLoopbackApiBase(baseUrl);
  if (typeof adminToken !== "string" || adminToken.length < 32) throw new Error("Local admin token is missing or too short");
  const participants = {
    A: { id: "synthetic-A-" + randomUUID(), role: "citizen" },
    B: { id: "synthetic-B-" + randomUUID(), role: "citizen" },
  };
  const [personA, personB] = await Promise.all(["A", "B"].map(side =>
    registerSyntheticPerson({ base, adminToken, fetchImpl })));
  const response = await fetchImpl(base + "/v1/admin/battles", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    headers: {
      authorization: "Bearer " + adminToken,
      "content-type": "application/json",
      "idempotency-key": randomBytes(32).toString("base64url"),
    },
    body: JSON.stringify({ participants, personIds: { A: personA, B: personB } }),
  });
  let body;
  try { body = await response.json(); } catch { throw new Error("Local Worker returned invalid JSON"); }
  if (!response.ok || !UUID.test(body?.battleId) ||
      !TOKEN.test(body?.capabilities?.A?.token || "") ||
      !TOKEN.test(body?.capabilities?.B?.token || "") ||
      body.capabilities.A.token === body.capabilities.B.token) {
    throw new Error("Local battle creation failed (" + response.status + ", " + (body?.error || "invalid response") + ")");
  }
  return body;
}

async function readAdminToken() {
  const envPath = fileURLToPath(new URL("../.dev.vars", import.meta.url));
  let source;
  try { source = await readFile(envPath, "utf8"); }
  catch { throw new Error("Create gameplay-server/.dev.vars from the local setup instructions first"); }
  const line = source.split(/\r?\n/).find(row => /^ADMIN_CONTROL_TOKEN=/.test(row));
  const value = line?.slice("ADMIN_CONTROL_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
  if (!value || value.length < 32) throw new Error("ADMIN_CONTROL_TOKEN is missing from gameplay-server/.dev.vars");
  return value;
}

function printCredentials(battle) {
  process.stdout.write([
    "LOCAL SYNTHETIC BATTLE CREATED",
    "Battle ID: " + battle.battleId,
    "Player A token: " + battle.capabilities.A.token,
    "Player B token: " + battle.capabilities.B.token,
    "Open http://127.0.0.1:4173 in two separate private profiles and enter one token per profile.",
    "These are local test credentials. Do not share them or paste them into a hosted game.",
    "",
  ].join("\n"));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { printCredentials(await createSyntheticBattle({ adminToken: await readAdminToken() })); }
  catch (error) { process.stderr.write("LOCAL_BATTLE_FAILED: " + error.message + "\n"); process.exitCode = 1; }
}
