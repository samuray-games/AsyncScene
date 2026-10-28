import { createBattleClient } from "./api.mjs";

const $ = id => document.getElementById(id);
const fields = {
  side: $("side"), battleId: $("battle-id"), token: $("token"),
  connect: $("connect"), disconnect: $("disconnect"), refresh: $("refresh"),
  battle: $("battle"), form: $("move-form"), commit: $("commit"),
  status: $("connection-status"), battleStatus: $("battle-status"),
};
let playerToken = "";
let battleId = "";
let client = null;
let currentView = null;

function setStatus(node, message, error = false) {
  node.textContent = message;
  node.dataset.state = error ? "error" : "ok";
}
function updateView(view) {
  currentView = view;
  $("players").textContent = "You: " + view.participants.self + " · Other player: " + view.participants.opponent;
  $("phase").textContent = view.phase;
  $("self-committed").textContent = view.selfCommitted ? "Committed" : "Waiting";
  $("opponent-committed").textContent = view.opponentCommitted ? "Committed" : "Waiting";
  $("deadline").textContent = new Date(view.deadlineAt).toLocaleString();
  fields.battle.hidden = false;
  fields.commit.disabled = view.selfCommitted || !["created", "waiting"].includes(view.phase);
  $("result").hidden = !view.revealed;
  if (view.revealed) $("result-data").textContent = JSON.stringify({
    selections: view.selections,
    mechanicalOutcome: view.mechanicalOutcome,
    resolution: view.resolution,
  }, null, 2);
}
async function refresh() {
  const view = await client.getView(battleId, playerToken);
  updateView(view);
  return view;
}
fields.connect.addEventListener("click", async () => {
  const candidateBattleId = fields.battleId.value.trim();
  const candidateToken = fields.token.value.trim();
  fields.connect.disabled = true;
  try {
    client = createBattleClient();
    const view = await client.getView(candidateBattleId, candidateToken);
    battleId = candidateBattleId;
    playerToken = candidateToken;
    fields.token.value = "";
    fields.battleId.value = "";
    fields.disconnect.disabled = false;
    fields.side.disabled = true;
    setStatus(fields.status, "Connected as Player " + fields.side.value + ". Credentials are held in memory.");
    updateView(view);
  } catch (error) {
    client = null;
    playerToken = "";
    battleId = "";
    setStatus(fields.status, error.message, true);
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
  fields.side.disabled = false;
  fields.disconnect.disabled = true;
  setStatus(fields.status, "Credentials cleared from this page.");
  setStatus(fields.battleStatus, "");
});
fields.refresh.addEventListener("click", async () => {
  fields.refresh.disabled = true;
  try {
    await refresh();
    setStatus(fields.battleStatus, "State refreshed.");
  } catch (error) { setStatus(fields.battleStatus, error.message, true); }
  finally { fields.refresh.disabled = false; }
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
    setStatus(fields.battleStatus, result.code === "COMMITTED" ? "Move committed. Refresh after the other player acts." : "Move accepted.");
    updateView(result.view);
  } catch (error) {
    setStatus(fields.battleStatus, error.message, true);
    try { updateView(await refresh()); } catch { /* retain the last safe public view */ }
  }
});
