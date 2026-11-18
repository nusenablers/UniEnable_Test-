import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { loadDb, mutateDb, createSeed, saveDb } from './db.js';
import { priorityScore, sortActivities, validateActivity } from './services/activities.js';
import { findRoute } from './services/routes.js';
import { validateReading, summarizeReadings } from './sensors/algorithm.js';

const respond = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(JSON.stringify(value));
};

async function bodyOf(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) throw Object.assign(new Error('Payload too large'), { status: 413 });
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Expected a JSON object'), { status: 400 });
  }
  return value;
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const route = url.pathname;
    const method = req.method;
    if (method === 'OPTIONS') return respond(res, 204, {});
    try {
      if (method === 'GET' && route === '/api/health') return respond(res, 200, { ok: true, name: 'UniEnabler 2.0 demo API', demo: true });
      if (method === 'GET' && route === '/api/activities') return respond(res, 200, { items: sortActivities(loadDb().activities, url.searchParams.get('order') || 'chronological').map((a) => ({ ...a, priorityScore: priorityScore(a) })), demo: true });
      if (method === 'POST' && route === '/api/activities') {
        const input = await bodyOf(req);
        const error = validateActivity(input);
        if (error) return respond(res, 400, { error });
        const activity = { id: randomUUID(), name: input.name.trim(), date: input.date, startTime: input.startTime, endTime: input.endTime, demand: input.demand, importance: input.importance ?? null, urgency: input.urgency ?? null, commitment: input.commitment ?? null, completed: false };
        mutateDb((db) => db.activities.push(activity));
        return respond(res, 201, { item: activity, demo: true });
      }
      const activityMatch = /^\/api\/activities\/([^/]+)$/.exec(route);
      if (activityMatch && method === 'PATCH') {
        const value = await bodyOf(req);
        if (typeof value.completed !== 'boolean') return respond(res, 400, { error: 'completed boolean required' });
        const item = mutateDb((db) => {
          const found = db.activities.find((a) => a.id === activityMatch[1]);
          if (found) found.completed = value.completed;
          return found;
        });
        return item ? respond(res, 200, { item }) : respond(res, 404, { error: 'Activity not found' });
      }
      if (activityMatch && method === 'DELETE') {
        const removed = mutateDb((db) => {
          const old = db.activities.length;
          db.activities = db.activities.filter((a) => a.id !== activityMatch[1]);
          return db.activities.length < old;
        });
        return respond(res, removed ? 200 : 404, removed ? { deleted: true } : { error: 'Activity not found' });
      }
      if (method === 'GET' && route === '/api/facilities') return respond(res, 200, { items: loadDb().facilities, demo: true });
      if (method === 'GET' && route === '/api/routes') {
        const db = loadDb();
        const result = findRoute(db.facilities, db.connections, url.searchParams.get('from'), url.searchParams.get('to'), { demo: url.searchParams.get('demo') === 'true' });
        return respond(res, 200, { ...result, warning: 'Synthetic demonstration only. Not suitable for real-world navigation.' });
      }
      if (method === 'GET' && route === '/api/phrases') return respond(res, 200, { items: loadDb().phrases, demo: true });
      if (method === 'GET' && route === '/api/surveys') return respond(res, 200, { items: loadDb().surveys, demo: true });
      if (method === 'POST' && route === '/api/surveys') {
        const input = await bodyOf(req);
        if (typeof input.facilityId !== 'string' || !input.facilityId.trim()
          || typeof input.featureType !== 'string' || !input.featureType.trim()
          || !['YES', 'NO', 'UNKNOWN'].includes(input.observedStatus)) {
          return respond(res, 400, { error: 'facilityId, featureType, observedStatus (YES|NO|UNKNOWN) required' });
        }
        if (input.evidenceNote != null && typeof input.evidenceNote !== 'string') {
          return respond(res, 400, { error: 'evidenceNote must be text' });
        }
        if (!loadDb().facilities.some((facility) => facility.id === input.facilityId)) {
          return respond(res, 404, { error: 'Facility not found' });
        }
        const survey = { id: randomUUID(), facilityId: input.facilityId, featureType: input.featureType.trim(), observedStatus: input.observedStatus, observedAt: new Date().toISOString(), evidenceNote: (input.evidenceNote ?? '').slice(0, 500), verificationStatus: 'UNVERIFIED' };
        mutateDb((db) => db.surveys.push(survey));
        return respond(res, 201, { item: survey, warning: 'Unverified: this observation does not enable routing' });
      }
      if (method === 'GET' && route === '/api/sensors/readings') {
        const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 30));
        return respond(res, 200, { items: loadDb().sensorReadings.slice(-limit), demo: true });
      }
      if (method === 'GET' && route === '/api/sensors/summary') return respond(res, 200, { items: summarizeReadings(loadDb().sensorReadings), demo: true, warning: 'Educational data only; not a health, safety, or accessibility determination.' });
      if (method === 'POST' && route === '/api/sensors/readings') {
        const input = await bodyOf(req);
        const error = validateReading(input);
        if (error) return respond(res, 400, { error });
        // No names, precise coordinates or device identifiers are accepted/stored.
        const item = { id: randomUUID(), sensorType: input.sensorType, value: input.value, timestamp: input.timestamp, source: input.source };
        mutateDb((db) => {
          db.sensorReadings.push(item);
          db.sensorReadings = db.sensorReadings.slice(-1000); // starter cap; establish retention policy before deployments
        });
        return respond(res, 201, { item });
      }
      if (method === 'POST' && route === '/api/dev/reset' && process.env.ENABLE_DEV_RESET === 'true') {
        saveDb(createSeed());
        return respond(res, 200, { reset: true });
      }
      return respond(res, 404, { error: 'Endpoint not found', route });
    } catch (error) {
      return respond(res, error.status || 500, { error: error.status ? error.message : 'Unexpected server error' });
    }
  });
}
