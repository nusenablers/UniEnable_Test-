/** Simulated adapter. Start API first, then `npm run send:demo -w @unienabler/api`. */
import { MockSensorAdapter } from '../src/sensors/adapter.js';
const base = process.env.API_URL || 'http://127.0.0.1:3001';
const adapter = new MockSensorAdapter();
await adapter.connect();
try {
  for (const sample of await adapter.readOnce()) {
    const response = await fetch(`${base}/api/sensors/readings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample)
    });
    const body = await response.text();
    if (response.ok) {
      console.log(sample.sensorType, response.status, body);
    } else {
      console.error(sample.sensorType, response.status, body);
      process.exitCode = 1;
    }
  }
} finally { await adapter.disconnect(); }
