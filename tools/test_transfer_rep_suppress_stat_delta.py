from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/state.js"
DOCS = ROOT / "docs/state.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for path in (SOURCE, DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

for text in (
    'meta && meta.suppressStatDelta === true',
    'emitStatDelta("rep", afterRep - beforeRep',
    'emitStatDelta("influence", afterInfluence - beforeInfluence',
):
    require(text in SOURCE.read_text(encoding="utf-8"), f"source missing {text}")
    require(text in DOCS.read_text(encoding="utf-8"), f"docs missing {text}")

node = r'''
const fs = require("fs");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/state.js", "utf8");
const marker = "function transferRep(fromId, toId, amount, reason, battleId, meta){";
const start = source.indexOf(marker);
assert(start >= 0, "transferRep not found");
let depth = 0, end = -1;
for (let i = source.indexOf("{", start); i < source.length; i += 1) {
  if (source[i] === "{") depth += 1;
  if (source[i] === "}" && --depth === 0) { end = i + 1; break; }
}
assert(end > start, "transferRep end not found");
const transferRepFactory = Function(
  "State", "Game", "ReactionPolicy", "Security", "ResourceValidator", "isDevFlag",
  "getRepAccount", "withRepWrite", "applyRepConversion", "syncMeToPlayers",
  "logRepTransfer", "emitStatDelta",
  "return (" + source.slice(start, end) + ");"
);

function makeRuntime(rep) {
  const State = { rep, me: { id: "me", influence: 0 }, players: { me: { id: "me" } } };
  const accounts = { crowd_pool: { rep: 0 }, other: { rep: 10 } };
  const log = [], deltas = [], claims = [], releases = [];
  const Game = { __D: {} };
  const ReactionPolicy = null;
  const Security = { isSafe: () => true, rateLimit: () => ({ ok: true }) };
  const ResourceValidator = { claim: () => { const key = `claim_${claims.length}`; claims.push(key); return { ok: true, key }; }, release: (key, ok) => releases.push({ key, ok }) };
  const isDevFlag = () => false;
  const getRepAccount = (id) => id === "me" ? State.me : accounts[id] || null;
  const withRepWrite = (fn) => fn();
  const applyRepConversion = () => { State.me.influence += 1; };
  const syncMeToPlayers = () => { State.players.me.rep = State.rep; State.players.me.influence = State.me.influence; };
  const logRepTransfer = (entry) => log.push(entry);
  const emitStatDelta = (kind, delta, meta) => deltas.push({ kind, delta, meta });
  const transferRep = transferRepFactory(
    State, Game, ReactionPolicy, Security, ResourceValidator, isDevFlag, getRepAccount,
    withRepWrite, applyRepConversion, syncMeToPlayers, logRepTransfer, emitStatDelta
  );
  return {
    State, log, deltas, claims, releases,
    transfer: (from, to, amount, meta) => transferRep.call(null, from, to, amount, "test_rep_transfer", "test_battle", meta),
  };
}

const ordinary = makeRuntime(0);
const ordinaryResult = ordinary.transfer("crowd_pool", "me", 1, { actionId: "ordinary" });
assert.deepStrictEqual(ordinaryResult, { ok: true, amount: 1 });
assert.strictEqual(ordinary.State.rep, 1);
assert.strictEqual(ordinary.log.length, 1);
assert.deepStrictEqual(ordinary.deltas.map((entry) => [entry.kind, entry.delta]), [["rep", 1], ["influence", 1]]);
assert.strictEqual(ordinary.claims.length, 1);
assert.deepStrictEqual(ordinary.releases, [{ key: "claim_0", ok: true }]);

const silent = makeRuntime(0);
const silentResult = silent.transfer("crowd_pool", "me", 1, { actionId: "silent", suppressStatDelta: true });
assert.deepStrictEqual(silentResult, { ok: true, amount: 1 });
assert.strictEqual(silent.State.rep, ordinary.State.rep);
assert.strictEqual(silent.State.me.influence, ordinary.State.me.influence);
assert.strictEqual(silent.log.length, 1);
assert.strictEqual(silent.deltas.length, 0);
assert.strictEqual(silent.claims.length, 1);
assert.deepStrictEqual(silent.releases, [{ key: "claim_0", ok: true }]);

const failed = makeRuntime(0);
const failedResult = failed.transfer("me", "crowd_pool", 1, { actionId: "failure", suppressStatDelta: true });
assert.strictEqual(failedResult.ok, false);
assert.strictEqual(failedResult.reason, "insufficient_rep");
assert.strictEqual(failed.State.rep, 0);
assert.strictEqual(failed.log.length, 0);
assert.strictEqual(failed.deltas.length, 0);
assert.strictEqual(failed.claims.length, 0);
console.log("PASS_TRANSFER_REP_SUPPRESS_STAT_DELTA");
'''

subprocess.run(["node", "-e", node], cwd=ROOT, check=True)
print("PASS_TRANSFER_REP_SUPPRESS_STAT_DELTA_CONTRACT")
