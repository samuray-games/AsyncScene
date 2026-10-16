// Isolated tactical_v1 math. This module is intentionally not wired into runtime.
// Snapshot role provenance belongs to a future trusted adapter; this module validates shape only.
(function (root) {
  "use strict";

  const RULES_VERSION = "tactical_v1";
  const COLOR_VALUE = Object.freeze({ y: 2, o: 3, r: 4, k: 5 });
  const COLOR_RANK = Object.freeze({ y: 0, o: 1, r: 2 });
  const ATTACK_TYPES = Object.freeze({ N: true, P: true, T: true });
  const DEFENSE_TYPES = Object.freeze({ S: true, C: true, G: true });
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  function invalid(detail) {
    return { ok: false, error: "INVALID_INPUT", detail };
  }

  function validateSnapshot(snapshot, name) {
    if (!snapshot || typeof snapshot !== "object") return { error: name + " must be an object" };
    try {
      if (Array.isArray(snapshot)) return { error: name + " must be an object" };
    } catch (_) {
      return { error: name + " could not be inspected" };
    }
    const required = ["attackColor", "defenseColor", "attackType", "defenseType", "role"];
    const normalized = {};
    try {
      for (const key of required) {
        if (!hasOwn(snapshot, key)) return { error: name + "." + key + " is required" };
        const descriptor = Object.getOwnPropertyDescriptor(snapshot, key);
        if (!descriptor || !hasOwn(descriptor, "value")) {
          return { error: name + "." + key + " must be a data value" };
        }
        normalized[key] = descriptor.value;
      }
    } catch (_) {
      return { error: name + " could not be inspected" };
    }
    for (const key of ["attackColor", "defenseColor", "attackType", "defenseType"]) {
      if (typeof normalized[key] !== "string") return { error: name + "." + key + " must be a string" };
    }
    if (!hasOwn(COLOR_VALUE, normalized.attackColor)) return { error: name + ".attackColor is unsupported" };
    if (!hasOwn(COLOR_VALUE, normalized.defenseColor)) return { error: name + ".defenseColor is unsupported" };
    if (!hasOwn(ATTACK_TYPES, normalized.attackType)) return { error: name + ".attackType is unsupported" };
    if (!hasOwn(DEFENSE_TYPES, normalized.defenseType)) return { error: name + ".defenseType is unsupported" };
    if (typeof normalized.role !== "string" || normalized.role.length === 0 || normalized.role.trim() !== normalized.role) {
      return { error: name + ".role must be a non-empty role identifier" };
    }
    if (normalized.role !== "mafia" && (normalized.attackColor === "k" || normalized.defenseColor === "k")) {
      return { error: name + " may use black only with role mafia" };
    }
    return { snapshot: normalized };
  }

  function attackModifier(type) {
    return type === "N" ? 1 : type === "T" ? -1 : 0;
  }

  function offenseModifier(defenseType) {
    return defenseType === "S" ? -1 : defenseType === "G" ? 1 : 0;
  }

  function guardModifier(defenseType) {
    return defenseType === "S" ? 2 : defenseType === "G" ? -2 : 0;
  }

  function pressure(snapshot, opponent) {
    return COLOR_VALUE[snapshot.attackColor] + attackModifier(snapshot.attackType) +
      offenseModifier(snapshot.defenseType) +
      (snapshot.attackType === "T" && opponent.defenseType === "G" ? 3 : 0);
  }

  function defense(snapshot) {
    return COLOR_VALUE[snapshot.defenseColor] + guardModifier(snapshot.defenseType) +
      (snapshot.attackType === "N" ? -1 : 0);
  }

  function hit(attacker, defender, attackPressure, defenseValue) {
    if (attacker.attackColor === "k" && defender.defenseColor !== "k") {
      return { hit: true, reason: "BLACK_ATTACK_BREAKS_NON_BLACK_GUARD" };
    }
    if (attacker.attackColor !== "k" && defender.defenseColor === "k") {
      return { hit: false, reason: "BLACK_GUARD_STOPS_NON_BLACK_ATTACK" };
    }
    if (attacker.attackColor !== "k" && defender.defenseColor !== "k" &&
        COLOR_RANK[defender.defenseColor] - COLOR_RANK[attacker.attackColor] >= 2) {
      return { hit: false, reason: "COLOR_GAP_STOPS_ATTACK" };
    }
    if (attackPressure > defenseValue) {
      return { hit: true, reason: "PRESSURE_EXCEEDS_DEFENSE" };
    }
    return { hit: false, reason: "DEFENSE_HOLDS" };
  }

  function closeMatchup(attackColor, defenseColor) {
    if (attackColor === "k" || defenseColor === "k") {
      return attackColor === "k" && defenseColor === "k";
    }
    return Math.abs(COLOR_RANK[attackColor] - COLOR_RANK[defenseColor]) <= 1;
  }

  function outcomeExplanation(hitA, hitB, whyA, whyB, pressureA, pressureB, mechanicalOutcome) {
    const reason = (label, why) => label + " " + (
      why === "BLACK_ATTACK_BREAKS_NON_BLACK_GUARD" ? "пробил по специальному правилу чёрной атаки" :
      why === "BLACK_GUARD_STOPS_NON_BLACK_ATTACK" ? "остановлен специальным правилом чёрной защиты" :
      why === "COLOR_GAP_STOPS_ATTACK" ? "остановлен разницей цветов" :
      why === "PRESSURE_EXCEEDS_DEFENSE" ? "пробил защиту давлением" : "не пробил: защита удержала равное или большее значение"
    );
    let code;
    let text;
    if (hitA && !hitB) {
      code = "A_ONLY_HIT";
      text = reason("A", whyA) + "; " + reason("B", whyB) + ". Победа A.";
    } else if (!hitA && hitB) {
      code = "B_ONLY_HIT";
      text = reason("A", whyA) + "; " + reason("B", whyB) + ". Победа B.";
    } else if (hitA && hitB) {
      code = "BOTH_HIT";
      if (mechanicalOutcome === "DRAW") {
        text = "Оба удара пробили защиту. Давление A: " + pressureA + ", давление B: " + pressureB + ". Ничья из-за равного давления.";
      } else {
        const winner = mechanicalOutcome === "A_WIN" ? "A" : "B";
        text = "Оба удара пробили защиту. Давление A: " + pressureA + ", давление B: " + pressureB + ". Победил " + winner + ".";
      }
    } else {
      code = "BOTH_DEFENSES_HELD";
      text = reason("A", whyA) + "; " + reason("B", whyB) + ". Обе защиты удержали удар.";
    }
    return { code, text, hitReasonA: whyA, hitReasonB: whyB };
  }

  function resolve(snapshotA, snapshotB, rulesVersion) {
    if (rulesVersion !== RULES_VERSION) return invalid("rulesVersion must be tactical_v1");
    const checkedA = validateSnapshot(snapshotA, "snapshotA");
    if (checkedA.error) return invalid(checkedA.error);
    const checkedB = validateSnapshot(snapshotB, "snapshotB");
    if (checkedB.error) return invalid(checkedB.error);
    const inputA = checkedA.snapshot;
    const inputB = checkedB.snapshot;

    const pressureA = pressure(inputA, inputB);
    const pressureB = pressure(inputB, inputA);
    const defenseA = defense(inputA);
    const defenseB = defense(inputB);
    if (![pressureA, pressureB, defenseA, defenseB].every(Number.isFinite)) {
      return invalid("calculated mechanics must be finite numbers");
    }
    const resultA = hit(inputA, inputB, pressureA, defenseB);
    const resultB = hit(inputB, inputA, pressureB, defenseA);
    let mechanicalOutcome = "DRAW";
    if (resultA.hit && !resultB.hit) mechanicalOutcome = "A_WIN";
    else if (!resultA.hit && resultB.hit) mechanicalOutcome = "B_WIN";
    else if (resultA.hit && resultB.hit) {
      if (pressureA > pressureB) mechanicalOutcome = "A_WIN";
      else if (pressureB > pressureA) mechanicalOutcome = "B_WIN";
    }

    const close = closeMatchup(inputA.attackColor, inputB.defenseColor) &&
      closeMatchup(inputB.attackColor, inputA.defenseColor);
    let lead = null;
    if (close) {
      if (mechanicalOutcome === "DRAW") lead = 0;
      else if (resultA.hit && resultB.hit) lead = Math.abs(pressureA - pressureB);
      else if (mechanicalOutcome === "A_WIN") lead = pressureA - defenseB;
      else lead = pressureB - defenseA;
    }

    return {
      ok: true,
      rulesVersion: RULES_VERSION,
      pressureA,
      pressureB,
      defenseA,
      defenseB,
      hitA: resultA.hit,
      hitB: resultB.hit,
      mechanicalOutcome,
      close,
      lead,
      explanation: outcomeExplanation(resultA.hit, resultB.hit, resultA.reason, resultB.reason,
        pressureA, pressureB, mechanicalOutcome)
    };
  }

  const api = Object.freeze({ resolve });
  if (typeof module === "object" && module && module.exports) module.exports = api;
  if (root) {
    root.Game = root.Game || {};
    root.Game.TacticalCombatV1 = api;
  }
})(typeof globalThis === "object" ? globalThis : this);
