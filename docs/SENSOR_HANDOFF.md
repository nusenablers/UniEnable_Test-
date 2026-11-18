# Independent sensor/data collection module — contributor handoff

## Original contributor intention

The teammate expressed an interest in: **collecting data with the team's own sensors, experimenting with algorithms, and working independently at first**, with a fuller discussion after exams. This starter protects that independence: it supplies an API seam and synthetic reference implementation but does not decide their sensor hardware, feature set or model design for them.

## Suggested independent workspace

```text
apps/api/src/sensors/
  algorithm.js             # Current sample: average, min/max, EWMA, no trained model
  adapter.js               # Mock adapter and explicit physical-hardware stub
  adapters/                # TODO: teammate creates device-specific adapters here
  calibration/             # TODO: calibration + uncertainty records
  experiments/             # TODO: synthetic or consented local test datasets
```

The teammate can implement a separate feature branch such as `feature/sensor-pipeline` without modifying the existing Plan/Map screens. The team agrees on the `/api/sensors/*` JSON contract first. Any proposed new sensing goal should have a precise **use case** (e.g., estimate ambient noise level, detect movement at a demo station), and must not be assumed to diagnose conditions or determine if a space is accessible.

## Minimal sensor adapter contract

One sensor reading is:

```ts
type SensorReadingInput = {
  sensorType: 'temperature_c' | 'light_lux' | 'noise_db' | 'motion_index';
  value: number;
  timestamp: string; // ISO 8601 with offset or Z
  source: 'simulator' | 'device';
  consent: true;
};
```

Example TypeScript **stub for future physical sensors** (not wired to any hardware or SDK):

```ts
export interface SensorAdapter {
  connect(): Promise<void>;
  readOnce(): Promise<{ sensorType: string; value: number; timestamp: string }>;
  disconnect(): Promise<void>;
}

export class HardwareSensorAdapter implements SensorAdapter {
  async connect() { throw new Error('TODO: initialise device and request permission'); }
  async readOnce() { throw new Error('TODO: capture calibrated and timestamped sample'); }
  async disconnect() { /* TODO: close USB, BLE or serial connection safely */ }
}
```

If a USB/ESP32/BLE sensor will provide readings, write a small **local adapter** that calls the existing HTTP endpoint. If phone-native sensors are preferred, add Expo sensor permissions/modules in the app through a scoped PR and test on actual hardware. Do not build hardware support on unverified assumptions.

## Current working sample

1. Run `npm run dev:api` from repo root.
2. Run `npm run send:demo -w @unienabler/api` in another terminal to submit four fixed synthetic readings.
3. Query `GET /api/sensors/summary` or open the mobile `Sensors` tab.
4. Run `npm test` to validate the EMA/EWMA and opt-in contract.

`algorithm.js` uses EWMA with alpha = 0.3. This is a tiny **feature-extraction illustration**, not a machine learning model or an effectiveness claim.

## Proposed independent milestones

1. **Define collection goal:** choose physical variables, units, sample frequency, sensor tolerance, and success metrics. Discuss limits before collecting data.
2. **Build adapter:** use the physical device to capture a timestamped reading locally; keep test fixtures separate from genuine readings.
3. **Calibrate:** document raw reading, conversion, device range, sensor placement, noise and missing samples.
4. **Feature extraction:** compute rolling statistics/filters and compare with raw values; add tests for dropout/outliers, asynchronous sampling and repeated timestamps.
5. **Algorithm experiment:** implement a documented baseline and report failure modes. Use labelled data only if there is a defensible collection/evaluation protocol.
6. **Integration:** send consented readings through `/api/sensors/readings` and display clearly labelled units and uncertainty. Obtain review before associating any sensor score with user health, access or safety.

## Privacy and research boundary

Only test with synthetic values in the public GitHub repo. Do not commit participant data, names, raw video/audio, personal location traces, face/hand footage, secret API keys or device addresses. For real sensor studies, create a consent, security, storage, deletion, incident and review plan. Stop recording and provide opt-out. Do not put real records in the demo JSON store or publish a no-auth server.

## Integration ownership proposal

- Sensor contributor owns adapter code, calibration, algorithms, synthetic test dataset and evaluation notes.
- App contributor owns screen integration, clear labels, keyboard and screen-reader controls.
- Mapping contributor owns human verification process; sensor readings cannot automatically turn an UNKNOWN ramp or lift into VERIFIED.
- Integration review merges the data contract, tests and documentation only after all parties agree on the use case.
