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

// Structural validation fails closed; no default tactics, colors, roles or legacy rules are supplied.
const base = snapshot("y", "y", "NC");
const invalids = [
  [null, base, "snapshot null"], [[], base, "snapshot array"],
  [{ ...base, attackColor: undefined }, base, "missing-like attack color"],
  [Object.fromEntries(Object.entries(base).filter(([key]) => key !== "defenseColor")), base, "missing defense color"],
  [{ ...base, attackColor: "z" }, base, "unknown color"], [{ ...base, defenseColor: "k", role: "citizen" }, base, "black defense non-mafia"],
  [{ ...base, attackColor: "k", role: "citizen" }, base, "black attack non-mafia"],
  [{ ...base, attackType: "X" }, base, "unknown attack tactic"], [{ ...base, defenseType: "X" }, base, "unknown defense tactic"],
  [{ ...base, role: "" }, base, "empty role"], [base, { ...base, attackColor: "k", role: "Citizen" }, "role matching is exact"],
  [base, base, "unknown rules version", "legacy"], [base, base, "missing rules version", undefined]
];
for (const [a, b, label, version] of invalids) {
  const result = resolver.resolve(a, b, version === undefined ? version : version === "legacy" ? "legacy" : "tactical_v1");
  check(result.ok === false && result.error === "INVALID_INPUT", label + " rejected explicitly");
}
const inheritedColor = Object.create({ attackColor: "y" });
Object.assign(inheritedColor, { defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" });
check(!call(inheritedColor, base).ok, "inherited required field is rejected");
let accessorReads = 0;
const accessorSnapshot = { defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" };
Object.defineProperty(accessorSnapshot, "attackColor", { enumerable: true, get() { accessorReads++; return "y"; } });
check(!call(accessorSnapshot, base).ok && accessorReads === 0, "accessor-backed input is rejected without executing the getter");

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
