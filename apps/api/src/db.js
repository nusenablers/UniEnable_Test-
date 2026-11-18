/** A tiny JSON-file-backed development database; intentionally NOT production storage. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.resolve(THIS_DIR, '../data/dev-db.json');
export const databasePath = () => process.env.DEV_DB_PATH || DEFAULT_PATH;

const dateOffset = (days) => {
  const dt = new Date();
  dt.setUTCHours(12, 0, 0, 0);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

/** ALL names and locations below are fictional and unverified. */
export function createSeed() {
  return {
    metadata: { sample: true, notice: 'SYNTHETIC DEMO DATA ONLY — NOT VERIFIED CAMPUS GUIDANCE', version: 1 },
    activities: [
      { id: 'act-1', name: 'Review tutorial slides', date: dateOffset(1), startTime: '10:00', endTime: '11:00', demand: 'MEDIUM', importance: 4, urgency: 4, commitment: 3, completed: false },
      { id: 'act-2', name: 'Project group check-in', date: dateOffset(2), startTime: '14:00', endTime: '15:00', demand: 'LOW', importance: null, urgency: null, commitment: null, completed: false },
      { id: 'act-3', name: 'Prepare demo materials', date: dateOffset(3), startTime: '09:00', endTime: '10:30', demand: 'HIGH', importance: 5, urgency: 5, commitment: 4, completed: false }
    ],
    facilities: [
      { id: 'hub-a', name: 'Demo Learning Hub', description: 'Fictional building used only for interface tests', evidenceStatus: 'DEMO_ONLY', features: [ { type: 'STEP_FREE_ENTRANCE', status: 'UNKNOWN' }, { type: 'LIFT', status: 'UNKNOWN' } ] },
      { id: 'hub-b', name: 'Demo Study Centre', description: 'Fictional building used only for interface tests', evidenceStatus: 'DEMO_ONLY', features: [ { type: 'ACCESSIBLE_WASHROOM', status: 'UNKNOWN' }, { type: 'QUIET_SPACE', status: 'UNKNOWN' } ] },
      { id: 'hub-c', name: 'Demo Resource Room', description: 'Fictional building used only for interface tests', evidenceStatus: 'DEMO_ONLY', features: [ { type: 'REST_POINT', status: 'UNKNOWN' } ] },
      { id: 'hub-d', name: 'Demo Workshop Block', description: 'Fictional building used only for interface tests', evidenceStatus: 'DEMO_ONLY', features: [ { type: 'LIFT', status: 'UNKNOWN' } ] }
    ],
    // demoPassable drives test routes ONLY. It does not represent evidence or real accessibility.
    connections: [
      { id: 'link-1', from: 'hub-a', to: 'hub-b', distanceMetres: 120, traversalType: 'PATH', evidenceStatus: 'DEMO_ONLY', demoPassable: true },
      { id: 'link-2', from: 'hub-b', to: 'hub-c', distanceMetres: 200, traversalType: 'RAMP', evidenceStatus: 'DEMO_ONLY', demoPassable: true },
      { id: 'link-3', from: 'hub-a', to: 'hub-c', distanceMetres: 140, traversalType: 'STAIRS', evidenceStatus: 'DEMO_ONLY', demoPassable: false },
      { id: 'link-4', from: 'hub-a', to: 'hub-d', distanceMetres: 70, traversalType: 'UNKNOWN', evidenceStatus: 'UNKNOWN', demoPassable: false }
    ],
    surveys: [ { id: 'survey-1', facilityId: 'hub-a', featureType: 'STEP_FREE_ENTRANCE', observedStatus: 'UNKNOWN', observedAt: new Date().toISOString(), evidenceNote: 'Placeholder only. No observation conducted.', verificationStatus: 'UNVERIFIED' } ],
    phrases: [
      { id: 'phrase-1', label: 'I need assistance', text: 'Hello, could you please help me?', icon: '◉' },
      { id: 'phrase-2', label: 'A quiet space', text: 'Could you show me a quiet place?', icon: '☾' },
      { id: 'phrase-3', label: 'Please repeat', text: 'Could you repeat that more slowly?', icon: '↻' },
      { id: 'phrase-4', label: 'I need a break', text: 'I need a short break, please.', icon: '◷' },
      { id: 'phrase-5', label: 'Accessible entrance', text: 'Where is the step-free entrance?', icon: '↗' }
    ],
    sensorReadings: []
  };
}

export function loadDb(file = databasePath()) {
  if (!fs.existsSync(file)) {
    saveDb(createSeed(), file);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function saveDb(data, file = databasePath()) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(temporary, file);
}

/** Synchronous read-modify-write is enough for this single-process DEMO; replace for concurrent clients. */
export function mutateDb(transform, file = databasePath()) {
  const data = loadDb(file);
  const result = transform(data);
  saveDb(data, file);
  return result;
}
