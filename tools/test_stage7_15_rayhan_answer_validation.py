from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLES_DOCS = ROOT / "docs/ui/ui-battles.js"
EVENTS = ROOT / "AsyncScene/Web/events.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(SOURCE.read_bytes() == DEPLOYED.read_bytes(), "Stage 7.15 controller mirrors differ")
require(BATTLES.read_bytes() == BATTLES_DOCS.read_bytes(), "Battle UI mirrors differ")
require("if (e.stage715RayhanEvent === true) return false;" in EVENTS.read_text(encoding="utf-8"), "Stage 7.15 scripted Event must bypass generic NPC vote simulation")
subprocess.run(["node", "--check", str(SOURCE)], cwd=ROOT, check=True)
subprocess.run(["node", "--check", str(BATTLES)], cwd=ROOT, check=True)
source_text = SOURCE.read_text(encoding="utf-8")
battles_text = BATTLES.read_text(encoding="utf-8")
handler = source_text[source_text.index("function handleRayhanDefenseChoice") : source_text.index("function isChoiceText")]
require("conflict.pickDefense" in handler, "Rayhan choice must use the existing defense resolver")
require('battle.status = "finished"' not in handler, "Rayhan handler must not force-finish every answer")
require('battle.result = "win"' not in handler, "Rayhan handler must not force a win")
require("G.Events.addEvent" in source_text, "wrong answer must create the standard event card")
require("G.Events.finalizeOpenEventNow" in source_text, "event must resolve through the existing event resolver")
require("RAYHAN_EVENT_MIN_DELAY_MS" in source_text and "RAYHAN_EVENT_MAX_DELAY_MS" in source_text, "event votes need a 3-4 second schedule")
require("battle.meta.stage715RayhanArgumentRevealed = true" in handler, "wrong Rayhan answer must reveal the scripted argument color")
wrong_handler = handler[handler.index("if (isWrongAnswer)"):handler.index("} else {", handler.index("if (isWrongAnswer)"))]
require("battle._defenseChoices = [choice]" in wrong_handler, "wrong Rayhan answer must retain only the selected scripted choice")
require("stage715RayhanAnswerPending" in handler, "wrong Rayhan answer must enter the waiting-for-reply state")
require("if (!stage715RayhanDemo)" in battles_text and "Stage 7.15 owns scripted choices through its waiting-for-reply phase." in battles_text,
        "generic battle choice-cache cleanup must not overwrite scripted Rayhan choices")
require("function isStage715RayhanEventOwnedBattle" in battles_text
        and "if (isStage715RayhanEventOwnedBattle(b) && b.meta.stage715RayhanEventVotePending === true) return;" not in battles_text,
        "the pending Rayhan event must keep its original battle card visible")
pending_render = battles_text[battles_text.index("const rayhanEventVotePending ="):battles_text.index("if (b.meta && b.meta.stage715NastyaBattle", battles_text.index("const rayhanEventVotePending ="))]
require("renderResolvedBattleCardCore(card, b" in pending_render and "body.appendChild(card)" in pending_render,
        "the visible Rayhan card must retain its argument content during Event-owned voting")
require("scriptedVoteSequence" in source_text and "voteIndex < 3 ? \"a\" : \"b\"" not in source_text,
        "the randomized Rayhan vote sequence must be persisted on its Event")
require("firstFour.filter((side) => side === \"a\").length === 2" in source_text
        and "sequence[4] === \"a\"" in source_text,
        "the persisted Event sequence must guarantee a 2:2 prefix and player fifth vote")
require("title: `${playerName} против Райхана`" in source_text,
        "Rayhan Event must place the current player first")
require("finalizeStage715RayhanEventWin" in source_text and "finalizeStage715RayhanEventWin(battle.id, event.id)" in source_text,
        "Rayhan battle must finalize as a win only at the resolved Event boundary")
require('battle.meta && battle.meta.stage715BattleId === "stage7_15_first_battle"' in battles_text
        and 'battle.battleId === "stage7_15_first_battle"' in battles_text
        and 'battle.id === "stage7_15_first_battle"' in battles_text,
        "Rayhan render clones must remain on the scripted controller path")
require("stage715RayhanArgumentRevealed" in battles_text, "battle UI must render the revealed scripted Rayhan color")
require("watchFirstBattle()" not in source_text, "first Rayhan unlock must not call a removed watcher before render")
event_ui_text = (ROOT / "AsyncScene/Web/ui/ui-events.js").read_text(encoding="utf-8")
events_core_text = EVENTS.read_text(encoding="utf-8")
core_text = (ROOT / "AsyncScene/Web/conflict/conflict-core.js").read_text(encoding="utf-8")
require("!e.stage715RayhanEvent" in event_ui_text, "resolved Rayhan Event must omit the not-voted warning")
require("isTutorialVotingBlocked" in source_text and "isTutorialVotingBlocked" in event_ui_text
        and "isTutorialVotingBlocked" in events_core_text,
        "tutorial vote restriction must guard both Event presentation and the action API")
require("stage715FirstIndependentBattleComplete" in source_text,
        "normal Event voting must unlock from the canonical first independent battle completion flag")
help_event = events_core_text[events_core_text.index("function helpEvent(eventId, side)"):events_core_text.index("Events.helpEvent = helpEvent")]
require(help_event.index("isStage715TutorialVotingBlocked()") < help_event.index("ensureEventCrowd(e)"),
        "tutorial vote action must reject before mutating crowd or economy state")
require("if (tutorialVotingBlocked) btn.disabled = true" in event_ui_text,
        "tutorial Event vote buttons must be natively disabled")
require("stage715RayhanEventResolved === true" in core_text and 'rayhanTutorialPlayerWin ? "победа"' in core_text,
        "only the resolved Rayhan tutorial victory should announce the current player as winner")
for mirror_source, mirror_docs in [
    (ROOT / "AsyncScene/Web/events.js", ROOT / "docs/events.js"),
    (ROOT / "AsyncScene/Web/ui/ui-events.js", ROOT / "docs/ui/ui-events.js"),
    (ROOT / "AsyncScene/Web/conflict/conflict-core.js", ROOT / "docs/conflict/conflict-core.js"),
]:
    require(mirror_source.read_bytes() == mirror_docs.read_bytes(), f"mirror mismatch: {mirror_source.name}")
for js_path in [ROOT / "AsyncScene/Web/events.js", ROOT / "AsyncScene/Web/ui/ui-events.js", ROOT / "AsyncScene/Web/conflict/conflict-core.js"]:
    subprocess.run(["node", "--check", str(js_path)], cwd=ROOT, check=True)

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const conflictApiSource = fs.readFileSync("AsyncScene/Web/conflict/conflict-api.js", "utf8");

function runScenario(choiceId, includeVoteNpcActors = true, randomValues = null) {
  let now = 0;
  let nextTimerId = 1;
  const timers = new Map();
  const timerScheduleLog = [];
  const fakeSetTimeout = (fn, delay = 0) => {
    const id = nextTimerId++;
    const normalizedDelay = Math.max(0, Number(delay) || 0);
    timerScheduleLog.push({ callback: String(fn), delay: normalizedDelay });
    timers.set(id, { fn, at: now + normalizedDelay, interval: 0 });
    return id;
  };
  const fakeSetInterval = (fn, delay = 0) => {
    const id = nextTimerId++;
    timers.set(id, { fn, at: now + Math.max(1, Number(delay) || 1), interval: Math.max(1, Number(delay) || 1) });
    return id;
  };
  const fakeClearTimer = (id) => timers.delete(id);
  const advance = (ms) => {
    const target = now + ms;
    while (true) {
      const due = Array.from(timers.entries())
        .filter(([, timer]) => timer.at <= target)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, timer] = due;
      now = timer.at;
      if (timer.interval) timer.at += timer.interval;
      else timers.delete(id);
      timer.fn();
    }
    now = target;
  };
  class FakeDate extends Date { static now() { return now; } }
  const rayhanId = "npc_stage7_ken";
  const voters = ["npc_voter_1", "npc_voter_2", "npc_voter_3", "npc_voter_4", "npc_voter_5"];
  const state = {
    flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked", stage715EventsPanelRevealed: false },
    me: { id: "me", name: "Тестер", points: 0, wins: 0, influence: 0 },
    rep: 0,
    players: {
      [rayhanId]: { id: rayhanId, name: "Райхан", role: "crowd", npc: true, points: 10, influence: 1 },
      ...Object.assign({}, ...(includeVoteNpcActors ? voters : []).map((id, index) => ({
        [id]: { id, name: `Голос ${index + 1}`, role: "crowd", npc: true, points: 10, influence: 1 },
      }))),
    },
    battles: [],
    events: [],
  };
  const battle = {
    id: "stage7_15_first_battle",
    opponentId: rayhanId,
    status: "pickDefense",
    resolved: false,
    finished: false,
    result: null,
    fromThem: true,
    attack: { id: "rayhan_attack", text: "Извините, кто тут дерзкий?? Выберите ответ быстренько!", displayText: "Извините, кто тут дерзкий?? Выберите ответ быстренько!", type: "who", qtype: "who", group: "who", color: "y", _color: "y" },
    meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_first_battle", stage715RayhanScripted: true },
    _defenseChoices: [
      { id: "canon_who", group: "who", type: "who", color: "y", stage715DisplayText: "Похоже, ты…" },
      { id: "canon_where", group: "where", type: "where", color: "y", stage715DisplayText: "Кажется, прямо тут…" },
      { id: "canon_yn", group: "yn", type: "yn", color: "y", stage715DisplayText: "Наверное, да…" },
    ],
  };
  state.battles.push(battle);
  const chat = [];
  const system = [];
  const timeline = [];
  const eventUnlocks = [];
  let eventAdds = 0;
  let eventResolutions = 0;
  let battleWins = 0;
  const genericCrowdStarts = [];
  const eventVoteTransitions = [];
  const eventVoteSnapshots = [];
  let randomIndex = 0;
  let activeRandomValues = Array.isArray(randomValues) ? randomValues.slice() : null;
  const randomLog = [];
  const persisted = new Map();
  const storage = {
    getItem(key) { return persisted.get(key) || null; },
    setItem(key, value) { persisted.set(key, value); },
    removeItem(key) { persisted.delete(key); },
  };
  const Game = {
    __S: state,
    __D: { toastLog: [], moneyLog: [] },
    Data: { START_POINTS_NPC: 10, t: () => "Споры" },
    Telemetry: { action() {} },
    ConflictEconomy: {
      transferPoints(from, to, amount, reason, meta) {
        const source = from === "me" ? state.me : state.players[from];
        const target = to === "me" ? state.me : state.players[to];
        assert(source && target, `missing economy account ${from}->${to}`);
        source.points -= amount;
        target.points += amount;
        Game.__D.moneyLog.push({ sourceId: from, targetId: to, amount, currency: "points", reason, battleId: meta.battleId });
        return { ok: true };
      },
    },
    __A: {
      transferRep(from, to, amount) {
        assert.strictEqual(from, "crowd_pool");
        assert.strictEqual(to, "me");
        state.rep += amount;
        return { ok: true };
      },
      emitStatDelta(kind, delta, meta) { Game.__D.toastLog.push({ kind, delta, battleId: meta.battleId }); },
      syncMeToPlayers() {},
    },
    Events: {
      addEvent(event) { eventAdds += 1; state.events.unshift(event); },
      finalizeOpenEventNow(event) {
        eventResolutions += 1;
        const crowd = event.crowd;
        event.resolved = true;
        event.state = "resolved";
        crowd.decided = true;
        crowd.winner = crowd.aVotes > crowd.bVotes ? "a" : "b";
        return true;
      },
    },
    _ConflictCore: {
      resolveBattleOutcome(battleId, defense, options) {
        const liveBattle = state.battles.find((entry) => entry.id === battleId);
        assert(liveBattle, `missing battle ${battleId}`);
        liveBattle.defense = defense;
        if ((options && options.forceOutcome) === "win" || defense.id === "canon_who") {
          liveBattle.status = "finished";
          liveBattle.finished = true;
          liveBattle.resolved = true;
          liveBattle.result = "win";
          battleWins += 1;
          return { ok: true, outcome: "win" };
        }
        liveBattle.status = "draw";
        liveBattle.result = "draw";
        liveBattle.outcome = "draw";
        liveBattle.draw = true;
        liveBattle.resolved = false;
        liveBattle.finished = false;
        liveBattle.crowd = { voters: {}, votesA: 0, votesB: 0, aVotes: 0, bVotes: 0, cap: 10, startedAtMs: now, endAt: now + 120000, decided: false };
        return { ok: true, outcome: "draw" };
      },
      startCrowdVoteTimer(battleId) {
        const startedBattle = state.battles.find((entry) => entry.id === battleId);
        assert(startedBattle, `missing battle ${battleId}`);
        genericCrowdStarts.push({ battleId, cap: startedBattle.crowd.cap, phase: state.flags.stage715DemoPhase });
      },
      applyCrowdVoteTick() {},
      finalizeCrowdVote(battleId) {
        assert.strictEqual(battleId, battle.id);
        assert.strictEqual(battle.crowd.votesB, 3);
        assert.strictEqual(battle.crowd.votesA, 2);
        battle.crowd.decided = true;
        battle.crowd.winner = "defender";
        battle.status = "finished";
        battle.finished = true;
        battle.resolved = true;
        battle.draw = false;
        battle.result = "win";
        return { outcome: "B_WIN" };
      },
      incoming(opponentId) {
        const nastya = {
          id: "stage7_15_nastya_battle",
          opponentId,
          status: "pickDefense",
          resolved: false,
          finished: false,
          result: null,
          fromThem: true,
          attack: { id: "incoming_attack", text: "incoming", type: "yn", group: "yn", color: "o", _color: "o" },
          meta: {},
          _defenseChoices: [],
        };
        state.battles.push(nastya);
        return nastya;
      },
      myDefenseOptions() { return battle._defenseChoices; },
    },
    UI: {
      S: state,
      pushChat(entry) { chat.push(entry); timeline.push([entry.system ? "system" : "chat", entry.text]); },
      pushSystem(text) { system.push(text); timeline.push(["system", text]); },
      requestRenderAll() {
        const event = state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
        if (event) {
          const count = event.crowd.alreadyVotedCount;
          if (count > 0 && eventVoteTransitions[eventVoteTransitions.length - 1] !== count) eventVoteTransitions.push(count);
          eventVoteSnapshots.push({ count, a: event.crowd.aVotes, b: event.crowd.bVotes });
        }
      },
      renderAll() {},
      renderEvents() {},
      displayNameByIdOrName(id) { return id === "me" ? state.me.name : (state.players[id] || {}).name; },
      setPanelSize(panel, size) { if (panel === "events") eventUnlocks.push(size); },
      ensureEventsExpanded() { eventUnlocks.push("expanded"); },
      ensurePanelExpanded() {},
      renderBattles() {},
      sendChat() {},
    },
  };
  const chatInput = { value: "", addEventListener() {} };
  const document = { querySelector() { return null; }, getElementById(id) { return id === "chatInput" ? chatInput : null; } };
  const context = {
    Game,
    window: { Game, document, localStorage: storage, location: { search: "?stage715demo=1" }, URLSearchParams, setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimer, setInterval: fakeSetInterval, clearInterval: fakeClearTimer },
    document, URLSearchParams, setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimer, setInterval: fakeSetInterval, clearInterval: fakeClearTimer, Date: FakeDate, console,
  };
  context.Math = Object.create(Math);
  context.Math.random = () => {
    const value = activeRandomValues && randomIndex < activeRandomValues.length ? activeRandomValues[randomIndex++] : 0.37;
    randomLog.push(value);
    return value;
  };
  context.window.window = context.window;
  vm.runInNewContext(conflictApiSource, context);
  vm.runInNewContext(source, context);
  Game.Stage715Demo.claimResume({ state, UI: Game.UI, playerName: state.me.name });
  assert.strictEqual(Game.Stage715Demo.handleRayhanDefenseChoice(battle.id, choiceId), true);
  const immediateResult = battle.result;
  advance(choiceId === "canon_who" ? 1000 : 5000);
  const event = state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
  return { state, battle, event, chat, system, timeline, eventUnlocks, immediateResult, eventAdds: () => eventAdds, eventResolutions: () => eventResolutions, battleWins: () => battleWins, genericCrowdStarts, eventVoteTransitions, eventVoteSnapshots, timerScheduleLog, game: Game, advance, context, storage, randomLog, setRandomValues(values) { activeRandomValues = values.slice(); randomIndex = 0; randomLog.length = 0; } };
}

(function () {
  const correct = runScenario("canon_who");
  assert.strictEqual(correct.immediateResult, "win", "WHO answer must resolve directly");
  assert.strictEqual(correct.battle.result, "win", "WHO answer must resolve through the standard win path");
  assert.strictEqual(correct.battle.crowd, undefined, "WHO answer must not create a vote");
  assert.strictEqual(correct.state.events.length, 0, "WHO answer must not create an event card");
  assert.strictEqual(correct.state.me.points, 2, "direct win must reward exactly two points");
  assert.strictEqual(correct.state.players.npc_stage7_ken.points, 8, "direct win must debit Rayhan");
  assert(!correct.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав! готов?"), "correct answer must not emit wrong-answer chat");

  for (const wrongChoice of ["canon_where", "canon_yn"]) {
    const wrong = runScenario(wrongChoice, false);
    assert.notStrictEqual(wrong.immediateResult, "win", `${wrongChoice} must not win immediately`);
    assert.strictEqual(wrong.state.flags.stage715DemoPhase, "rayhan_wrong_waiting_reply", "wrong answer must wait for a player reply");
    assert.strictEqual(wrong.event, undefined, "wrong answer must not start the event before a player reply");
    assert.strictEqual(wrong.battle.defense.stage715DisplayText, wrongChoice === "canon_where" ? "Кажется, прямо тут…" : "Наверное, да…", "selected scripted counter text must remain exact while waiting");
    assert.strictEqual(wrong.battle.meta.stage715SelectedDefenseText, wrongChoice === "canon_where" ? "Кажется, прямо тут…" : "Наверное, да…", "selected scripted text must be persisted exactly");
    assert.strictEqual(wrong.battle.crowd, null, "waiting for the player reply must not create a battle crowd");
    assert.strictEqual(wrong.genericCrowdStarts.filter((entry) => entry.battleId === wrong.battle.id).length, 0, "no generic crowd may start before the player reply");
    wrong.context.document.getElementById("chatInput").value = "готово";
    wrong.game.UI.sendChat();
    assert.strictEqual(wrong.state.events.some((entry) => entry && entry.stage715RayhanEvent === true), true, "the real UI sendChat path must route an ordinary reply into the Event");
    wrong.game.Stage715Demo.claimResume({ state: wrong.state, UI: wrong.game.UI, playerName: wrong.state.me.name });
    assert.strictEqual(Object.keys(wrong.game.__stage715RayhanEventVoteTimers || {}).length, 1, "repeated Stage 7.15 resume must keep one active Event vote timer");
    assert.strictEqual(wrong.genericCrowdStarts.filter((entry) => entry.battleId === wrong.battle.id).length, 0, "Stage 7.15 Events path must not start the generic Battles crowd loop: " + JSON.stringify(wrong.genericCrowdStarts));
    assert.strictEqual(wrong.battle.crowd, null, "the Rayhan battle must never acquire an effective crowd cap");
    assert.strictEqual(wrong.state.flags.stage715EventsPanelRevealed, true, "the Events panel must remain visible once revealed");

    wrong.advance(7000);
    wrong.event = wrong.state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
    const sequenceBeforeReload = wrong.event.crowd.scriptedVoteSequence.slice();
    const firstTwoBeforeReload = wrong.event.crowd.scriptedVoterIds.slice(0, 2).map((id) => [id, wrong.event.crowd.voters[id]]);
    const savedBeforeReload = JSON.parse(wrong.storage.getItem("AsyncScene_stage715_gameplay_v1"));
    const savedEventBeforeReload = savedBeforeReload.state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
    assert.strictEqual(savedEventBeforeReload.crowd.alreadyVotedCount, 2, "genuine save must contain the first two Event votes");
    assert.strictEqual(JSON.stringify(savedEventBeforeReload.crowd.scriptedVoteSequence), JSON.stringify(sequenceBeforeReload), "genuine save must preserve the one generated sequence");
    wrong.game.Stage715Demo.destroy();
    vm.runInNewContext(source, wrong.context);
    assert.strictEqual(wrong.game.Stage715Demo.claimResume({ state: wrong.state, UI: wrong.game.UI, playerName: wrong.state.me.name }).claimed, true, "Stage 7.15 Event must resume from persisted state");
    wrong.battle = wrong.state.battles.find((entry) => entry.id === "stage7_15_first_battle");
    wrong.event = wrong.state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
    assert.strictEqual(JSON.stringify(wrong.event.crowd.scriptedVoteSequence), JSON.stringify(sequenceBeforeReload), "reload must not rerandomize the persisted vote sequence");
    assert.strictEqual(wrong.event.crowd.alreadyVotedCount, 2, "reload must preserve exactly two counted votes");
    assert.deepStrictEqual(wrong.event.crowd.scriptedVoterIds.slice(0, 2).map((id) => [id, wrong.event.crowd.voters[id]]), firstTwoBeforeReload, "reload must not repeat or change the first two voters");
    assert.strictEqual(wrong.battle.crowd, null, "reload/resume must not resurrect the generic cap-10 battle crowd");
    assert.strictEqual(wrong.battle.status, "stage715_rayhan_event_vote", "reload/resume must restore the Event-owned vote phase");
    assert.strictEqual(wrong.genericCrowdStarts.filter((entry) => entry.battleId === wrong.battle.id).length, 0, "reload/resume must not start generic Rayhan battle crowd");
    wrong.advance(30000);
    wrong.event = wrong.state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
    assert.strictEqual(wrong.battle.result, "win", "event vote must resolve in player's favour: " + JSON.stringify({ phase: wrong.state.flags.stage715DemoPhase, battle: wrong.battle, event: wrong.event }));
  assert(wrong.event, "wrong answer must create a scripted event card");
  assert.strictEqual(wrong.eventAdds(), 1, "wrong answer must start exactly one event sequence: " + JSON.stringify({ events: wrong.state.events, battle: wrong.battle, flags: wrong.state.flags, chat: wrong.chat }));
    assert.strictEqual(wrong.event.title, "Тестер против Райхана", "event card title must place the current player first");
  assert(!String(wrong.event.title).includes("stage715_"), "event title must not expose a Stage 7.15 id");
  assert(![wrong.event.title, wrong.event.meta, wrong.event.aName, wrong.event.bName].some((value) => String(value || "").includes("stage715_")), "event display fields must not expose internal ids");
  assert.strictEqual(wrong.event.voteLabels.a, "за тебя", "standard player vote label must remain unchanged");
  assert.strictEqual(wrong.event.voteLabels.b, "за Райхана", "standard Rayhan vote label must remain unchanged");
  assert.strictEqual(wrong.event.crowd.alreadyVotedCount, 5, "event must contain five votes");
    assert.strictEqual(wrong.event.crowd.aVotes, 3, "the player must finish with three event votes");
    assert.strictEqual(wrong.event.crowd.bVotes, 2, "Rayhan must finish with two event votes");
    assert.strictEqual(wrong.event.crowd.scriptedVoteSequence.length, 5, "one five-vote sequence must be persisted for the Event");
    assert.strictEqual(wrong.event.crowd.scriptedVoteSequence.slice(0, 4).slice().sort().join(""), "aabb", "the first four votes must contain two votes per side");
    assert.strictEqual(wrong.event.crowd.scriptedVoteSequence[4], "a", "the fifth vote must always belong to the player");
    assert.deepStrictEqual(wrong.event.crowd.scriptedVoterIds.map((id) => wrong.event.crowd.voters[id]), wrong.event.crowd.scriptedVoteSequence, "the Core-facing voter ledger must follow the persisted scripted sequence");
  assert.strictEqual(wrong.event.crowd.cap, 5, "the Event must own an exact five-vote cap");
  assert.strictEqual(wrong.event.crowd.scriptedVoterIds.length, 5, "the Stage 7.15 Event must supply five eligible voters when the current world has none");
  assert.deepStrictEqual(wrong.eventVoteTransitions, [1, 2, 3, 4, 5], "exactly five Event vote transitions must render");
    assert.deepStrictEqual(wrong.eventVoteSnapshots.find((snapshot) => snapshot.count === 4), { count: 4, a: 2, b: 2 }, "the fourth rendered vote must leave a visible 2:2 tally");
  const voteTimers = wrong.timerScheduleLog.filter((entry) => entry.callback.includes("applyRayhanEventVote"));
  assert.strictEqual(voteTimers.length, 7, "single chained timer must be scheduled once per start/resume and only after each vote");
  assert(voteTimers.every((entry) => entry.delay >= 3000 && entry.delay <= 4000), "every chained Event vote timer must be 3-4 seconds");
  assert(wrong.event.crowd.scriptedVoteAt.every((at, index, list) => index === 0 || at - list[index - 1] >= 3000), "event votes must be delayed at least three seconds");
  assert(wrong.event.crowd.scriptedVoteAt.every((at, index, list) => index === 0 || at - list[index - 1] <= 4000), "event vote delays must be at most four seconds: " + JSON.stringify(wrong.event.crowd.scriptedVoteAt));
  assert(wrong.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав! готов?"), "wrong-answer chat line missing");
  assert.strictEqual(wrong.chat.filter((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав! готов?").length, 1, "wrong-answer chat line duplicated");
  assert.strictEqual(wrong.timeline.filter((entry) => entry[0] === "system" && entry[1] === "Толпа решает.").length, 1, "system line duplicated or missing");
  assert(wrong.timeline.findIndex((entry) => entry[0] === "chat" && entry[1] === "хааа ответ мимо! ща толпа решит кто из нас прав! готов?") < wrong.timeline.findIndex((entry) => entry[0] === "system" && entry[1] === "Толпа решает."), "system line must follow Rayhan chat line");
  assert(wrong.eventUnlocks.includes("expanded"), "events panel must unlock and expand");
  assert.strictEqual(wrong.state.me.points, 2, "Rayhan must transfer exactly two points after event win");
  assert.strictEqual(wrong.state.players.npc_stage7_ken.points, 8, "Rayhan must fund the two-point reward");
  assert.deepStrictEqual(wrong.game.__D.toastLog.map((entry) => [entry.kind, entry.delta]).sort(), [["points", 2], ["rep", 1]].sort());
  assert.strictEqual(wrong.event.resolved, true, "Rayhan event must resolve");
  assert.strictEqual(wrong.state.flags.stage715EventsPanelRevealed, true, "Events must remain visible after resolution");
  assert.strictEqual(wrong.eventResolutions(), 1, "Rayhan event must resolve exactly once");
  assert.strictEqual(wrong.battleWins(), 1, "the generic battle win finalizer must run exactly once after Event resolution");
  assert.strictEqual(wrong.genericCrowdStarts.filter((entry) => entry.battleId === wrong.battle.id).length, 0, "the Events path must never start generic battle crowd ownership");
  assert.strictEqual(wrong.battle.crowd, null, "resolved Rayhan event must not leave a battle crowd or cap");
  assert.doesNotMatch(JSON.stringify(wrong.battle), /\b\d+\/10\b/, "effective Rayhan battle state must never render an x/10 tally");
  assert(!["Ничья", "Поражение", "Реванш", "Закрыть"].some((text) => String(wrong.battle.resultLine || "").includes(text)), "generic result, rematch, loss, and close controls must not be introduced");
  assert(!wrong.game.__D.moneyLog.some((entry) => entry.sourceId === "me" && entry.targetId === "npc_stage7_ken"), "Rayhan wrong-answer path must not apply generic loss economy");
  assert.strictEqual(wrong.battle.meta.stage715RayhanRewardApplied, true, "canonical Rayhan reward must be marked applied once");
  assert.strictEqual(wrong.chat.filter((entry) => entry.text === "ладно ладно, я понял, не ори. смари у тебя репутация выросла, денежек больше стало и победа первая появилась. кликни по этим “+1” чтоб не мусорили экран, заодно посмотри чо там в меню и дай знать когда закончишь").length, 1, "canonical Rayhan post-win chat must appear exactly once");
  assert.strictEqual(wrong.state.flags.stage715DemoPhase, "rayhan_win_waiting_reply", "event resolution must not leave the demo stuck");
  assert.strictEqual(wrong.game.Stage715Demo.handlePlayerMessage("готово"), true, "Rayhan post-win reply must advance the corridor");
    assert.strictEqual(wrong.state.flags.stage715DemoPhase, "nastya_prompt", "the existing Nastya prompt must precede her battle");
  wrong.advance(30000);
    assert.strictEqual(wrong.state.flags.stage715DemoPhase, "nastya_battle", "Nastya battle must start after its existing prompt delay");
  assert.strictEqual(wrong.chat.filter((entry) => entry.text === "Так, я не поняла, это что за беспредел тут?? Тестер, проблем чтоли захотелось? Бегом в Споры!").length, 1, "Nastya trigger must be emitted once with the current battle label");
  assert.strictEqual(wrong.battle.meta.stage715RayhanEventStartSequence, true, "Rayhan event start sequence must remain single-shot");
  const ordinaryBattle = { id: "ordinary_draw", opponentId: "npc_voter_1", status: "draw", result: "draw", draw: true, crowd: { cap: 10, voters: {}, votesA: 0, votesB: 0, decided: false } };
  wrong.state.battles.push(ordinaryBattle);
  wrong.game.Conflict.startCrowdVote(ordinaryBattle.id);
  assert(wrong.genericCrowdStarts.some((entry) => entry.battleId === ordinaryBattle.id), "ordinary non-Stage7.15 crowd behavior must remain enabled");
  wrong.game.Stage715Demo.destroy();
  }
  const supportedPrefixes = new Set();
  for (let swap3 = 0; swap3 < 4; swap3 += 1) {
    for (let swap2 = 0; swap2 < 3; swap2 += 1) {
      for (let swap1 = 0; swap1 < 2; swap1 += 1) {
        const draws = [(swap3 + 0.25) / 4, (swap2 + 0.25) / 3, (swap1 + 0.25) / 2];
        const permutation = runScenario("canon_where", false);
        // Event vote intervals are selected before the sequence; reserve those RNG calls
        // so the deterministic values below exercise the actual production generator.
        permutation.setRandomValues([0.37, 0.37, 0.37, 0.37, 0.37].concat(draws));
        assert.strictEqual(permutation.game.Stage715Demo.handlePlayerMessage("готово"), true);
        permutation.advance(30000);
        const event = permutation.state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
        assert(event, "every supported production shuffle must create the scripted Event");
        const sequence = event.crowd.scriptedVoteSequence;
        assert.strictEqual(sequence[4], "a", "every allowed shuffle reserves the fifth vote for the player");
        assert.strictEqual(sequence.slice(0, 4).filter((side) => side === "a").length, 2, "every allowed shuffle has two player votes in its first four");
        assert.strictEqual(sequence.slice(0, 4).filter((side) => side === "b").length, 2, "every allowed shuffle has two Rayhan votes in its first four");
        assert.strictEqual(event.crowd.aVotes, 3);
        assert.strictEqual(event.crowd.bVotes, 2);
        supportedPrefixes.add(sequence.slice(0, 4).join(""));
        permutation.game.Stage715Demo.destroy();
      }
    }
  }
  assert.strictEqual(supportedPrefixes.size, 6, "all six distinct 2:2 vote prefixes must be reachable: " + JSON.stringify(Array.from(supportedPrefixes)));
  console.log("PASS_STAGE7_15_RAYHAN_EVENTS_FIRST");
})();
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
# The DOM regression is intentionally a separate test: it requires the browser runtime.
print("PASS_STAGE7_15_RAYHAN_EVENTS_FIRST_CONTRACT")
