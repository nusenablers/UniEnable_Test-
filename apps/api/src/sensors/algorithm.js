/** Optional independent module: sample feature extraction; NOT a medical or safety model. */
export function summarizeReadings(readings) {
  const groups = new Map();
  for (const reading of readings) {
    if (!groups.has(reading.sensorType)) groups.set(reading.sensorType, []);
    groups.get(reading.sensorType).push(reading);
  }
  return [...groups.entries()].map(([sensorType, values]) => {
    const numbers = values.map((v) => v.value);
    const average = numbers.reduce((s, n) => s + n, 0) / numbers.length;
    const minimum = Math.min(...numbers);
    const maximum = Math.max(...numbers);
    // Exponential weighted moving average, alpha = 0.3; illustrative only.
    const ewma = numbers.reduce((previous, value, index) => index === 0 ? value : 0.3 * value + 0.7 * previous, 0);
    return { sensorType, count: numbers.length, average: +average.toFixed(2), minimum, maximum, ewma: +ewma.toFixed(2), lastTimestamp: values.at(-1).timestamp, demo: true };
  });
}
export const ALLOWED_SENSOR_TYPES = Object.freeze(['temperature_c', 'light_lux', 'noise_db', 'motion_index']);

function isSensorTimestamp(timestamp) {
  if (typeof timestamp !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/.exec(timestamp);
  if (!match || !Number.isFinite(Date.parse(timestamp)) || !Number.isFinite(Date.parse(match[1]))) return false;
  return new Date(match[1]).toISOString().slice(0, 10) === match[1];
}

export function validateReading(reading) {
  if (!reading || typeof reading !== 'object') return 'Reading must be an object';
  if (!ALLOWED_SENSOR_TYPES.includes(reading.sensorType)) return 'Unknown sensorType';
  if (typeof reading.value !== 'number' || !Number.isFinite(reading.value) || Math.abs(reading.value) > 1000000) return 'value must be a finite, plausible number';
  if (!isSensorTimestamp(reading.timestamp)) return 'timestamp must be a real ISO 8601 date and time with Z or an offset';
  if (reading.source !== 'simulator' && reading.source !== 'device') return 'source must be simulator or device';
  if (reading.consent !== true) return 'Explicit consent=true is required';
  return null;
}
