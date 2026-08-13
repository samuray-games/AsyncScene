import fs from "node:fs";
import vm from "node:vm";

const require = (condition, message) => {
  if (!condition) throw new Error(message);
};

class MemoryStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return Array.from(this.map.keys())[index] || null; }
  getItem(key) { return this.map.has(String(key)) ? this.map.get(String(key)) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const documentListeners = new Map();
const windowListeners = new Map();
const addListener = (store, type, fn) => {
  const rows = store.get(type) || [];
  rows.push(fn);
  store.set(type, rows);
};

const startScreen = {
  nodeType: 1,
  parentElement: null,
  id: "startScreen",
  hidden: false,
  classList: { contains: () => false },
  getAttribute(name) { return name === "aria-hidden" ? null : null; },
};

const document = {
  hidden: false,
  readyState: "complete",
  documentElement: {},
  addEventListener(type, fn) { addListener(documentListeners, type, fn); },
  getElementById(id) { return id === "startScreen" ? startScreen : null; },
  querySelectorAll() { return []; },
};

let fetchCalls = 0;
const fetchBodies = [];
let failNextFetch = false;
const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();
sessionStorage.setItem("AsyncScene_behavioral_telemetry_session_v1", JSON.stringify({
  sessionId: "session:prior",
  createdAt: Date.now() - 5000,
  ended: false,
}));
localStorage.setItem("AsyncScene_behavioral_telemetry_active_sessions_v1", JSON.stringify({
  schemaVersion: 1,
  sessions: {
    "session:prior": {
      schemaVersion: 1,
      sessionId: "session:prior",
      pageViewId: "page:prior",
      lastSeenAt: Date.now() - 5000,
      lastScreenId: "stage7.questionnaire",
      lastQuestionId: "q0",
      lastCycleId: "stage7.round_two",
      ended: false,
    },
  },
}));
const sandbox = {
  console,
  Date,
  Math,
  JSON,
  URL,
  Set,
  Map,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Uint32Array,
  setTimeout,
  clearTimeout,
  document,
  navigator: { onLine: true },
  MutationObserver: class { observe() {} },
  performance: { now: (() => { let value = 0; return () => ++value; })() },
  crypto: { randomUUID: (() => { let value = 0; return () => `00000000-0000-4000-8000-${String(++value).padStart(12, "0")}`; })() },
  localStorage,
  sessionStorage,
  location: { origin: "https://samuray-games.github.io" },
  getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" }),
  fetch: async (_url, options) => {
    fetchCalls += 1;
    fetchBodies.push(JSON.parse(options.body));
    if (failNextFetch) {
      failNextFetch = false;
      return { ok: false, status: 503 };
    }
    return { ok: true, status: 202 };
  },
};
sandbox.window = sandbox;
sandbox.window.Game = {};
sandbox.window.addEventListener = (type, fn) => addListener(windowListeners, type, fn);
sandbox.window.location = sandbox.location;

const source = fs.readFileSync(new URL("../AsyncScene/Web/telemetry.js", import.meta.url), "utf8");
vm.runInNewContext(source, sandbox, { filename: "telemetry.js" });

const telemetry = sandbox.window.Game.Telemetry;
require(telemetry && telemetry.schemaVersion === 1, "Game.Telemetry v1 missing");
require(telemetry.inspect().transportEnabled === false, "network transport must default off");
require(fetchCalls === 0, "default runtime transmitted telemetry");

const button = {
  id: "btnStart",
  closest() { return this; },
  getAttribute(name) {
    if (name === "data-telemetry-action" || name === "data-stage7-action" || name === "data-action" || name === "data-testid") return null;
    return null;
  },
};
for (const handler of documentListeners.get("click") || []) handler({ target: button });
telemetry.choiceSelected({ flowId: "argument_battle", stateId: "pickAttack", choiceId: "deny", battleId: "battle-1" });
telemetry.stateChanged({ flowId: "stage7", fromStateId: "answer", toStateId: "reaction" });
telemetry.questionShown({ flowId: "stage7", questionId: "q1" });
telemetry.action("question.context.probe");

document.hidden = true;
for (const handler of documentListeners.get("visibilitychange") || []) handler({});
document.hidden = false;
for (const handler of documentListeners.get("visibilitychange") || []) handler({});

telemetry.questionAnswered({ flowId: "stage7", questionId: "q1", answerId: "b" });
telemetry.action("privacy.probe", {
  safeId: "kept",
  note: "NEVER STORE FREE FORM",
  text: "NEVER_STORE_THIS_SECRET_TEXT",
  inputValue: "NEVER_STORE_THIS_INPUT",
  url: "https://example.invalid/private",
});

let exported = telemetry.export();
const serialized = JSON.stringify(exported);
require(exported.privacy.networkTransmissionEnabled === false, "export reports default network enabled");
require(!serialized.includes("NEVER_STORE_THIS_SECRET_TEXT"), "player-authored text leaked into telemetry");
require(!serialized.includes("NEVER_STORE_THIS_INPUT"), "input value leaked into telemetry");
require(!serialized.includes("example.invalid"), "URL leaked into telemetry");
require(!serialized.includes("NEVER STORE FREE FORM"), "free-form value leaked into telemetry");

const types = new Set(exported.events.map((event) => event.type));
for (const expected of [
  "session_start", "screen_enter", "button_click", "choice_selected", "state_changed",
  "question_shown", "visibility_hidden", "visibility_visible", "abandon", "return", "question_answered", "action",
]) {
  require(types.has(expected), `missing runtime event ${expected}`);
}

const click = exported.events.find((event) => event.type === "button_click");
require(click.payload.actionId === "btnStart", "stable button action id missing");
require(Number.isFinite(click.payload.firstActionMs), "first action timing missing");

const choice = exported.events.find((event) => event.type === "choice_selected");
require(choice.payload.battleId === "battle-1", "battle decision context missing");

const abandoned = exported.events.find((event) => event.type === "abandon");
require(abandoned.payload.questionId === "q0" && abandoned.payload.cycleId === "stage7.round_two", "abandonment context missing");

const contextProbe = exported.events.find((event) => event.payload.actionId === "question.context.probe");
require(contextProbe.context.questionId === "q1", "active question context missing");

const answer = exported.events.find((event) => event.type === "question_answered");
require(answer.payload.questionId === "q1" && answer.payload.answerId === "b", "question answer IDs missing");
require(Number.isFinite(answer.payload.foregroundDwellMs), "question foreground dwell missing");

for (let index = 0; index < 1010; index += 1) telemetry.action(`bounded.${index}`);
exported = telemetry.export();
require(exported.events.length <= 1000, "bounded event queue exceeded 1000 events");

await telemetry.flush();
require(fetchCalls === 0, "manual flush bypassed disabled transport");
require(telemetry.summary().eventCount === exported.events.length, "summary/readback count mismatch");

const oldIdentity = telemetry.inspect().anonymousId;
const newIdentity = telemetry.rotateIdentity();
require(oldIdentity !== newIdentity, "identity rotation failed");
require(telemetry.export().events.length === 0, "identity rotation did not clear prior events");

sandbox.__ASYNCHRONIA_TELEMETRY_TRANSPORT__ = {
  enabled: true,
  mode: "private_friends_alpha",
  cohortId: "private_friends_alpha_2026_08",
  endpoint: "https://receiver.test/v1/events",
  endpointOrigin: "https://receiver.test",
};
for (let index = 0; index < 55; index += 1) telemetry.action(`batch.${index}`);
const firstFlush = telemetry.flush();
const concurrentFlush = telemetry.flush();
require(firstFlush === concurrentFlush, "concurrent flushes were not deduplicated");
const firstBatch = await firstFlush;
require(firstBatch.ok === true && firstBatch.sent === 50 && fetchCalls === 1, "first bounded batch failed");
require(fetchBodies[0].contractVersion === 1, "receiver contract version missing");
require(fetchBodies[0].mode === "private_friends_alpha", "private alpha mode missing");
require(fetchBodies[0].cohortId === "private_friends_alpha_2026_08", "cohort id missing");
require(fetchBodies[0].events.length === 50, "first receiver batch was not bounded");
const secondBatch = await telemetry.flush();
require(secondBatch.ok === true && secondBatch.sent === 5 && fetchCalls === 2, "second bounded batch failed");

telemetry.action("batch.retry");
failNextFetch = true;
const failedBatch = await telemetry.flush();
require(failedBatch.ok === false && failedBatch.retryAttempt === 1, "failed batch did not enter bounded retry");
const failedBatchId = fetchBodies[2].batchId;
const retriedBatch = await telemetry.flush();
require(retriedBatch.ok === true && retriedBatch.sent === 1, "failed batch did not recover");
require(fetchBodies[3].batchId === failedBatchId, "retry changed the durable batch id");

telemetry.setScreen("stage7.questionnaire", "test");
telemetry.questionShown({ flowId: "stage7", questionId: "q-terminal" });
telemetry.startCycle({ flowId: "stage7", cycleId: "stage7.round_two" });
telemetry.finish("test_end");
const sessionEnd = telemetry.getEvents().find((event) => event.type === "session_end");
require(sessionEnd.payload.screenId === "stage7.questionnaire", "session end screen context missing");
require(sessionEnd.payload.questionId === "q-terminal" && sessionEnd.payload.cycleId === "stage7.round_two", "session end flow context missing");

console.log("PASS_BEHAVIORAL_TELEMETRY_RUNTIME");
