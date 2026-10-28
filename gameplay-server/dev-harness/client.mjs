import { createBattleClient } from "./api.mjs";
import {
  battleProgressText, describeResult, localDate, moveStatus, participantDescription, participantSide, readableError,
} from "./presentation.mjs";

const $ = id => document.getElementById(id);
const fields = {
  battleId: $("battle-id"), token: $("token"), connect: $("connect"),
  disconnect: $("disconnect"), refresh: $("refresh"), battle: $("battle"),
  form: $("move-form"), commit: $("commit"), status: $("connection-status"),
  battleStatus: $("battle-status"), players: $("players"), phase: $("phase"),
  selfCommitted: $("self-committed"), opponentCommitted: $("opponent-committed"),
  deadline: $("deadline"), result: $("result"),
};
let playerToken = "";
let battleId = "";
let client = null;
let currentView = null;

function setStatus(node, message, error = false) {
  node.textContent = message;
  node.dataset.state = error ? "error" : "ok";
}

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
  $("result-a-actions").textContent = "Атака: " + result.actions.A.attack +
    ". Защита: " + result.actions.A.defense + ".";
  $("result-b-actions").textContent = "Атака: " + result.actions.B.attack +
    ". Защита: " + result.actions.B.defense + ".";
  $("result-a-stats").textContent = "Сила атаки: " + stat(result.stats.A.attack) +
    ". Сила защиты: " + stat(result.stats.A.defense) + ".";
  $("result-b-stats").textContent = "Сила атаки: " + stat(result.stats.B.attack) +
    ". Сила защиты: " + stat(result.stats.B.defense) + ".";
}

function updateView(view) {
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
}

async function refresh() {
  const view = await client.getView(battleId, playerToken);
  updateView(view);
  return view;
}

fields.connect.addEventListener("click", async () => {
  const candidateBattleId = fields.battleId.value.trim();
  const candidateToken = fields.token.value.trim();
  fields.token.value = "";
  fields.connect.disabled = true;
  try {
    client = createBattleClient();
    const view = await client.getView(candidateBattleId, candidateToken);
    battleId = candidateBattleId;
    playerToken = candidateToken;
    fields.token.value = "";
    fields.battleId.value = "";
    fields.disconnect.disabled = false;
    setStatus(fields.status, "Подключено. Ключ игрока остаётся только в памяти этого окна.");
    updateView(view);
  } catch (error) {
    client = null;
    playerToken = "";
    battleId = "";
    setStatus(fields.status, readableError(error), true);
  } finally {
    fields.connect.disabled = false;
  }
});

fields.disconnect.addEventListener("click", () => {
  playerToken = "";
  battleId = "";
  client = null;
  currentView = null;
  fields.battle.hidden = true;
  fields.token.value = "";
  fields.battleId.value = "";
  fields.disconnect.disabled = true;
  setStatus(fields.status, "Данные игрока удалены из памяти этого окна.");
  setStatus(fields.battleStatus, "");
});

fields.refresh.addEventListener("click", async () => {
  fields.refresh.disabled = true;
  try {
    const view = await refresh();
    setStatus(fields.battleStatus, battleProgressText(view));
  } catch (error) {
    setStatus(fields.battleStatus, readableError(error), true);
  } finally {
    fields.refresh.disabled = false;
  }
});

fields.form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!client || !currentView || fields.commit.disabled) return;
  const selection = {
    attackColor: $("attack-color").value,
    defenseColor: $("defense-color").value,
    attackType: $("attack-type").value,
    defenseType: $("defense-type").value,
    role: "citizen",
  };
  fields.commit.disabled = true;
  try {
    const result = await client.commit(battleId, playerToken, selection);
    updateView(result.view);
    setStatus(fields.battleStatus, battleProgressText(result.view));
  } catch (error) {
    setStatus(fields.battleStatus, readableError(error), true);
    try { updateView(await refresh()); } catch { /* preserve the last verified public view */ }
  }
});
