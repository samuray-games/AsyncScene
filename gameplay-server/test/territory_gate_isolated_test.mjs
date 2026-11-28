import assert from "node:assert/strict";
import test from "node:test";
import { checkDuel, checkTransition, POLICY_VERSION, TERRITORIES } from "../src/territory-gate.mjs";

const player = (id, rank, territoryId, activeBattle = false) => ({
  id, rank, territoryId, activeBattle, role: rank === "k" ? "mafia" : "citizen"
});
const consent = { attackerAccepted: true, defenderAccepted: true, weakerConfirmed: true };
const duel = (zone, a, b, extra = consent) => checkDuel({
  territoryId: zone,
  attacker: player("a", a, zone),
  defender: player("b", b, zone),
  consent: extra,
});
const pairs = ["yy", "yo", "yr", "yk", "oo", "or", "ok", "rr", "rk", "kk"];
const expected = {
  pond: ["yy"],
  yard: ["yy", "yo", "oo"],
  district: ["oo", "or", "rr"],
  center: ["rr", "kk"],
};

test("full 4-zone x 10-matchup matrix, independent of challenger order", () => {
  for (const [zone, permitted] of Object.entries(expected)) {
    for (const pair of pairs) {
      for (const ranks of [pair, pair.split("").reverse().join("")]) {
        const result = duel(zone, ranks[0], ranks[1]);
        assert.equal(result.ok, permitted.includes(pair), zone + "/" + ranks + ": " + result.code);
        assert.equal(result.policyVersion, POLICY_VERSION);
      }
    }
  }
});

test("nothing starts without both players consenting, including equal ranks", () => {
  for (const invalidConsent of [null, {}, { attackerAccepted: true }, {
    attackerAccepted: true, defenderAccepted: false, weakerConfirmed: true
  }]) {
    assert.equal(duel("pond", "y", "y", invalidConsent).code, "DUEL_CONSENT_REQUIRED");
  }
  assert.equal(duel("yard", "y", "o", { attackerAccepted: true, defenderAccepted: true })
    .code, "WEAKER_CONFIRMATION_REQUIRED");
  assert.equal(duel("yard", "o", "y", { attackerAccepted: true, defenderAccepted: true })
    .code, "WEAKER_CONFIRMATION_REQUIRED");
});

test("only Mafia can hold black rank; Mafia cannot duel ordinary citizens", () => {
  const forged = player("a", "k", "center");
  forged.role = "citizen";
  assert.equal(checkDuel({ territoryId: "center", attacker: forged,
    defender: player("b", "k", "center"), consent }).code, "INVALID_TRUSTED_FACTS");
  const disguised = player("a", "r", "center");
  disguised.role = "mafia";
  assert.equal(checkDuel({ territoryId: "center", attacker: disguised,
    defender: player("b", "r", "center"), consent }).code, "INVALID_TRUSTED_FACTS");
  assert.equal(duel("center", "r", "k").code, "MAFIA_MATCH_RESTRICTED");
});

test("deny invalid places, self challenge, rank gap, and active battle", () => {
  assert.equal(duel("missing", "y", "y").code, "UNKNOWN_TERRITORY");
  assert.equal(checkDuel({ territoryId: "pond", attacker: player("a", "y", "pond"),
    defender: player("b", "y", "yard"), consent }).code, "DIFFERENT_TERRITORIES");
  assert.equal(checkDuel({ territoryId: "pond", attacker: player("a", "y", "pond"),
    defender: player("a", "y", "pond"), consent }).code, "SELF_DUEL");
  assert.equal(checkDuel({ territoryId: "pond", attacker: player("a", "y", "pond", true),
    defender: player("b", "y", "pond"), consent }).code, "ACTIVE_BATTLE");
  assert.equal(checkDuel({ territoryId: "pond", attacker: player("a", "y", "pond"),
    defender: player("b", "y", "pond", true), consent }).code, "ACTIVE_BATTLE");
  assert.equal(duel("pond", "y", "r").code, "RANK_GAP_RESTRICTED");
  assert.equal(duel("pond", "y", "o").code, "TERRITORY_RESTRICTED");
});

test("every rank may visit all areas, but not during an active battle", () => {
  for (const rank of ["y", "o", "r", "k"]) {
    for (const from of Object.keys(TERRITORIES)) {
      for (const to of Object.keys(TERRITORIES)) {
        assert.equal(checkTransition({ player: player("a", rank, from), destinationId: to }).ok,
          true, rank + "/" + from + " -> " + to);
      }
    }
  }
  assert.equal(checkTransition({ player: player("a", "r", "district", true),
    destinationId: "center" }).code, "ACTIVE_BATTLE");
  assert.equal(checkTransition({ player: player("a", "y", "unknown"),
    destinationId: "pond" }).code, "UNKNOWN_TERRITORY");
  assert.equal(checkTransition({ player: player("a", "y", "pond"),
    destinationId: "unknown" }).code, "UNKNOWN_TERRITORY");
});

test("missing or invalid server facts fail closed", () => {
  assert.equal(checkDuel().ok, false);
  assert.equal(checkTransition().ok, false);
  assert.equal(checkDuel({ territoryId: "pond", attacker: { id: "a", rank: "y" },
    defender: player("b", "y", "pond"), consent }).code, "INVALID_TRUSTED_FACTS");
  assert.equal(checkDuel({ territoryId: "pond", attacker: player("a", "y", "pond"),
    defender: { ...player("b", "y", "pond"), activeBattle: null }, consent }).ok, false);
  assert.equal(duel("center", "k", "k").ok, true);
});
