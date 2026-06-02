// system.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;

  const REQUIRED_SYSTEM_COPY_GROUPS = Object.freeze(["errors", "warnings", "notifications", "systemEvents"]);
  const SYSTEM_COPY_KIND_ALIASES = Object.freeze({
    error: "errors",
    errors: "errors",
    warning: "warnings",
    warnings: "warnings",
    notification: "notifications",
    notifications: "notifications",
    event: "systemEvents",
    events: "systemEvents",
    systemEvent: "systemEvents",
    systemEvents: "systemEvents",
    "system event": "systemEvents",
    "system events": "systemEvents",
    system_event: "systemEvents",
    system_events: "systemEvents",
  });

  const SystemCopy = Object.freeze({
    errors: Object.freeze({
      missingMessage: "Message unavailable.",
    }),
    warnings: Object.freeze({
      checkInput: "Check the input and try again.",
    }),
    notifications: Object.freeze({
      saved: "Saved.",
    }),
    systemEvents: Object.freeze({
      ready: "System ready.",
    }),
  });

  const FALLBACK_MESSAGE = SystemCopy.errors.missingMessage;

  function normalizeKind(kind){
    const key = String(kind || "").trim();
    return SYSTEM_COPY_KIND_ALIASES[key] || SYSTEM_COPY_KIND_ALIASES[key.toLowerCase()] || "";
  }

  function safeValue(value){
    if (value === undefined || value === null) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    try {
      const json = JSON.stringify(value);
      return json && json !== "{}" ? json : "";
    } catch (_) {
      return "";
    }
  }

  function renderTemplate(template, ctx){
    const source = String(template || "");
    const data = (ctx && typeof ctx === "object") ? ctx : {};
    return source.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => safeValue(data[key])).replace(/\s+/g, " ").trim();
  }

  function say(kind, code, ctx){
    const group = normalizeKind(kind);
    const bucket = group && SystemCopy[group] && typeof SystemCopy[group] === "object" ? SystemCopy[group] : null;
    const key = String(code || "").trim();
    const template = bucket && Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : FALLBACK_MESSAGE;
    const rendered = renderTemplate(template, ctx);
    return rendered || FALLBACK_MESSAGE;
  }

  Game.SystemCopy = SystemCopy;
  Game.System = Object.freeze({
    say,
    requiredGroups: REQUIRED_SYSTEM_COPY_GROUPS,
    normalizeKind,
  });

  if (!Game.__DEV || typeof Game.__DEV !== "object") Game.__DEV = {};

  Game.__DEV.smokeSystemCopyContractOnce = function smokeSystemCopyContractOnce(){
    const requiredGroups = Array.from(REQUIRED_SYSTEM_COPY_GROUPS);
    const bannedToneWords = Object.freeze([
      "moral", "immoral", "shame", "guilt", "right thing", "wrong thing",
      "must", "should", "hurry", "urgent", "now now", "pressure",
      "cute", "cutesy", "silly", "lol", "lmao", "vibe", "awesome"
    ]);
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      if (!list.includes(value)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const hasBadToken = (text) => /undefined|null|\[object Object\]/.test(String(text || ""));
    const textHasBannedTone = (text) => {
      const lower = String(text || "").toLowerCase();
      return bannedToneWords.filter((word) => lower.includes(word));
    };

    if (!Game.SystemCopy || typeof Game.SystemCopy !== "object") {
      fail("system_copy_exists", "Game.SystemCopy is missing");
    }
    if (!Game.System || typeof Game.System.say !== "function") {
      fail("system_say_exists", "Game.System.say is missing");
    }

    requiredGroups.forEach((group) => {
      const bucket = Game.SystemCopy && Game.SystemCopy[group];
      if (!bucket || typeof bucket !== "object") {
        addUnique(result.missingCoverage, group);
        fail("required_groups_exist", group);
        return;
      }
      const codes = Object.keys(bucket).filter((key) => String(key || "").trim());
      if (!codes.length) {
        addUnique(result.missingCoverage, group);
        fail("required_groups_have_codes", group);
        return;
      }
      const code = codes[0];
      let text = "";
      try {
        text = Game.System.say(group, code, { actor: "tester", payload: { nested: true } });
      } catch (error) {
        fail("system_say_no_crash", { group, code, error: String(error && error.message ? error.message : error) });
        return;
      }
      if (typeof text !== "string" || !text.trim()) fail("system_say_non_empty", { group, code, text });
      if (hasBadToken(text)) fail("no_bad_generated_tokens", { group, code, text });
      const banned = textHasBannedTone(text);
      if (banned.length) {
        result.forbiddenRemaining.push({ group, code, text, banned });
        addUnique(result.failedChecks, "no_banned_tone_words");
      }
    });

    try {
      const missingKind = Game.System && typeof Game.System.say === "function" ? Game.System.say("missingKind", "missingCode") : "";
      const missingCode = Game.System && typeof Game.System.say === "function" ? Game.System.say("errors", "missingCode") : "";
      [missingKind, missingCode].forEach((text, index) => {
        if (typeof text !== "string" || !text.trim()) fail("missing_kind_code_fallback", { index, text });
        if (hasBadToken(text)) fail("no_bad_fallback_tokens", { index, text });
        const banned = textHasBannedTone(text);
        if (banned.length) {
          result.forbiddenRemaining.push({ group: "fallback", code: index === 0 ? "missingKind" : "missingCode", text, banned });
          addUnique(result.failedChecks, "no_banned_tone_words");
        }
      });
    } catch (error) {
      fail("missing_kind_code_fallback", String(error && error.message ? error.message : error));
    }

    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };
})();
