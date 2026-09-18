from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
CORE_DEPLOYED = ROOT / "docs/conflict/conflict-core.js"
API = ROOT / "AsyncScene/Web/conflict/conflict-api.js"
API_DEPLOYED = ROOT / "docs/conflict/conflict-api.js"
CONTROLLER = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
CONTROLLER_DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


core = CORE.read_bytes()
core_deployed = CORE_DEPLOYED.read_bytes()
api = API.read_bytes()
api_deployed = API_DEPLOYED.read_bytes()
controller = CONTROLLER.read_bytes()
controller_deployed = CONTROLLER_DEPLOYED.read_bytes()

require("function applyScriptedNastyaVote(b, v)" in core.decode("utf-8") and
        "function applyScriptedNastyaVote(b, v)" in core_deployed.decode("utf-8"),
        "crowd core scripted vote wiring is not mirrored")
require('if (battle.meta && battle.meta.stage715NastyaVote) return 0;' in api.decode("utf-8") and
        'if (battle.meta && battle.meta.stage715NastyaVote) return 0;' in api_deployed.decode("utf-8"),
        "crowd API scripted vote guard is not mirrored")
require(controller == controller_deployed, "Stage 7.15 controller mirrors differ")

core_js = core.decode("utf-8")
api_js = api.decode("utf-8")
controller_js = controller.decode("utf-8")

for text in (
    "function applyScriptedNastyaVote(b, v)",
    "b.meta.stage715NastyaVote",
    "v._stage715NastyaVoteApplied",
    'v.stage715VoteOwner = "stage715_nastya"',
    "applyScriptedNastyaVote(b, b.crowd)",
    "stage715NastyaVote: { a: 2, b: 3, cap: 5 }",
    "function handleNastyaDefenseChoice(battleId, choiceId)",
    "battle.meta.stage715NastyaVote = { a: 2, b: 3, cap: 5 }",
    'capSource = "stage715_nastya"',
    "const crowdActive = battle.crowd && !battle.crowd.decided",
):
    require(text in core_js or text in controller_js, f"missing scripted Nastya vote contract: {text}")

require('if (battle.meta && battle.meta.stage715NastyaVote) return 0;' in api_js,
        "generic NPC vote generator must not own the scripted Nastya vote")
require(core_js.count("v._stage715NastyaVoteApplied = true;") == 1,
        "scripted Nastya votes must apply exactly once")
require('v.votesA = votesA;' in core_js and 'v.votesB = votesB;' in core_js,
        "scripted Nastya tally must remain stable across renders")
require('v.cap = votesA + votesB;' in core_js,
        "scripted Nastya vote must use its canonical five-vote cap")
require('v.stage715VoteOwner = "stage715_nastya"' in core_js,
        "scripted Nastya vote must record deterministic ownership")

print("PASS_STAGE7_15_23_NASTYA_CROWD_VOTE_CONTRACT")
