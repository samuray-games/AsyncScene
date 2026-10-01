#!/usr/bin/env python3
"""Deterministic contract tests for the ordinary Events adapter."""

import json
import os
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class GenericEventsContractTest(unittest.TestCase):
    def test_stage715_rayhan_event_is_excluded_from_generic_vote_tick(self):
        source = (ROOT / "AsyncScene/Web/events.js").read_text(encoding="utf-8")
        script = r"""
const vm = require('vm');
const players = {};
for (const [index, id] of ['rayhan_actor', 'rayhan_npc', 'voter1', 'voter2', 'voter3', 'voter4', 'voter5'].entries()) {
  players[id] = { id, name: id, npc: true, role: 'crowd', points: 10, influence: index < 2 ? 1 : 0 };
}
const state = { me: { id: 'me', points: 1 }, players, battles: [], events: [] };
const Game = {
  __S: state,
  __A: { upsertEvent: (event) => event },
  __D: {},
  _ConflictEconomy: { transferPoints: () => ({ ok: true }) },
  Time: { now: () => 123456 },
  UI: { requestRenderAll() {}, isPanelCollapsed: () => false, pushSystem() {} },
  Util: { pick: (items) => items[0] },
};
const context = { console, Date, Math, setTimeout: () => 0, clearTimeout() {}, window: { Game } };
vm.runInNewContext(process.env.EVENTS_SOURCE, context);
const Events = Game.Events;
const makeDraw = (id, stage715 = false) => ({
  id, type: 'draw', kind: 'draw', state: 'open', aId: 'rayhan_actor', bId: 'rayhan_npc',
  aName: 'Игрок', bName: 'Райхан', aInf: 1, bInf: 1, createdAt: 123456,
  endsAt: 900000, resultLine: '', stage715RayhanEvent: stage715,
  crowd: { cap: 5, voters: {}, votesA: 0, votesB: 0, aVotes: 0, bVotes: 0, nextNpcVoteAt: 0,
    endAt: 900000, eligibleNpcCount: 5, alreadyVotedCount: 0, decided: false, winner: null },
});
const scripted = makeDraw('stage715_scripted', true);
Events.addEvent(scripted);
Events.tick();
if (Object.keys(scripted.crowd.voters).length !== 0) throw new Error('Stage 7.15 votes were taken by generic Events tick');
console.log('PASS_STAGE715_EVENT_OWNER_GUARD');
""";
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            env={**os.environ, "EVENTS_SOURCE": source},
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("PASS_STAGE715_EVENT_OWNER_GUARD", result.stdout)

    def test_generic_event_lifecycle_identity_and_persistence_boundary(self):
        source = (ROOT / "AsyncScene/Web/events.js").read_text(encoding="utf-8")
        script = r"""
const vm = require('vm');
const source = process.env.EVENTS_SOURCE;
const context = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  Date,
  Math,
  window: { Game: {
    __S: { events: [], players: {} },
    __A: { upsertEvent: (event) => { context.window.Game.__S.events.unshift(event); return event; } },
    Util: { pick: (items) => items[0] },
    Data: {},
    Time: { now: () => 123456 },
    UI: { isPanelCollapsed: () => false },
  } },
};
vm.runInNewContext(source, context, { filename: 'events.js' });
const Events = context.window.Game.Events;
const definition = {
  id: 'fixture.ordinary.signal',
  category: 'ordinary',
  display: { title: 'Internal fixture', body: 'Not canonical content' },
  actions: [
    { id: 'observe', label: 'Observe', resolution: { outcome: 'observed' } },
    { id: 'dismiss', label: 'Dismiss', resolution: { outcome: 'dismissed' } },
  ],
};
const first = Events.instantiateGenericEvent(definition, 'trigger-17');
const duplicate = Events.instantiateGenericEvent(definition, 'trigger-17');
if (!first || first !== duplicate) throw new Error('identity dedup failed');
if (first.id !== 'ordinary_66_69_78_74_75_72_65_2e_6f_72_64_69_6e_61_72_79_2e_73_69_67_6e_61_6c__74_72_69_67_67_65_72_2d_31_37') throw new Error('unstable identity');
if (first.category !== 'ordinary' || first.type !== 'ordinary') throw new Error('ordinary category missing');
if (!Array.isArray(first.actions) || first.actions.length !== 2) throw new Error('generic actions missing');
if (Events.instantiateGenericEvent(definition, 'trigger-18').id === first.id) throw new Error('instance collision');
const resolved = Events.resolveGenericAction(first.id, 'observe');
if (!resolved || resolved.state !== 'resolved' || resolved.completed !== true || resolved.selectedActionId !== 'observe') throw new Error('generic resolution failed');
if (resolved.resolution.outcome !== 'observed') throw new Error('wrong deterministic resolution');
if ('money' in resolved || 'rep' in resolved || 'wins' in resolved || 'reward' in resolved || 'penalty' in resolved) throw new Error('economy side effect field');
const wire = JSON.stringify(Events.serializeGenericEvent(resolved));
context.window.Game.__S.events = [];
const restored = Events.restoreGenericEvent(JSON.parse(wire));
if (!restored || restored.id !== resolved.id || restored.state !== 'resolved' || restored.completed !== true) throw new Error('persistence restore failed');
if (Events.restoreGenericEvent(JSON.parse(wire)) !== restored) throw new Error('restore replay dedup failed');
const tampered = JSON.parse(wire);
tampered.id = 'ordinary_tampered';
if (Events.restoreGenericEvent(tampered) !== null) throw new Error('tampered identity accepted');
if (Events.createGenericEvent({ id: 'duplicate', category: 'ordinary', actions: [{ id: 'same' }, { id: 'same' }] }, 'x') !== null) throw new Error('duplicate action accepted');
if (Events.createGenericEvent({ id: 'economy', category: 'ordinary', actions: [{ id: 'x', resolution: { money: 1 } }] }, 'x') !== null) throw new Error('economy resolution accepted');
console.log(JSON.stringify({ id: restored.id, identityKey: restored.identityKey, state: restored.state, completed: restored.completed, eventCount: context.window.Game.__S.events.length }));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            env={**os.environ, "EVENTS_SOURCE": source},
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["eventCount"], 1)
        self.assertEqual(report["state"], "resolved")
        self.assertTrue(report["completed"])

    def test_no_first_event_canonical_content_in_source_or_fixture(self):
        source = (ROOT / "AsyncScene/Web/events.js").read_text(encoding="utf-8")
        self.assertNotIn("First Event", source)
        self.assertNotIn("stage715FirstEvent", source)
        self.assertNotIn("stage715FirstEvent", source)


if __name__ == "__main__":
    unittest.main()
