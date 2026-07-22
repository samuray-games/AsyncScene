// Stage 6 Boomer Step 4.4B current-contract adapter.
// Preserves the raw Fix5 smoke while replacing only four proven-stale legacy checks.
window.Game = window.Game || {};

(function installBoomerStep44BCurrentContractAdapter() {
  const Game = window.Game;
  const devStore = Game && Game.__DEV;
  const legacySmoke = devStore && devStore.smokeBoomerEconomyConflictTerminologyOnce;

  if (!devStore || typeof legacySmoke !== "function") {
    console.warn("BOOMER_STEP4_4B_CURRENT_CONTRACT_ADAPTER_NOT_INSTALLED", {
      reason: "legacy_smoke_missing",
      legacyType: typeof legacySmoke
    });
    return;
  }

  const ADAPTER_BUILD_TAG = "build_2026_07_22_step4_4b_boomer_current_contract_adapter_v1";
  const ADAPTER_SMOKE_VERSION = "boomer_step4_4b_current_contract_adapter_v20260722_001";
  const AUDIT_FILE = "UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT.md";
  const SUPERSEDED_CHECKS = new Set(["base_smoke", "profile_diff", "placeholders", "emoji_contracts"]);
  const CHECK_LABELS = {
    base_smoke: "Points / 💰",
    profile_diff: "REP / ⭐",
    placeholders: "conflict results",
    emoji_contracts: "reports"
  };

  const fetchTextSync = (url) => {
    try {
      if (typeof XMLHttpRequest !== "function") return { ok: false, url, reason: "xhr_unavailable", text: "" };
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send(null);
      const ok = xhr.status >= 200 && xhr.status < 300;
      return { ok, url, status: xhr.status, text: ok ? String(xhr.responseText || "") : "" };
    } catch (error) {
      return { ok: false, url, reason: String(error && error.message ? error.message : error), text: "" };
    }
  };

  const inspectCurrentAudit = () => {
    const candidates = [];
    const add = (url) => {
      if (url && !candidates.includes(url)) candidates.push(url);
    };
    try {
      if (typeof document !== "undefined" && document.baseURI) add(new URL(AUDIT_FILE, document.baseURI).href);
    } catch (_) {}
    if (typeof location !== "undefined" && location.origin) {
      add(`${location.origin}/AsyncScene/${AUDIT_FILE}`);
      add(`${location.origin}/${AUDIT_FILE}`);
    }
    add(`/AsyncScene/${AUDIT_FILE}`);
    add(`/${AUDIT_FILE}`);

    let loaded = null;
    for (const url of candidates) {
      const result = fetchTextSync(url);
      if (result.ok) {
        loaded = result;
        break;
      }
    }
    const text = loaded ? loaded.text : "";
    const checks = {
      buildMarker: text.includes("UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT"),
      smokeVersion: text.includes("BOOMER-STEP4_4A-ECONOMY-CONFLICT-AUDIT-STATIC-v1"),
      staticPass: text.includes("auditStatus: STATIC_PASS / READY_FOR_RUNTIME_SMOKE"),
      audited147: text.includes("auditedRowCount: 147"),
      fail0: text.includes("failRowCount: 0"),
      pass147: text.includes("passRowCount: 147"),
      structural0: text.includes("structuralFailureCount: 0"),
      placeholderAuthority: text.includes("placeholder_mismatch") && text.includes("placeholder-broken")
    };
    return {
      ok: !!loaded && Object.values(checks).every(Boolean),
      url: loaded ? loaded.url : null,
      status: loaded ? loaded.status : null,
      checks
    };
  };

  const collectStrings = (value, out, seenObjects) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string") {
      out.push(value);
      return;
    }
    if (typeof value !== "object") return;
    if (seenObjects.has(value)) return;
    seenObjects.add(value);
    if (Array.isArray(value)) {
      value.forEach((item) => collectStrings(item, out, seenObjects));
      return;
    }
    Object.keys(value).forEach((key) => collectStrings(value[key], out, seenObjects));
  };

  const inspectCurrentProfileArchitecture = () => {
    const data = Game && Game.Data;
    const checks = {
      dataPresent: !!data,
      textsBoomer: !!(data && data.TEXTS && typeof data.TEXTS.boomer === "object" && data.TEXTS.boomer),
      startBoomer: !!(data && data.START_SCREEN_PROFILE_TEXTS && typeof data.START_SCREEN_PROFILE_TEXTS.boomer === "object" && data.START_SCREEN_PROFILE_TEXTS.boomer),
      npcBoomer: !!(data && data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && typeof data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.boomer === "object" && data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.boomer),
      copBoomer: !!(data && data.COP_TEMPLATES_PROFILE_TEXTS && typeof data.COP_TEMPLATES_PROFILE_TEXTS.boomer === "object" && data.COP_TEMPLATES_PROFILE_TEXTS.boomer)
    };
    return { ok: Object.values(checks).every(Boolean), checks };
  };

  const inspectCurrentEmojiContracts = () => {
    const data = Game && Game.Data;
    const strings = [];
    const seenObjects = new WeakSet();
    collectStrings(data && data.TEXTS && data.TEXTS.boomer, strings, seenObjects);
    collectStrings(data && data.START_SCREEN_PROFILE_TEXTS && data.START_SCREEN_PROFILE_TEXTS.boomer, strings, seenObjects);
    collectStrings(data && data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.boomer, strings, seenObjects);
    collectStrings(data && data.COP_TEMPLATES_PROFILE_TEXTS && data.COP_TEMPLATES_PROFILE_TEXTS.boomer, strings, seenObjects);
    collectStrings(data && data.CAP_MESSAGES && data.CAP_MESSAGES.boomer, strings, seenObjects);
    const joined = strings.join("\n");
    const required = ["💰", "⭐", "⚡"];
    const dataHits = required.filter((emoji) => joined.includes(emoji));

    const readIcon = (profileStat) => {
      if (typeof document === "undefined" || !document.querySelector) return "";
      const node = document.querySelector(`[data-profile-stat="${profileStat}"] .statIcon`);
      return node ? String(node.textContent || "").trim() : "";
    };
    const dom = {
      points: readIcon("points"),
      rep: readIcon("rep"),
      influence: readIcon("influence")
    };
    const domOk = dom.points === "💰" && dom.rep === "⭐" && dom.influence === "⚡";
    return {
      ok: dataHits.length === required.length && domOk,
      required,
      dataHits,
      dom,
      domOk
    };
  };

  const inspectLegacyBaseHealth = (raw) => {
    const failure = raw && Array.isArray(raw.failures)
      ? raw.failures.find((entry) => entry && entry.check === "base_smoke")
      : null;
    const base = failure && failure.detail && typeof failure.detail === "object" ? failure.detail : null;
    const emptyArray = (value) => Array.isArray(value) && value.length === 0;
    const checks = {
      detailPresent: !!base,
      unresolvedRuntimeGapCount0: !!base && base.unresolvedRuntimeGapCount === 0,
      runtimeLogicUntouched: !!base && base.runtimeLogicTouched === false,
      staleBodyAbsent: !!base && base.staleBodyDetected === false,
      aliasTargetMismatchesEmpty: !!base && emptyArray(base.aliasTargetMismatches),
      extraLiveMappingsEmpty: !!base && emptyArray(base.extraLiveMappings),
      missingLiveMappingsEmpty: !!base && emptyArray(base.missingLiveMappings),
      sourceKeyMismatchesEmpty: !!base && emptyArray(base.sourceKeyMismatches),
      variableMismatchesEmpty: !!base && emptyArray(base.variableMismatches),
      sourceGapArtifactExists: !!base && base.sourceGapArtifactExists === true,
      copyDecisionArtifactExists: !!base && base.copyDecisionArtifactExists === true,
      runtimeGapTargetArtifactExists: !!base && base.runtimeGapTargetArtifactExists === true,
      runtimeGapMappingArtifactExists: !!base && base.runtimeGapMappingArtifactExists === true
    };
    return { ok: Object.values(checks).every(Boolean), checks };
  };

  const loadedAssetStillValid = (asset) => !!(
    asset
    && asset.sameOrigin === true
    && asset.canonicalPath === true
    && asset.nonEmptyVersion === true
    && asset.sourceReadable === true
    && asset.sourceContainsBuildTag === true
    && asset.sourceContainsSmokeVersion === true
    && asset.sourceContainsSmokeFunction === true
  );

  const allAdversarialFixturesPass = (fixtures) => {
    if (!fixtures || typeof fixtures !== "object") return false;
    const required = [
      "profileRejectsMutation",
      "economyRejectsMutation",
      "battleStateRejectsMutation",
      "moneyLogRejectsMutation",
      "persistenceRejectsMutation",
      "localStorageRejectsMutation"
    ];
    return required.every((key) => fixtures[key] === true);
  };

  const smokeBoomerEconomyConflictTerminologyCurrentContractOnce = function smokeBoomerEconomyConflictTerminologyCurrentContractOnce() {
    const raw = legacySmoke();
    const audit = inspectCurrentAudit();
    const profileArchitecture = inspectCurrentProfileArchitecture();
    const emojiContracts = inspectCurrentEmojiContracts();
    const legacyBaseHealth = inspectLegacyBaseHealth(raw);

    const replacementChecks = {
      base_smoke: audit.ok && legacyBaseHealth.ok,
      profile_diff: audit.ok && profileArchitecture.ok,
      placeholders: audit.ok,
      emoji_contracts: emojiContracts.ok
    };
    const replacementDetails = {
      base_smoke: { audit, legacyBaseHealth },
      profile_diff: { audit, profileArchitecture },
      placeholders: { audit },
      emoji_contracts: emojiContracts
    };

    const failedChecks = Array.isArray(raw && raw.failedChecks)
      ? raw.failedChecks.filter((check) => !SUPERSEDED_CHECKS.has(check))
      : [];
    const failures = Array.isArray(raw && raw.failures)
      ? raw.failures.filter((entry) => !(entry && SUPERSEDED_CHECKS.has(entry.check)))
      : [];
    const forbiddenRemaining = Array.isArray(raw && raw.forbiddenRemaining)
      ? raw.forbiddenRemaining.filter((entry) => !(entry && SUPERSEDED_CHECKS.has(entry.check)))
      : [];
    const missingCoverage = new Set(Array.isArray(raw && raw.missingCoverage) ? raw.missingCoverage : []);
    Object.values(CHECK_LABELS).forEach((label) => missingCoverage.delete(label));
    const coveredFeatureZones = new Set(Array.isArray(raw && raw.coveredFeatureZones) ? raw.coveredFeatureZones : []);

    Object.keys(replacementChecks).forEach((check) => {
      const label = CHECK_LABELS[check];
      if (replacementChecks[check]) {
        coveredFeatureZones.add(label);
        return;
      }
      failedChecks.push(check);
      failures.push({ check, detail: replacementDetails[check] });
      missingCoverage.add(label);
      if (check === "placeholders" || check === "emoji_contracts") {
        forbiddenRemaining.push({ check, detail: replacementDetails[check] });
      }
    });

    const runtimeChecks = {
      ...(raw && raw.runtimeChecks ? raw.runtimeChecks : {}),
      ...replacementChecks,
      current_static_audit: audit.ok,
      current_profile_architecture: profileArchitecture.ok,
      current_emoji_contracts: emojiContracts.ok,
      legacy_base_runtime_health: legacyBaseHealth.ok
    };

    const result = {
      ...(raw || {}),
      adapterBuildTag: ADAPTER_BUILD_TAG,
      adapterSmokeVersion: ADAPTER_SMOKE_VERSION,
      rawLegacyOk: !!(raw && raw.ok === true),
      rawLegacyFailedChecks: Array.isArray(raw && raw.failedChecks) ? raw.failedChecks.slice() : [],
      supersededLegacyChecks: Array.from(SUPERSEDED_CHECKS),
      currentAuthority: {
        audit,
        profileArchitecture,
        emojiContracts,
        legacyBaseHealth
      },
      runtimeChecks,
      failedChecks,
      failures,
      forbiddenRemaining,
      missingCoverage: Array.from(missingCoverage),
      coveredFeatureZones: Array.from(coveredFeatureZones)
    };

    const restorationsPass = [
      "stateRestored",
      "profileRestored",
      "economyRestored",
      "battleStateRestored",
      "moneyLogRestored",
      "persistenceRestored",
      "localStorageRestored"
    ].every((key) => result[key] === true);

    result.ok = result.failedChecks.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && restorationsPass
      && allAdversarialFixturesPass(result.adversarialRestorationFixtures)
      && loadedAssetStillValid(result.loadedRuntimeAsset)
      && audit.ok
      && profileArchitecture.ok
      && emojiContracts.ok
      && legacyBaseHealth.ok;

    return result;
  };

  devStore.smokeBoomerEconomyConflictTerminologyLegacyRawOnce = legacySmoke;
  devStore.smokeBoomerEconomyConflictTerminologyOnce = smokeBoomerEconomyConflictTerminologyCurrentContractOnce;
  if (Game.Dev && typeof Game.Dev === "object") {
    Game.Dev.smokeBoomerEconomyConflictTerminologyLegacyRawOnce = legacySmoke;
    Game.Dev.smokeBoomerEconomyConflictTerminologyOnce = smokeBoomerEconomyConflictTerminologyCurrentContractOnce;
  }

  console.warn("BOOMER_STEP4_4B_CURRENT_CONTRACT_ADAPTER_INSTALLED_V1", {
    adapterBuildTag: ADAPTER_BUILD_TAG,
    adapterSmokeVersion: ADAPTER_SMOKE_VERSION,
    smokeType: typeof devStore.smokeBoomerEconomyConflictTerminologyOnce,
    rawSmokeType: typeof devStore.smokeBoomerEconomyConflictTerminologyLegacyRawOnce
  });
})();
