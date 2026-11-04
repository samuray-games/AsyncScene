// Chat09A: isolated deterministic territory admission rules; not wired to runtime.
// All actors, roles, ranks, territories and consent MUST be verified by the
// future server adapter. This module does NOT authenticate, lock, or persist.
export const POLICY_VERSION = "chat09a_territories_v1";

export const TERRITORIES = Object.freeze({
  pond: Object.freeze({ name: "Лягушатник", duels: Object.freeze(["yy"]) }),
  yard: Object.freeze({ name: "Двор", duels: Object.freeze(["yy", "oo", "yo"]) }),
  district: Object.freeze({ name: "Район", duels: Object.freeze(["oo", "rr", "or"]) }),
  center: Object.freeze({ name: "Центр", duels: Object.freeze(["rr", "kk"]) }),
});

const ORDINARY_RANKS = Object.freeze(["y", "o", "r"]);
const ALL_RANKS = Object.freeze(["y", "o", "r", "k"]);
const RANK_ORDER = Object.freeze({ y: 0, o: 1, r: 2, k: 3 });
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const denied = code => ({ ok: false, code, policyVersion: POLICY_VERSION });
const allowed = () => ({ ok: true, code: "ALLOWED", policyVersion: POLICY_VERSION });

function validPlayer(player) {
  if (!record(player)) return false;
  for (const key of ["id", "rank", "role", "territoryId", "activeBattle"]) {
    if (!own(player, key)) return false;
  }
  if (typeof player.id !== "string" || !player.id.trim() || player.id.length > 128 ||
      typeof player.role !== "string" || !player.role.trim() || player.role.length > 128 ||
      typeof player.territoryId !== "string" || player.activeBattle !== true && player.activeBattle !== false ||
      !ALL_RANKS.includes(player.rank)) return false;
  // Black is confirmed Mafia membership, NOT a normal influence unlock.
  return (player.rank === "k") === (player.role === "mafia");
}

function validTerritory(id) {
  return typeof id === "string" && own(TERRITORIES, id);
}

/**
 * A pure eligibility decision. The server must verify the facts and reserve
 * the duel atomically after ALLOWED. UI flags are never authoritative.
 * Rank is the server-verified player tier, not selected attack/defense color.
 */
export function checkDuel({ territoryId, attacker, defender, consent } = {}) {
  if (!validTerritory(territoryId)) return denied("UNKNOWN_TERRITORY");
  if (!validPlayer(attacker) || !validPlayer(defender)) return denied("INVALID_TRUSTED_FACTS");
  if (attacker.id === defender.id) return denied("SELF_DUEL");
  if (attacker.territoryId !== territoryId || defender.territoryId !== territoryId) {
    return denied("DIFFERENT_TERRITORIES");
  }
  if (attacker.activeBattle || defender.activeBattle) return denied("ACTIVE_BATTLE");

  // The collective Mafia game is a separate mode. Until Chat01 receives a
  // targeted amendment, ordinary-vs-Mafia duels are unavailable here.
  const a = attacker.rank, b = defender.rank;
  if ((a === "k") !== (b === "k")) return denied("MAFIA_MATCH_RESTRICTED");
  if (a !== "k" && !ORDINARY_RANKS.includes(a)) return denied("INVALID_TRUSTED_FACTS");
  const gap = a === "k" ? 0 : Math.abs(RANK_ORDER[a] - RANK_ORDER[b]);
  if (gap > 1) return denied("RANK_GAP_RESTRICTED");
  const pair = RANK_ORDER[a] <= RANK_ORDER[b] ? a + b : b + a;
  if (!TERRITORIES[territoryId].duels.includes(pair)) return denied("TERRITORY_RESTRICTED");

  // Both participants must accept; weaker player must separately acknowledge
  // an unequal-rank challenge, in either challenger order.
  if (!record(consent) || consent.attackerAccepted !== true || consent.defenderAccepted !== true) {
    return denied("DUEL_CONSENT_REQUIRED");
  }
  if (gap === 1 && consent.weakerConfirmed !== true) {
    return denied("WEAKER_CONFIRMATION_REQUIRED");
  }
  return allowed();
}

/** Admission only. Does not mutate or persist the server-owned location. */
export function checkTransition({ player, destinationId } = {}) {
  if (!validPlayer(player)) return denied("INVALID_TRUSTED_FACTS");
  if (!validTerritory(player.territoryId) || !validTerritory(destinationId)) {
    return denied("UNKNOWN_TERRITORY");
  }
  if (player.activeBattle) return denied("ACTIVE_BATTLE");
  // All ranks may visit all areas; only fight eligibility varies by area.
  return allowed();
}
