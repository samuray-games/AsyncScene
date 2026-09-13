#!/usr/bin/env python3
"""Deterministic contract tests for the ordinary Events adapter."""

import json
import os
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class GenericEventsContractTest(unittest.TestCase):
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
