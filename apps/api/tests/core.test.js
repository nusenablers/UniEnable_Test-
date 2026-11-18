import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { priorityScore, sortActivities, validateActivity } from '../src/services/activities.js';
import { findRoute } from '../src/services/routes.js';
import { summarizeReadings, validateReading } from '../src/sensors/algorithm.js';
import { createSeed } from '../src/db.js';
import { MockSensorAdapter, HardwareSensorAdapter } from '../src/sensors/adapter.js';
import { createServer } from '../src/server.js';

test('Java CLI priority: urgency² × (importance + commitment)', () => {
  assert.equal(priorityScore({ urgency: 5, importance: 4, commitment: 4 }), 200);
  assert.equal(priorityScore({ urgency: 5, importance: null, commitment: 4 }), null);
});
test('date and demand order with missing priority last', () => {
  const examples = createSeed().activities;
  assert.equal(sortActivities(examples, 'priority').at(-1).id, 'act-2');
  assert.equal(sortActivities(examples, 'demand')[0].demand, 'HIGH');
});
test('activity input rejects invalid date, zero ratings and reversed time', () => {
  const valid = { name: 'Review', date: '2026-12-01', startTime: '09:00', endTime: '10:00', demand: 'LOW' };
  assert.equal(validateActivity(valid), null);
  assert.match(validateActivity({ ...valid, date: '2026-02-30' }), /Date/);
  assert.match(validateActivity({ ...valid, urgency: 0 }), /urgency/);
  assert.match(validateActivity({ ...valid, endTime: '08:00' }), /End time/);
});
test('unknown and stairs edges never count as verified; demo route is visibly marked', () => {
  const data = createSeed();
  const demo = findRoute(data.facilities, data.connections, 'hub-a', 'hub-c', { demo: true });
  assert.equal(demo.found, true);
  assert.deepEqual(demo.nodes, ['hub-a','hub-b','hub-c']);
  assert.equal(demo.distanceMetres, 320);
  assert.equal(findRoute(data.facilities, data.connections, 'hub-a', 'hub-c').found, false);
  assert.equal(findRoute(data.facilities, data.connections, 'hub-a', 'hub-a').found, false);
  assert.equal(findRoute(data.facilities, data.connections, 'hub-a', 'hub-d', { demo: true }).found, false);
});
test('sensor EWMA and opt-in validation', () => {
  const readings = [ {sensorType:'light_lux', value:10, timestamp:'2026-11-01T00:00:00Z'}, {sensorType:'light_lux', value:20, timestamp:'2026-11-01T00:01:00Z'} ];
  assert.equal(summarizeReadings(readings)[0].ewma, 13);
  assert.match(validateReading({ ...readings[0], source: 'simulator' }), /consent/);
});
test('verified routing excludes unknown traversal types, invalid links and unreviewed intermediate facilities', () => {
  const facilities = [
    { id: 'start', evidenceStatus: 'VERIFIED' }, { id: 'end', evidenceStatus: 'VERIFIED' },
    { id: 'between', evidenceStatus: 'VERIFIED' }, { id: 'unreviewed', evidenceStatus: 'UNKNOWN' }
  ];
  const link = { from: 'start', to: 'end', evidenceStatus: 'VERIFIED', accessibility: 'YES', traversalType: 'PATH', distanceMetres: 1 };
  const invalid = [
    { ...link, traversalType: 'UNKNOWN' }, { ...link, traversalType: 'STAIRS' },
    { ...link, traversalType: 'TYPO' }, { ...link, evidenceStatus: 'DEMO_ONLY', demoPassable: true },
    { ...link, traversalType: undefined }, { ...link, distanceMetres: -1 },
    { ...link, accessibility: 'UNKNOWN' }, { ...link, to: 'unreviewed' },
    { ...link, from: 'unreviewed' }, { ...link, distanceMetres: Infinity }, { ...link, to: 'missing' }
  ];
  assert.equal(findRoute(facilities, invalid, 'start', 'end').found, false);
  const valid = [
    { ...link, to: 'between', distanceMetres: 10 },
    { ...link, from: 'between', distanceMetres: 20, traversalType: 'RAMP' }
  ];
  const route = findRoute(facilities, [...invalid, ...valid], 'end', 'start');
  assert.deepEqual(route.nodes, ['end', 'between', 'start']);
  assert.equal(route.distanceMetres, 30);
  const suspiciousDemo = { ...link, evidenceStatus: 'DEMO_ONLY', demoPassable: true, traversalType: 'UNKNOWN' };
  assert.equal(findRoute(facilities, [suspiciousDemo], 'start', 'end', { demo: true }).found, false);
});
test('mock adapter captures fixtures; physical adapter is explicitly unavailable', async () => {
  const adapter = new MockSensorAdapter();
  await assert.rejects(adapter.readOnce(), /not connected/);
  await adapter.connect();
  const samples = await adapter.readOnce();
  assert.equal(samples.length, 4);
  assert.ok(samples.every((sample) => sample.source === 'simulator' && validateReading(sample) === null));
  await adapter.disconnect();
  await assert.rejects(adapter.readOnce(), /not connected/);
  const hardware = new HardwareSensorAdapter();
  await assert.rejects(hardware.connect(), /TODO/);
  await assert.rejects(hardware.readOnce(), /TODO/);
  await hardware.disconnect();
});
test('HTTP endpoints start, persist an activity and refuse real route from dummy graph', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'unienabler-test-'));
  const old = process.env.DEV_DB_PATH;
  process.env.DEV_DB_PATH = path.join(directory, 'db.json');
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await (await fetch(`${base}/api/health`)).json()).ok, true);
    const route = await (await fetch(`${base}/api/routes?from=hub-a&to=hub-c`)).json();
    assert.equal(route.found, false);
    const create = await fetch(`${base}/api/activities`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name:'Test',date:'2026-12-01',startTime:'10:00',endTime:'11:00',demand:'LOW' }) });
    assert.equal(create.status, 201);
    const list = await (await fetch(`${base}/api/activities`)).json();
    assert.equal(list.items.length, 4);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (old === undefined) delete process.env.DEV_DB_PATH; else process.env.DEV_DB_PATH = old;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
