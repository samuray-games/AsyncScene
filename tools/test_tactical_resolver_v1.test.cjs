"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const modulePath = path.join(__dirname, "..", "AsyncScene", "Web", "conflict", "tactical-resolver.js");
const moduleSource = fs.readFileSync(modulePath, "utf8");
const moduleSandbox = { module: { exports: {} } };
moduleSandbox.globalThis = moduleSandbox;
Object.defineProperty(moduleSandbox, "document", { get() { throw new Error("DOM accessed"); } });
Object.defineProperty(moduleSandbox, "localStorage", { get() { throw new Error("storage accessed"); } });
Object.defineProperty(moduleSandbox, "fetch", { get() { throw new Error("network accessed"); } });
Object.defineProperty(moduleSandbox, "setTimeout", { get() { throw new Error("timer accessed"); } });
vm.createContext(moduleSandbox);
vm.runInContext("Date.now = function(){ throw new Error('clock accessed'); }; Math.random = function(){ throw new Error('random accessed'); };", moduleSandbox);
vm.runInContext(moduleSource, moduleSandbox, { filename: "tactical-resolver.js" });
const rawResolver = moduleSandbox.module.exports;
const resolver = { resolve: (...args) => JSON.parse(JSON.stringify(rawResolver.resolve(...args))) };
const colors = ["y", "o", "r", "k"];
const attacks = ["N", "P", "T"];
const defenses = ["S", "C", "G"];
const tactics = attacks.flatMap(attackType => defenses.map(defenseType => attackType + defenseType));
const value = { y: 2, o: 3, r: 4, k: 5 };
const rank = { y: 0, o: 1, r: 2 };
const outcomeSwap = { A_WIN: "B_WIN", B_WIN: "A_WIN", DRAW: "DRAW" };
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
function same(actual, expected, message) { assert.deepStrictEqual(actual, expected, message); checks++; }

function snapshot(attackColor, defenseColor, tactic, role) {
  return {
    attackColor,
    defenseColor,
    attackType: tactic[0],
    defenseType: tactic[1],
    role: role || (attackColor === "k" || defenseColor === "k" ? "mafia" : "citizen")
  };
}
function pair(colorA, colorB, tacticA, tacticB) {
  return [snapshot(colorA[0], colorA[1], tacticA), snapshot(colorB[0], colorB[1], tacticB)];
}
function call(a, b) { return resolver.resolve(a, b, "tactical_v1"); }

// Independent reference implementation: the formulas are expressed separately from the production module.
function reference(a, b) {
  const atk = t => t.attackType === "N" ? 1 : t.attackType === "T" ? -1 : 0;
  const ownOffense = t => t.defenseType === "S" ? -1 : t.defenseType === "G" ? 1 : 0;
  const guard = t => t.defenseType === "S" ? 2 : t.defenseType === "G" ? -2 : 0;
  const pa = value[a.attackColor] + atk(a) + ownOffense(a) + (a.attackType === "T" && b.defenseType === "G" ? 3 : 0);
  const pb = value[b.attackColor] + atk(b) + ownOffense(b) + (b.attackType === "T" && a.defenseType === "G" ? 3 : 0);
  const da = value[a.defenseColor] + guard(a) + (a.attackType === "N" ? -1 : 0);
  const db = value[b.defenseColor] + guard(b) + (b.attackType === "N" ? -1 : 0);
  function penetrates(attacker, defender, p, d) {
    if (attacker.attackColor === "k" && defender.defenseColor !== "k") return true;
    if (attacker.attackColor !== "k" && defender.defenseColor === "k") return false;
    if (attacker.attackColor !== "k" && defender.defenseColor !== "k" && rank[defender.defenseColor] - rank[attacker.attackColor] >= 2) return false;
    return p > d;
  }
  const ha = penetrates(a, b, pa, db);
  const hb = penetrates(b, a, pb, da);
  let outcome = "DRAW";
  if (ha && !hb) outcome = "A_WIN";
  else if (!ha && hb) outcome = "B_WIN";
  else if (ha && hb && pa !== pb) outcome = pa > pb ? "A_WIN" : "B_WIN";
  const near = (x, y) => x === "k" || y === "k" ? x === "k" && y === "k" : Math.abs(rank[x] - rank[y]) <= 1;
  const close = near(a.attackColor, b.defenseColor) && near(b.attackColor, a.defenseColor);
  let lead = null;
  if (close) {
    if (outcome === "DRAW") lead = 0;
    else if (ha && hb) lead = Math.abs(pa - pb);
    else lead = outcome === "A_WIN" ? pa - db : pb - da;
  }
  return { pressureA: pa, pressureB: pb, defenseA: da, defenseB: db, hitA: ha, hitB: hb, mechanicalOutcome: outcome, close, lead };
}

function assertAgainstReference(a, b, context) {
  const actual = call(a, b);
  const expected = reference(a, b);
  check(actual.ok === true, context + ": valid result");
  for (const key of Object.keys(expected)) same(actual[key], expected[key], context + ": " + key);
  check(Number.isFinite(actual.pressureA) && Number.isFinite(actual.pressureB) &&
    Number.isFinite(actual.defenseA) && Number.isFinite(actual.defenseB), context + ": finite mechanics");
  check(actual.explanation && typeof actual.explanation.code === "string" &&
    typeof actual.explanation.text === "string", context + ": deterministic explanation");
  return actual;
}

// §8 single-case fixtures pin both the mechanics and the exact key numerical fields.
const fixtures = [
  { name: "y/y NS vs NS", a: ["y", "y"], b: ["y", "y"], ta: "NS", tb: "NS", p: [2, 2], d: [3, 3], h: [false, false], out: "DRAW" },
  { name: "y/y NC vs PC", a: ["y", "y"], b: ["y", "y"], ta: "NC", tb: "PC", p: [3, 2], d: [1, 2], h: [true, true], out: "A_WIN" },
  { name: "y/y NC vs NC", a: ["y", "y"], b: ["y", "y"], ta: "NC", tb: "NC", p: [3, 3], d: [1, 1], h: [true, true], out: "DRAW" },
  { name: "y/y NS vs NC", a: ["y", "y"], b: ["y", "y"], ta: "NS", tb: "NC", p: [2, 3], d: [3, 1], h: [true, false], out: "A_WIN" },
  { name: "y/y NS vs NG", a: ["y", "y"], b: ["y", "y"], ta: "NS", tb: "NG", p: [2, 4], d: [3, -1], h: [true, true], out: "B_WIN" },
  { name: "y/y NG vs o/o PC", a: ["y", "y"], b: ["o", "o"], ta: "NG", tb: "PC", p: [4, 3], d: [-1, 3], h: [true, true], out: "A_WIN" },
  { name: "y/y TS vs r/r TG", a: ["y", "y"], b: ["r", "r"], ta: "TS", tb: "TG", p: [3, 4], d: [4, 2], h: [false, false], out: "DRAW" }
];
for (const f of fixtures) {
  const [a, b] = pair(f.a, f.b, f.ta, f.tb);
  const result = assertAgainstReference(a, b, f.name);
  same([result.pressureA, result.pressureB], f.p, f.name + ": pressures");
  same([result.defenseA, result.defenseB], f.d, f.name + ": defenses");
  same([result.hitA, result.hitB], f.h, f.name + ": hits");
  same(result.mechanicalOutcome, f.out, f.name + ": outcome");
}

// Double-hit explanations identify the numerical comparison and its actual result.
for (const scenario of [
  { ta: "NC", tb: "PC", pressure: [3, 2], outcome: "A_WIN", ending: "Победил A." },
  { ta: "NC", tb: "NC", pressure: [3, 3], outcome: "DRAW", ending: "Ничья из-за равного давления." },
  { ta: "PC", tb: "NC", pressure: [2, 3], outcome: "B_WIN", ending: "Победил B." }
]) {
  const [a, b] = pair(["y", "y"], ["y", "y"], scenario.ta, scenario.tb);
  const result = call(a, b);
  const text = result.explanation.text;
  check(result.hitA && result.hitB, scenario.outcome + " explanation has two hits");
  same(result.mechanicalOutcome, scenario.outcome, "double-hit text preserves mechanical outcome");
  same([result.pressureA, result.pressureB], scenario.pressure, "double-hit explanation pressure fixture");
  check(text.includes("Оба удара пробили защиту.") &&
    text.includes("Давление A: " + scenario.pressure[0]) &&
    text.includes("давление B: " + scenario.pressure[1]) && text.endsWith(scenario.ending),
    scenario.outcome + " explanation states comparison and result");
  same(call(a, b).explanation.text, text, scenario.outcome + " explanation is deterministic");
}

// The three complete 9x9 §7 golden matrices are literal fixtures, not generated from the resolver.
const matrixRows = ["NS", "NC", "NG", "PS", "PC", "PG", "TS", "TC", "TG"];
const matrices = [
  { label: "y/y vs y/y", colorsA: ["y", "y"], colorsB: ["y", "y"], rows: [
    "= W L = = W = = W", "L = L = W = = W W", "W W = L W W L = L",
    "= = W = = W = = W", "= L L = = L = = W", "L = L L W = L L L",
    "= = W = = W = = W", "= L = = = W = = W", "L L W L L W L L ="] },
  { label: "y/y vs o/o", colorsA: ["y", "y"], colorsB: ["o", "o"], rows: [
    "= L L = = L = = W", "L L L L L L = L =", "L = L L W = L L L",
    "= = L = = = = = =", "L L L = L L = = L", "L L L L L L L L L",
    "= = L = = W = = W", "L L L = L = = = W", "L L = L L W L L L"] },
  { label: "y/y vs r/r", colorsA: ["y", "y"], colorsB: ["r", "r"], rows: [
    "L L L = L L = = L", "L L L L L L L L L", "L L L L L L L L L",
    "= L L = = L = = =", "L L L L L L = L L", "L L L L L L L L L",
    "= L L = = L = = =", "L L L L L L = L L", "L L L L L L L L L"] }
];
function symbol(outcome) { return outcome === "A_WIN" ? "W" : outcome === "B_WIN" ? "L" : "="; }
for (const matrix of matrices) {
  for (let row = 0; row < matrixRows.length; row++) {
    const expected = matrix.rows[row].split(" ");
    for (let col = 0; col < matrixRows.length; col++) {
      const [a, b] = pair(matrix.colorsA, matrix.colorsB, matrixRows[row], matrixRows[col]);
      const result = assertAgainstReference(a, b, matrix.label + " " + matrixRows[row] + "/" + matrixRows[col]);
      same(symbol(result.mechanicalOutcome), expected[col], matrix.label + " golden cell " + row + "," + col);
    }
  }
}

// All 81 tactical combinations preserve the absolute k/k mafia advantage against r/r.
for (const ta of matrixRows) for (const tb of matrixRows) {
  const [a, b] = pair(["k", "k"], ["r", "r"], ta, tb);
  const result = assertAgainstReference(a, b, "mafia k/k vs r/r " + ta + "/" + tb);
  same(result.mechanicalOutcome, "A_WIN", "k/k wins all tactical pairs");
}

// Invalid snapshots use the supported rules version, proving snapshot validation is reached.
const base = snapshot("y", "y", "NC");
invalidSnapshot(null, "null snapshot", "snapshotA must be an object");
invalidSnapshot([], "array snapshot", "snapshotA must be an object");
function invalidSnapshot(input, label, detail) {
  const result = resolver.resolve(input, base, "tactical_v1");
  check(result.ok === false && result.error === "INVALID_INPUT", label + " returns INVALID_INPUT with supported rules");
  check(typeof result.detail === "string" && result.detail.includes(detail), label + " fails at its own validation");
  return result;
}
const revocable = Proxy.revocable({}, {});
revocable.revoke();
invalidSnapshot(revocable.proxy, "revoked proxy snapshot", "could not be inspected");
for (const [field, bad] of [["attackColor", "z"], ["defenseColor", "z"]]) {
  invalidSnapshot({ ...base, [field]: bad }, "unknown " + field, field + " is unsupported");
}
for (const field of ["attackColor", "defenseColor", "attackType", "defenseType", "role"]) {
  const missing = { ...base };
  delete missing[field];
  invalidSnapshot(missing, "missing " + field, field + " is required");
}
for (const [field, bad] of [["attackType", "X"], ["defenseType", "X"]]) {
  invalidSnapshot({ ...base, [field]: bad }, "unknown " + field, field + " is unsupported");
}
invalidSnapshot({ ...base, role: "" }, "empty role", "role must be a non-empty");
invalidSnapshot({ ...base, attackColor: "k", role: "citizen" }, "black attack non-mafia", "may use black only with role mafia");
invalidSnapshot({ ...base, defenseColor: "k", role: "citizen" }, "black defense non-mafia", "may use black only with role mafia");
check(call(snapshot("k", "y", "NS", "mafia"), base).ok, "mafia role permits a structurally valid black field");

for (const [field, valid] of [["attackColor", "y"], ["defenseColor", "y"], ["attackType", "N"], ["defenseType", "C"]]) {
  const nonStrings = [new String(valid), [], 4, Symbol("enum"), function enumValue() {}, { toString() { throw new Error("must not coerce"); } }];
  for (const bad of nonStrings) {
    invalidSnapshot({ ...base, [field]: bad }, field + " rejects non-string " + typeof bad, field + " must be a string");
  }
}
let changingStringCalls = 0;
const changingToString = { toString() { changingStringCalls++; return changingStringCalls === 1 ? "y" : "r"; } };
invalidSnapshot({ ...base, attackColor: changingToString }, "changing toString object", "attackColor must be a string");
same(changingStringCalls, 0, "changing toString is never called");
let throwingStringCalls = 0;
const throwingToString = { toString() { throwingStringCalls++; throw new Error("toString must not execute"); } };
invalidSnapshot({ ...base, attackColor: throwingToString }, "throwing toString object", "attackColor must be a string");
invalidSnapshot({ ...base, attackType: throwingToString }, "throwing attackType toString object", "attackType must be a string");
same(throwingStringCalls, 0, "throwing toString is never called");

const inheritedColor = Object.create({ attackColor: "y" });
Object.assign(inheritedColor, { defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" });
invalidSnapshot(inheritedColor, "inherited attackColor", "attackColor is required");
let accessorReads = 0;
const accessorSnapshot = { defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" };
Object.defineProperty(accessorSnapshot, "attackColor", { enumerable: true, get() { accessorReads++; return "y"; } });
invalidSnapshot(accessorSnapshot, "accessor-backed attackColor", "attackColor must be a data value");
same(accessorReads, 0, "accessor getter is not executed");

const unknownVersion = resolver.resolve(base, base, "legacy");
check(unknownVersion.ok === false && unknownVersion.error === "INVALID_INPUT" &&
  unknownVersion.detail.includes("rulesVersion"), "unsupported rulesVersion is rejected by version validation");
const missingVersion = resolver.resolve(base, base, undefined);
check(missingVersion.ok === false && missingVersion.error === "INVALID_INPUT" &&
  missingVersion.detail.includes("rulesVersion"), "missing rulesVersion is rejected by version validation");

// A mafia's black attack does not make its ordinary defense immune.
{
  const a = snapshot("k", "y", "NS", "mafia");
  const b = snapshot("r", "r", "NG", "citizen");
  const result = assertAgainstReference(a, b, "mafia black attack with ordinary defense");
  check(result.hitB === true, "ordinary defense can be penetrated against mafia");
  check(result.explanation.hitReasonA === "BLACK_ATTACK_BREAKS_NON_BLACK_GUARD", "black attack is explicitly identified");
}
{
  const a = snapshot("k", "y", "NS", "mafia");
  const b = snapshot("y", "r", "PS", "citizen");
  const result = call(a, b);
  check(result.close === false && result.lead === null, "mixed black/ordinary matchup has no social lead");
}

// Full independent 4^4 * 9^2 enumeration with production role validation enabled.
const counts = { A_WIN: 0, B_WIN: 0, DRAW: 0 };
let symmetryErrors = 0;
let yellowRedHits = 0;
let enumerated = 0;
const distributionCases = new Map();
const distributionKeys = [
  "y/y|y/y", "y/y|o/o", "y/y|r/r", "o/o|r/r", "r/r|k/k", "y/r|r/y"
];
for (const aAttack of colors) for (const aDefense of colors)
for (const bAttack of colors) for (const bDefense of colors)
for (const tacticA of matrixRows) for (const tacticB of matrixRows) {
  const a = snapshot(aAttack, aDefense, tacticA);
  const b = snapshot(bAttack, bDefense, tacticB);
  const label = [aAttack + "/" + aDefense, bAttack + "/" + bDefense, tacticA, tacticB].join(" ");
  const result = assertAgainstReference(a, b, "enumeration " + label);
  counts[result.mechanicalOutcome]++;
  enumerated++;
  const swapped = assertAgainstReference(b, a, "enumeration swap " + label);
  if (result.mechanicalOutcome !== outcomeSwap[swapped.mechanicalOutcome] ||
      result.pressureA !== swapped.pressureB || result.pressureB !== swapped.pressureA ||
      result.defenseA !== swapped.defenseB || result.defenseB !== swapped.defenseA ||
      result.hitA !== swapped.hitB || result.hitB !== swapped.hitA || result.close !== swapped.close || result.lead !== swapped.lead) {
    symmetryErrors++;
  }
  if (aAttack === "y" && bDefense === "r" && result.hitA) yellowRedHits++;
  for (const key of distributionKeys) {
    const [left, right] = key.split("|");
    const actualKey = aAttack + "/" + aDefense + "|" + bAttack + "/" + bDefense;
    if (actualKey === key) {
      const current = distributionCases.get(key) || { A_WIN: 0, B_WIN: 0, DRAW: 0 };
      current[result.mechanicalOutcome]++;
      distributionCases.set(key, current);
    }
  }
}
same(enumerated, 20736, "all assignments enumerated");
same(counts, { A_WIN: 6776, B_WIN: 6776, DRAW: 7184 }, "full enumeration totals");
same(symmetryErrors, 0, "full enumeration A/B symmetry errors");
same(yellowRedHits, 0, "yellow attack never penetrates red defense");
const expectedDistributions = {
  "y/y|y/y": [22, 22, 37], "y/y|o/o": [6, 44, 31], "y/y|r/r": [0, 64, 17],
  "o/o|r/r": [6, 44, 31], "r/r|k/k": [0, 81, 0], "y/r|r/y": [12, 37, 32]
};
for (const key of distributionKeys) {
  const got = distributionCases.get(key);
  same([got.A_WIN, got.B_WIN, got.DRAW], expectedDistributions[key], key + " complete distribution");
}

// Determinism, call-order independence, frozen inputs, and immutability.
{
  const a = Object.freeze(snapshot("y", "r", "TS"));
  const b = Object.freeze(snapshot("r", "y", "TG"));
  const beforeA = JSON.stringify(a), beforeB = JSON.stringify(b);
  const first = call(a, b);
  const unrelated = call(snapshot("o", "o", "PG"), snapshot("y", "y", "NC"));
  const afterOtherCall = call(a, b);
  const repeated = call(a, b);
  same(afterOtherCall, first, "result does not depend on intervening call order");
  same(repeated, first, "identical inputs return structurally identical output");
  same(JSON.stringify(a), beforeA, "snapshot A remains unchanged");
  same(JSON.stringify(b), beforeB, "snapshot B remains unchanged");
  check(unrelated.ok, "unrelated call succeeds");
}

// A standalone VM load has no DOM/storage/game-state/network/timer/RNG dependency.
{
  const source = moduleSource;
  const sandbox = { module: { exports: {} } };
  sandbox.globalThis = sandbox;
  Object.defineProperty(sandbox, "document", { get() { throw new Error("DOM accessed"); } });
  Object.defineProperty(sandbox, "localStorage", { get() { throw new Error("storage accessed"); } });
  Object.defineProperty(sandbox, "fetch", { get() { throw new Error("network accessed"); } });
  Object.defineProperty(sandbox, "setTimeout", { get() { throw new Error("timer accessed"); } });
  vm.createContext(sandbox);
  vm.runInContext("Date.now = function(){ throw new Error('clock accessed'); }; Math.random = function(){ throw new Error('random accessed'); };", sandbox);
  vm.runInContext(source, sandbox, { filename: "tactical-resolver.js" });
  check(typeof sandbox.Game.TacticalCombatV1.resolve === "function", "VM exposes Game.TacticalCombatV1.resolve");
  const isolated = sandbox.Game.TacticalCombatV1.resolve(snapshot("y", "y", "NS"), snapshot("y", "y", "NS"), "tactical_v1");
  check(isolated.ok && isolated.mechanicalOutcome === "DRAW", "standalone VM resolves without game runtime");
  check(!Object.prototype.hasOwnProperty.call(isolated, "socialOutcome") &&
    !Object.prototype.hasOwnProperty.call(isolated, "recognizedOutcome"), "resolver has no voting outcomes");
}

console.log("PASS tactical_v1: " + checks + " assertions; full enumeration " + enumerated +
  " (A_WIN 6776 / B_WIN 6776 / DRAW 7184); symmetry errors " + symmetryErrors + ".");
