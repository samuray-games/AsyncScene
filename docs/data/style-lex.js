// data/style-lex.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const Data = Game.Data || (Game.Data = {});

  const styleLex = {
    version: "style-lex-runtime-contract-v1",
    address: "ты",
    stance: "partner",
    phraseLength: {
      min: 1,
      max: 2,
      unit: "short phrases",
      rules: [
        "Пиши 1-2 короткие фразы.",
        "Делай одно действие или один смысл на фразу.",
        "Если строка перегружена, раздели её на две короткие фразы."
      ]
    },
    allowed: {
      baselineWords: ["очки", "риск", "выбор", "результат"],
      formulas: [
        "Твой выбор.",
        "Есть риск.",
        "Результат виден.",
        "Очки на месте."
      ]
    },
    forbidden: {
      categories: ["memes", "officialese", "teen slang"],
      tabooForms: {
        memes: ["лол", "кек", "мемно"],
        officialese: ["необходимо", "осуществить", "произошла ошибка"],
        teenSlang: ["краш", "вайб", "имба"]
      }
    },
    rewriteHints: {
      memes: {
        "лол": "смешно",
        "кек": "смешно",
        "мемно": "странно"
      },
      officialese: {
        "необходимо": "нужно",
        "осуществить": "сделать",
        "произошла ошибка": "не получилось"
      },
      teenSlang: {
        "краш": "симпатия",
        "вайб": "настрой",
        "имба": "сильный выбор"
      }
    }
  };

  Data.styleLex = styleLex;

  const requiredKeys = ["address", "stance", "phraseLength", "allowed", "forbidden", "rewriteHints"];
  const readProof = () => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const keys = lex ? Object.keys(lex) : [];
    const baselineOk = !!(lex && lex.allowed && Array.isArray(lex.allowed.baselineWords))
      && ["очки", "риск", "выбор", "результат"].every((word) => lex.allowed.baselineWords.includes(word));
    const taboosOk = !!(lex && lex.forbidden && Array.isArray(lex.forbidden.categories))
      && ["memes", "officialese", "teen slang"].every((category) => lex.forbidden.categories.includes(category));
    const contractOk = !!lex
      && lex.address === "ты"
      && lex.stance === "partner"
      && requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(lex, key))
      && baselineOk
      && taboosOk;

    return {
      ok: contractOk,
      path: "Game.Data.styleLex",
      requiredKeys,
      actualKeys: keys,
      address: lex ? lex.address : null,
      stance: lex ? lex.stance : null,
      hasBaseline: baselineOk,
      hasTaboos: taboosOk
    };
  };

  const proof = readProof();

  if (!Game.__DEV) Game.__DEV = {};
  if (typeof Game.__DEV.smokeStyleLexContractOnce !== "function") {
    Game.__DEV.smokeStyleLexContractOnce = readProof;
  }

  try {
    console.warn(proof.ok ? "STYLELEX_CONTRACT_V1_PASS" : "STYLELEX_CONTRACT_V1_FAIL", proof);
  } catch (_) {}
})();
