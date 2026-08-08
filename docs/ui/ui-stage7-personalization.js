// Stage 7.4 start nickname and visible-character personalization.
window.Game = window.Game || {};

(() => {
  const G = window.Game;
  const PATCH_FLAG = "__stage7PersonalizationV1";
  if (G[PATCH_FLAG]) return;
  G[PATCH_FLAG] = true;

  const ANTAGONIST_NAME = "Райхан";
  const MEDIATOR_NAME = "Настя";
  const QUESTIONNAIRE_INTRO = "Чтобы открыть полную игру, ответь на 6 простых, но важных вопросов. Они нужны, чтобы проверить, понятно ли, как твой выбор изменил мир.";
  const TEXT_REPLACEMENTS = [
    ["Тест Stage 7.3", "Тест Stage 7.4"],
    ["Кеном", "Райханом"],
    ["Кену", "Райхану"],
    ["Кене", "Райхане"],
    ["Кена", "Райхана"],
    ["Кен", "Райхан"],
    ["Микой", "Настей"],
    ["Мики", "Насти"],
    ["Мике", "Насте"],
    ["Мику", "Настю"],
    ["Мика", "Настя"],
  ];

  function personalizedName(name) {
    if (name === "Кен") return ANTAGONIST_NAME;
    if (name === "Мика") return MEDIATOR_NAME;
    return name;
  }

  function personalizeText(value) {
    let next = String(value == null ? "" : value);
    TEXT_REPLACEMENTS.forEach(([before, after]) => {
      next = next.split(before).join(after);
    });
    return next;
  }

  function ensureNicknameField() {
    const card = document.getElementById("startCard");
    if (!card || document.getElementById("nameInput")) return;
    const anchor = document.getElementById("startBirthYearLabel") || card.querySelector(".startFieldLabel");
    if (!anchor || !anchor.parentNode) return;

    const label = document.createElement("label");
    label.id = "startNameLabel";
    label.className = "startFieldLabel";
    label.htmlFor = "nameInput";
    label.textContent = "Ник";

    const input = document.createElement("input");
    input.id = "nameInput";
    input.className = "input";
    input.type = "text";
    input.maxLength = 24;
    input.autocomplete = "nickname";
    input.autocapitalize = "words";
    input.spellcheck = false;
    input.placeholder = "Как тебя называть?";

    anchor.parentNode.insertBefore(label, anchor);
    anchor.parentNode.insertBefore(input, anchor);
  }

  function renameScenarioPlayers() {
    const states = [G.__S, G.State, G.UI && G.UI.S].filter((value, index, all) => value && all.indexOf(value) === index);
    states.forEach((state) => {
      const players = state && state.players;
      if (!players || typeof players !== "object") return;
      if (players.npc_stage7_ken) players.npc_stage7_ken.name = ANTAGONIST_NAME;
      if (players.npc_stage7_mika) players.npc_stage7_mika.name = MEDIATOR_NAME;
    });
  }

  function wrapPushChat() {
    const UI = G.UI;
    if (!UI || typeof UI.pushChat !== "function" || UI.pushChat.__stage7PersonalizationWrapped) return;
    const original = UI.pushChat;
    const wrapped = function (entry, ...rest) {
      const nextEntry = entry && typeof entry === "object"
        ? Object.assign({}, entry, { name: personalizedName(entry.name) })
        : entry;
      return original.call(this, nextEntry, ...rest);
    };
    wrapped.__stage7PersonalizationWrapped = true;
    UI.pushChat = wrapped;
  }

  function wrapStage7Controller() {
    const controller = G.Stage7FirstExperience;
    if (!controller || controller.__stage7PersonalizationWrapped) return;
    ["claimFreshStart", "claimResume"].forEach((methodName) => {
      const original = controller[methodName];
      if (typeof original !== "function") return;
      controller[methodName] = function (...args) {
        const result = original.apply(this, args);
        renameScenarioPlayers();
        return result;
      };
    });
    controller.__stage7PersonalizationWrapped = true;
  }

  function personalizeTextNodes(root) {
    if (!root || typeof document.createTreeWalker !== "function") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const parent = node.parentElement;
      if (parent && ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)) return;
      const next = personalizeText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  function ensureQuestionnaireIntro(panel) {
    if (!panel) return;
    const button = panel.querySelector('button[data-stage7-action="open-evidence-questionnaire"]');
    if (!button || panel.querySelector(".stage7EvidenceIntro")) return;
    const intro = document.createElement("p");
    intro.className = "stage7Support stage7EvidenceIntro";
    intro.textContent = QUESTIONNAIRE_INTRO;
    button.parentNode.insertBefore(intro, button);
  }

  function apply() {
    ensureNicknameField();
    wrapPushChat();
    wrapStage7Controller();
    renameScenarioPlayers();
    const panel = document.getElementById("stage7FirstExperiencePanel");
    const chatLog = document.getElementById("chatLog");
    if (panel) {
      personalizeTextNodes(panel);
      ensureQuestionnaireIntro(panel);
    }
    if (chatLog) personalizeTextNodes(chatLog);
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      apply();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  if (!G.__DEV || typeof G.__DEV !== "object") G.__DEV = {};
  G.__DEV.smokeStage7Personalization = () => ({
    ok: !!document.getElementById("nameInput"),
    antagonistName: ANTAGONIST_NAME,
    mediatorName: MEDIATOR_NAME,
    questionnaireIntro: QUESTIONNAIRE_INTRO,
  });
})();
