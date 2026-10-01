from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
CORE_DOCS = ROOT / "docs/conflict/conflict-core.js"
CONTROLLER = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
UI = ROOT / "AsyncScene/Web/ui/ui-battles.js"

source = CORE.read_text(encoding="utf-8")
controller = CONTROLLER.read_text(encoding="utf-8")
ui = UI.read_text(encoding="utf-8")
assert CORE.read_bytes() == CORE_DOCS.read_bytes(), "core source/deployed mirror mismatch"
assert 'if (battle.meta && battle.meta.stage715NastyaVote) return 0;' in (ROOT / "AsyncScene/Web/conflict/conflict-api.js").read_text(encoding="utf-8")
assert 'state.flags.stage715NastyaWon = true;' not in source[source.index("function startCrowdVoteTimer"):source.index("C.startWith =")]
assert 'outcome !== "win"' in controller[controller.index("function revealNastyaBattle"):controller.index("function syncNastyaBattleOutcome")]
assert 'Тебя поддержало большинство.' in controller
assert 'Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?' in controller
assert 'finalLine.textContent = b.result === "win" ? "Победа!" : "";' in ui

# Execute the real private vote function against a deterministic clock. This
# keeps the regression focused on actual one-at-a-time behavior and intervals.
start = source.index("  function applyScriptedNastyaVote(b, v){")
end = source.index("\n  function finalizeEscapeVote", start)
vote_function = source[start:end]
node_test = r'''
const vm = require("vm");
const assert = require("assert");
let now = 10000;
class FakeDate extends Date { static now() { return now; } }
const context = { Date: FakeDate, Math: Object.create(Math), getCrowdTotalVotes(v) { return Object.keys(v.voters || {}).length; } };
context.Math.random = () => 0;
vm.createContext(context);
vm.runInContext(process.argv[1] + "\nthis.vote = applyScriptedNastyaVote;", context);
const battle = { meta: { stage715NastyaVote: { a: 2, b: 3, cap: 5 }, stage715NastyaCrowdStarted: true } };
const crowd = { voters: {}, votesA: 0, votesB: 0, cap: 5, decided: false };
assert.strictEqual(context.vote(battle, crowd), false, "first vote must wait for its own delay");
assert.strictEqual(Object.keys(crowd.voters).length, 0, "no vote may appear at start");
for (let index = 0; index < 5; index += 1) {
  now += 1000;
  const before = Object.keys(crowd.voters).length;
  assert.strictEqual(context.vote(battle, crowd), true, "one due scripted vote must be applied");
  assert.strictEqual(Object.keys(crowd.voters).length, before + 1, "a tick must add exactly one visible vote");
  assert(crowd.stage715VoteIntervals.at(-1) >= 1000 && crowd.stage715VoteIntervals.at(-1) <= 2000, "each vote delay must be 1-2 seconds");
}
assert.strictEqual(crowd.votesA, 2);
assert.strictEqual(crowd.votesB, 3);
assert.strictEqual(crowd.cap, 5);
assert.strictEqual(crowd.stage715VoteIntervals.length, 5, "there must be exactly one independent interval per vote");
assert(crowd.stage715VoteIntervals.every((delay) => delay >= 1000 && delay <= 2000), "every vote interval must be 1-2 seconds");
assert.strictEqual(crowd.stage715VoteOwner, "stage715_nastya");
assert.strictEqual(context.vote(battle, crowd), false, "no sixth vote may be added");
console.log("PASS_STAGE7_15_24_NASTYA_VOTE_TIMING");
'''
subprocess.run(["node", "-e", node_test, vote_function], cwd=ROOT, check=True)

# Demonstrate that this exact executable contract goes red on the requested
# authoritative baseline for the behavioral bulk-vote defect.
baseline = subprocess.run(
    ["git", "show", "c9f1b4e34f02111d8c7bf7508e2c9f8c08ff5751:AsyncScene/Web/conflict/conflict-core.js"],
    cwd=ROOT, check=True, capture_output=True, text=True,
).stdout
baseline_start = baseline.index("  function applyScriptedNastyaVote(b, v){")
baseline_end = baseline.index("\n  function finalizeEscapeVote", baseline_start)
red = subprocess.run(
    ["node", "-e", node_test, baseline[baseline_start:baseline_end]],
    cwd=ROOT, capture_output=True, text=True,
)
assert red.returncode != 0 and "first vote must wait for its own delay" in red.stderr, (
    "the regression must expose baseline bulk voting, not pass on the authoritative baseline"
)
print("RED_CONFIRMED_C9F1B4E_BULK_NASTYA_VOTE")
