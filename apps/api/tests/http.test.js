import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createServer } from '../src/server.js';

let server;
let directory;
let base;
let database;

async function start() {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
}

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'unienabler-http-'));
  database = path.join(directory, 'db.json');
  process.env.DEV_DB_PATH = database;
  delete process.env.ENABLE_DEV_RESET;
  await start();
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
});

async function call(route, status, method = 'GET', payload) {
  const response = await fetch(base + route, {
    method,
    headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload)
  });
  const body = status === 204 ? await response.text() : await response.json();
  assert.equal(response.status, status, method + ' ' + route + ' ' + JSON.stringify(body));
  if (status >= 400) assert.equal(typeof body.error, 'string');
  return { body, headers: response.headers };
}

const activity = {
  name: 'Practice presentation', date: '2028-02-29', startTime: '10:00', endTime: '11:00',
  demand: 'LOW', importance: 4, urgency: 5, commitment: 3
};
const survey = { facilityId: 'hub-a', featureType: 'RAMP', observedStatus: 'YES', evidenceNote: 'Synthetic observation' };
const reading = {
  sensorType: 'light_lux', value: 10, timestamp: '2026-11-18T11:00:00.000Z',
  source: 'simulator', consent: true
};

test('health, CORS preflight and unknown endpoint use the documented response shape', async () => {
  assert.deepEqual((await call('/api/health', 200)).body, {
    ok: true, name: 'UniEnabler 2.0 demo API', demo: true
  });
  const { headers, body } = await call('/api/activities/act-1', 204, 'OPTIONS');
  assert.equal(body, '');
  assert.equal(headers.get('access-control-allow-origin'), '*');
  assert.match(headers.get('access-control-allow-methods'), /PATCH/);
  await call('/api/unknown', 404);
});

test('activity add, complete, uncomplete and delete use a stable ID and compute priority', async () => {
  const { item } = (await call('/api/activities', 201, 'POST', { ...activity, name: '  Practice presentation  ' })).body;
  assert.equal(item.name, activity.name);
  assert.equal(item.completed, false);
  assert.equal((await call('/api/activities/' + item.id, 200, 'PATCH', { completed: true })).body.item.completed, true);
  assert.equal((await call('/api/activities/' + item.id, 200, 'PATCH', { completed: false })).body.item.completed, false);
  const { items } = (await call('/api/activities?order=priority', 200)).body;
  assert.equal(items.find((entry) => entry.id === item.id).priorityScore, 175);
  assert.equal(items.at(-1).priorityScore, null);
  assert.deepEqual((await call('/api/activities/' + item.id, 200, 'DELETE')).body, { deleted: true });
  assert.equal((await call('/api/activities', 200)).body.items.some((entry) => entry.id === item.id), false);
});

test('activities sort by date then start time; established demand sort puts HIGH first', async () => {
  const newActivities = [
    { name: 'Later day', date: '2000-01-02', startTime: '09:00', demand: 'MEDIUM' },
    { name: 'Later today', date: '2000-01-01', startTime: '10:00', demand: 'LOW' },
    { name: 'Earlier today', date: '2000-01-01', startTime: '09:00', demand: 'HIGH' }
  ];
  for (const entry of newActivities) await call('/api/activities', 201, 'POST', { ...activity, ...entry });
  const { items } = (await call('/api/activities?order=chronological', 200)).body;
  assert.deepEqual(items.slice(0, 3).map((entry) => entry.name), ['Earlier today', 'Later today', 'Later day']);
  const demand = (await call('/api/activities?order=demand', 200)).body.items;
  assert.deepEqual(demand.map((entry) => entry.demand), ['HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'LOW', 'LOW']);
});

test('invalid activities and unknown IDs leave existing data intact', async () => {
  await call('/api/activities', 200);
  const previous = await readFile(database, 'utf8');
  for (const invalid of [
    {}, '{', [], { ...activity, name: ' ' }, { ...activity, date: '2026-02-29' },
    { ...activity, startTime: '24:00' }, { ...activity, endTime: '09:59' },
    { ...activity, endTime: '10:00' }, { ...activity, demand: 'high' },
    { ...activity, importance: 0 }, { ...activity, urgency: 6 }, { ...activity, commitment: 1.5 }
  ]) await call('/api/activities', 400, 'POST', invalid);
  for (const invalid of ['null', [], '{}', '{', { completed: 'true' }]) {
    await call('/api/activities/act-1', 400, 'PATCH', invalid);
  }
  await call('/api/activities/unknown-id', 404, 'PATCH', { completed: true });
  await call('/api/activities/unknown-id', 404, 'DELETE');
  await call('/api/activities', 413, 'POST', { ...activity, name: 'é'.repeat(17000) });
  assert.equal(await readFile(database, 'utf8'), previous);
});

test('UTF-8 activity names survive a request split within a multibyte character', async () => {
  const payload = Buffer.from(JSON.stringify({ ...activity, name: 'Café practice' }));
  const splitAt = payload.indexOf(0xc3) + 1;
  const result = await new Promise((resolve, reject) => {
    const req = request(base + '/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      res.setEncoding('utf8');
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(payload.subarray(0, splitAt));
    setImmediate(() => req.end(payload.subarray(splitAt)));
  });
  assert.equal(result.status, 201);
  assert.equal(result.data.item.name, 'Café practice');
});

test('facilities and phrases return identified fictional fixtures and display text', async () => {
  const facilities = (await call('/api/facilities', 200)).body;
  assert.equal(facilities.demo, true);
  assert.equal(facilities.items.length, 4);
  assert.ok(facilities.items.every((entry) => entry.name.startsWith('Demo ') && entry.evidenceStatus === 'DEMO_ONLY'));
  const phrases = (await call('/api/phrases', 200)).body;
  assert.equal(phrases.items.length, 5);
  assert.equal(phrases.items[0].text, 'Hello, could you please help me?');
});

test('HTTP verified routing fails closed and the synthetic path has an explicit warning', async () => {
  const query = '/api/routes?from=hub-a&to=hub-c';
  for (const suffix of ['', '&demo=false', '&demo=yes']) {
    const { body } = await call(query + suffix, 200);
    assert.equal(body.found, false);
    assert.equal(body.demo, false);
  }
  const { body } = await call(query + '&demo=true', 200);
  assert.deepEqual(body.nodes, ['hub-a', 'hub-b', 'hub-c']);
  assert.equal(body.distanceMetres, 320);
  assert.equal(body.demo, true);
  assert.match(body.warning, /Synthetic demonstration/);
  assert.equal((await call('/api/routes?from=hub-a&to=hub-d&demo=true', 200)).body.found, false);
  assert.match((await call('/api/routes?from=hub-a&to=absent&demo=true', 200)).body.reason, /Unknown/);
});

test('surveys persist as unverified observations and do not change the route graph', async () => {
  assert.equal((await call('/api/surveys', 200)).body.items.length, 1);
  const { item } = (await call('/api/surveys', 201, 'POST', { ...survey, verificationStatus: 'VERIFIED' })).body;
  assert.equal(item.verificationStatus, 'UNVERIFIED');
  assert.deepEqual((await call('/api/surveys', 200)).body.items.at(-1), item);
  assert.equal((await call('/api/routes?from=hub-a&to=hub-c', 200)).body.found, false);
});

test('invalid surveys and unknown facilities leave existing data intact', async () => {
  await call('/api/surveys', 200);
  const previous = await readFile(database, 'utf8');
  for (const invalid of [
    {}, 'null', '{', [], { ...survey, featureType: ' ' }, { ...survey, facilityId: '' },
    { ...survey, observedStatus: 'VERIFIED' }, { ...survey, evidenceNote: { label: 'invalid' } }
  ]) await call('/api/surveys', 400, 'POST', invalid);
  await call('/api/surveys', 404, 'POST', { ...survey, facilityId: 'missing' });
  assert.equal(await readFile(database, 'utf8'), previous);
});

test('sensor reads honor the limit and summary reports known EWMA and aggregates', async () => {
  assert.deepEqual((await call('/api/sensors/summary', 200)).body.items, []);
  await call('/api/sensors/readings', 201, 'POST', { ...reading, deviceId: 'discard this fixture metadata' });
  const latest = { ...reading, value: 30, timestamp: '2026-11-18T19:01:00+08:00' };
  const { item } = (await call('/api/sensors/readings', 201, 'POST', latest)).body;
  assert.deepEqual((await call('/api/sensors/readings?limit=1', 200)).body.items, [item]);
  const { items } = (await call('/api/sensors/readings', 200)).body;
  assert.equal(items.length, 2);
  assert.equal('deviceId' in items[0], false);
  assert.equal('consent' in items[0], false);
  assert.deepEqual((await call('/api/sensors/summary', 200)).body.items, [{
    sensorType: 'light_lux', count: 2, average: 20, minimum: 10, maximum: 30,
    ewma: 16, lastTimestamp: latest.timestamp, demo: true
  }]);
});

test('sensor validation rejects malformed timestamps, values and consent without storing samples', async () => {
  await call('/api/sensors/readings', 200);
  const previous = await readFile(database, 'utf8');
  for (const invalid of [
    {}, '{', 'null', [], { ...reading, sensorType: 'humidity' }, { ...reading, value: '10' },
    { ...reading, value: 1_000_001 }, { ...reading, value: null }, { ...reading, timestamp: 'today' },
    { ...reading, timestamp: '2026-02-30T10:00:00Z' }, { ...reading, timestamp: '2026-11-18' },
    { ...reading, timestamp: '2026-11-18T11:00:00' }, { ...reading, source: 'unknown' },
    { ...reading, consent: false }, { ...reading, consent: 'true' }, { ...reading, consent: undefined }
  ]) await call('/api/sensors/readings', 400, 'POST', invalid);
  assert.equal(await readFile(database, 'utf8'), previous);
});

test('activities and sensor readings survive closing and reopening the API', async () => {
  const planned = (await call('/api/activities', 201, 'POST', activity)).body.item;
  const sample = (await call('/api/sensors/readings', 201, 'POST', reading)).body.item;
  await new Promise((resolve) => server.close(resolve));
  await start();
  assert.ok((await call('/api/activities', 200)).body.items.some((item) => item.id === planned.id));
  assert.deepEqual((await call('/api/sensors/readings', 200)).body.items, [sample]);
});

test('database failure returns a generic JSON 500 and preserves the failed database', async () => {
  const unreadable = 'invalid JSON database fixture';
  await writeFile(database, unreadable);
  assert.deepEqual((await call('/api/activities', 500)).body, { error: 'Unexpected server error' });
  assert.deepEqual((await call('/api/activities', 500, 'POST', activity)).body, { error: 'Unexpected server error' });
  assert.equal(await readFile(database, 'utf8'), unreadable);
  assert.equal((await call('/api/health', 200)).body.ok, true);
});

test('development reset is gated and resets only its configured isolated database', async () => {
  await call('/api/sensors/readings', 201, 'POST', reading);
  await call('/api/dev/reset', 404, 'POST');
  process.env.ENABLE_DEV_RESET = 'true';
  assert.deepEqual((await call('/api/dev/reset', 200, 'POST')).body, { reset: true });
  assert.deepEqual((await call('/api/sensors/readings', 200)).body.items, []);
});

test('demo sensor command exits unsuccessfully when the API rejects a sample', async () => {
  await writeFile(database, 'invalid JSON database fixture');
  const script = fileURLToPath(new URL('../scripts/send-demo-sensors.js', import.meta.url));
  await assert.rejects(
    promisify(execFile)(process.execPath, [script], { env: { ...process.env, API_URL: base } }),
    { code: 1, stderr: /temperature_c.*500/ }
  );
});
