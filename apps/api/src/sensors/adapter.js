/**
 * Optional sensor contributor boundary.
 * Implement a physical adapter later WITHOUT changing the API or planner.
 * This mock produces deterministic fixtures only; it does NOT access hardware.
 */
export class MockSensorAdapter {
  constructor() { this.connected = false; }
  async connect() { this.connected = true; }
  async readOnce() {
    if (!this.connected) throw new Error('Adapter not connected');
    return [
      { sensorType: 'temperature_c', value: 25.1 },
      { sensorType: 'light_lux', value: 315 },
      { sensorType: 'noise_db', value: 46.5 },
      { sensorType: 'motion_index', value: 0.18 }
    ].map(({ sensorType, value }) => ({ sensorType, value, timestamp: new Date().toISOString(), source: 'simulator', consent: true }));
  }
  async disconnect() { this.connected = false; }
}

export class HardwareSensorAdapter {
  async connect() { throw new Error('TODO: request permission and connect actual sensor'); }
  async readOnce() { throw new Error('TODO: read a calibrated hardware sample'); }
  async disconnect() { /* TODO: close physical connection and release resources */ }
}
