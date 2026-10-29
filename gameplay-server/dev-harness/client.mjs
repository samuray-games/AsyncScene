import { createBattleClient } from "./api.mjs";
import { createSessionEpoch, createSessionViewGate } from "./session_epoch.mjs";
import {
  attackActionInfo, battleProgressText, defenseActionInfo, describeResult, formatActionLine, localDate,
  moveStatus, participantDescription, participantSide, readableError,
} from "./presentation.mjs";

const $ = id => document.getElementById(id);
const fields = {
  battleId: $("battle-id"), token: $("token"), connect: $("connect"),
  disconnect: $("disconnect"), refresh: $("refresh"), battle: $("battle"),
  form: $("move-form"), commit: $("commit"), status: $("connection-status"),
  battleStatus: $("battle-status"), players: $("players"), phase: $("phase"),
  attackType: $("attack-type"), defenseType: $("defense-type"),
  attackDescription: $("attack-description"), defenseDescription: $("defense-description"),
  selfCommitted: $("self-committed"), opponentCommitted: $("opponent-committed"),
  deadline: $("deadline"), result: $("result"),
};
const sessionEpoch = createSessionEpoch();
const sessionViewGate = createSessionViewGate();
let playerToken = "";
let battleId = "";
let client = null;
let currentView = null;

function setStatus(node, message, error = false) {
  node.textContent = message;
  node.dataset.state = error ? "error" : "ok";
}

function updateActionDescriptions() {
  const attack = attackActionInfo(fields.attackType.value);
  const defense = defenseActionInfo(fields.defenseType.value);
  fields.attackDescription.textContent = attack?.explanation || "Описание этого варианта недоступно.";
  fields.defenseDescription.textContent = defense?.explanation || "Описание этого варианта недоступно.";
}

fields.attackType.addEventListener("change", updateActionDescriptions);
fields.defenseType.addEventListener("change", updateActionDescriptions);
updateActionDescriptions();

function stat(value) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "—";
}

function renderResult(view) {
  const result = describeResult(view);
  fields.result.hidden = !view.revealed;
  if (!view.revealed) return;
  $("result-outcome").textContent = result.title;
  $("result-explanation").textContent = result.explanation;
  if (!result.stats || !result.actions) {
    $("result-a-actions").textContent = "";
    $("result-b-actions").textContent = "";
    $("result-a-stats").textContent = "";
    $("result-b-stats").textContent = "";
    return;
  }
  $("result-a-actions").textContent = formatActionLine(result.actions.A);
  $("result-b-actions").textContent = formatActionLine(result.actions.B);
  $("result-a-stats").textContent = "Сила атаки: " + stat(result.stats.A.attack) +
    ". Сила защиты: " + stat(result.stats.A.defense) + ".";
  $("result-b-stats").textContent = "Сила атаки: " + stat(result.stats.B.attack) +
    ". Сила защиты: " + stat(result.stats.B.defense) + ".";
}

function updateView(view) {
  if (!sessionViewGate.accept(view)) return false;
  currentView = view;
  const side = participantSide(view);
  fields.players.textContent = participantDescription(view);
  fields.phase.textContent = battleProgressText(view);
  fields.selfCommitted.textContent = moveStatus(view.selfCommitted);
  fields.opponentCommitted.textContent = view.opponentCommitted === true
    ? "Ход принят" : "Ход ещё не отправлен";
  fields.deadline.textContent = localDate(view.deadlineAt);
  fields.battle.hidden = false;
  fields.commit.disabled = !side || view.selfCommitted === true ||
    view.revealed === true || view.phase === "expired";
  renderResult(view);
  return true;
}

async function refresh() {
  const epoch = sessionEpoch.current();
  const requestClient = client;
  const requestBattleId = battleId;
  const requestToken = playerToken;
  if (!requestClient || !requestToken || !requestBattleId) return null;
  const view = await requestClient.getView(requestBattleId, requestToken);
  if (!sessionEpoch.isCurrent(epoch)) return null;
  if (!updateView(view)) return null;
  return view;
}

fields.connect.addEventListener("click", async () => {
  const epoch = sessionEpoch.begin();
  sessionViewGate.reset();
  const candidateBattleId = fields.battleId.value.trim();
  const candidateToken = fields.token.value.trim();
  fields.token.value = "";
  fields.connect.disabled = true;
  client = null;
  battleId = "";
  playerToken = "";
  currentView = null;
  fields.battle.hidden = true;
  fields.commit.disabled = true;
  try {
    const requestClient = createBattleClient();
    const view = await requestClient.getView(candidateBattleId, candidateToken);
    if (!sessionEpoch.isCurrent(epoch)) return;
    client = requestClient;
    battleId = candidateBattleId;
    playerToken = candidateToken;
    fields.token.value = "";
    fields.battleId.value = "";
    fields.disconnect.disabled = false;
    setStatus(fields.status, "Подключено. Ключ игрока остаётся только в памяти этого окна.");
    updateView(view);
  } catch (error) {
    if (!sessionEpoch.isCurrent(epoch)) return;
    client = null;
    playerToken = "";
    battleId = "";
    setStatus(fields.status, readableError(error), true);
  } finally {
    if (sessionEpoch.isCurrent(epoch)) fields.connect.disabled = false;
  }
});

fields.disconnect.addEventListener("click", () => {
  sessionEpoch.invalidate();
  sessionViewGate.reset();
  playerToken = "";
  battleId = "";
  client = null;
  currentView = null;
  fields.battle.hidden = true;
  fields.token.value = "";
  fields.battleId.value = "";
  fields.disconnect.disabled = true;
  fields.commit.disabled = true;
  fields.refresh.disabled = false;
  setStatus(fields.status, "Данные игрока удалены из памяти этого окна.");
  setStatus(fields.battleStatus, "");
});

fields.refresh.addEventListener("click", async () => {
  fields.refresh.disabled = true;
  try {
    const view = await refresh();
    if (view) setStatus(fields.battleStatus, battleProgressText(view));
  } catch (error) {
    setStatus(fields.battleStatus, readableError(error), true);
  } finally {
    fields.refresh.disabled = false;
  }
});

fields.form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!client || !currentView || fields.commit.disabled) return;
  const epoch = sessionEpoch.current();
  const requestClient = client;
  const requestBattleId = battleId;
  const requestToken = playerToken;
  const selection = {
    attackColor: $("attack-color").value,
    defenseColor: $("defense-color").value,
    attackType: $("attack-type").value,
    defenseType: $("defense-type").value,
    role: "citizen",
  };
  fields.commit.disabled = true;
  try {
    const result = await requestClient.commit(requestBattleId, requestToken, selection);
    if (!sessionEpoch.isCurrent(epoch)) return;
    if (!updateView(result.view)) return;
    setStatus(fields.battleStatus, battleProgressText(result.view));
  } catch (error) {
    if (!sessionEpoch.isCurrent(epoch)) return;
    setStatus(fields.battleStatus, readableError(error), true);
    try { await refresh(); } catch { /* preserve the last verified public view */ }
  }
});
