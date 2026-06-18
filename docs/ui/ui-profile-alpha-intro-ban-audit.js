window.Game = window.Game || {};
(function () {
  const manifest = Object.freeze({
    metadata: Object.freeze({
      auditId: "UI_PROFILE_ALPHA_INTRO_BAN_AUDIT",
      stage: "4-alpha",
      step: "2.4",
      mode: "alpha_intro_ban_audit_only",
      sourceMapId: "UI_PROFILE_ALPHA_MECHANICAL_COMPRESSION_MAP",
      smokeVersion: "alpha_step_2_4_intro_ban_v20260618_001"
    }),
    bannedIntroPhrases: Object.freeze([
      "можно",
      "если",
      "в этом случае",
      "похоже",
      "кажется",
      "если не ошибаюсь",
      "как вам кажется",
      "на самом деле",
      "сейчас не получилось",
      "попробуй позже"
    ]),
    bannedConditionPhrases: Object.freeze([
      "если",
      "когда",
      "при условии",
      "в случае",
      "иначе",
      "чтобы",
      "нужно",
      "требуется"
    ]),
    allowedSourceIntroRows: Object.freeze([
      Object.freeze({ id: "TXT_0014", sourceText: "Только для интерфейса. Не сохраняем. Можно поменять позже.", alphaText: "Интерфейс без сохранения" }),
      Object.freeze({ id: "TXT_0015", sourceText: "я на самом деле чувствую будто я родился в …", alphaText: "Год по ощущению" }),
      Object.freeze({ id: "TXT_0119", sourceText: "Кто сегодня на слуху, если не ошибаюсь?", alphaText: "Кто на слуху?" }),
      Object.freeze({ id: "TXT_0120", sourceText: "Кажется, про {NAME} говорят.", alphaText: "Про {NAME} говорят" }),
      Object.freeze({ id: "TXT_0121", sourceText: "Кто, как вам кажется, был рядом?", alphaText: "Кто был рядом?" }),
      Object.freeze({ id: "TXT_0123", sourceText: "Где мы сейчас, как вам кажется?", alphaText: "Где мы?" }),
      Object.freeze({ id: "TXT_0154", sourceText: "Сейчас не получилось. Попробуй позже.", alphaText: "Не получилось" })
    ]),
    expectedSourceIntroHits: Object.freeze([
      Object.freeze({ id: "TXT_0014", phrase: "можно" }),
      Object.freeze({ id: "TXT_0015", phrase: "на самом деле" }),
      Object.freeze({ id: "TXT_0119", phrase: "если не ошибаюсь" }),
      Object.freeze({ id: "TXT_0120", phrase: "кажется" }),
      Object.freeze({ id: "TXT_0121", phrase: "как вам кажется" }),
      Object.freeze({ id: "TXT_0123", phrase: "как вам кажется" }),
      Object.freeze({ id: "TXT_0154", phrase: "сейчас не получилось" }),
      Object.freeze({ id: "TXT_0154", phrase: "попробуй позже" })
    ]),
    expectedAlphaIntroHits: Object.freeze([]),
    expectedAlphaConditionHits: Object.freeze([])
  });

  window.UI_PROFILE_ALPHA_INTRO_BAN_AUDIT = manifest;
  window.Game.UI_PROFILE_ALPHA_INTRO_BAN_AUDIT = manifest;
  if (typeof module !== "undefined" && module.exports) module.exports = manifest;
})();
