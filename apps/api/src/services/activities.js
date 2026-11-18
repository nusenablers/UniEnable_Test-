/** Ported BEHAVIOUR (not source code) from the supplied Java CLI's Activity model. */
export const demands = new Set(['LOW', 'MEDIUM', 'HIGH']);
export function priorityScore(activity) {
  const { importance, urgency, commitment } = activity;
  const vals = [importance, urgency, commitment];
  if (vals.some((n) => n == null)) return null;
  if (!vals.every((n) => Number.isInteger(n) && n >= 1 && n <= 5)) return null;
  return urgency * urgency * (importance + commitment);
}
export function sortActivities(activities, order = 'chronological') {
  const dateOrder = (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
  const sorted = [...activities];
  if (order === 'priority') return sorted.sort((a, b) => (priorityScore(b) ?? -1) - (priorityScore(a) ?? -1) || dateOrder(a, b));
  if (order === 'demand') return sorted.sort((a, b) => ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[b.demand] - { HIGH: 3, MEDIUM: 2, LOW: 1 }[a.demand]) || dateOrder(a, b));
  return sorted.sort(dateOrder);
}
export function validateActivity(payload) {
  if (!payload || typeof payload !== 'object') return 'Expected a JSON object';
  if (typeof payload.name !== 'string' || !payload.name.trim() || payload.name.length > 120) return 'Name must be 1–120 characters';
  if (typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date) || Number.isNaN(Date.parse(payload.date)) || new Date(payload.date).toISOString().slice(0, 10) !== payload.date) return 'Date must be a real YYYY-MM-DD date';
  if (![payload.startTime, payload.endTime].every((s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s))) return 'Times must be HH:mm';
  if (payload.endTime <= payload.startTime) return 'End time must be after start time';
  if (!demands.has(payload.demand)) return 'Demand must be LOW, MEDIUM or HIGH';
  for (const key of ['importance', 'urgency', 'commitment']) {
    const n = payload[key];
    if (n != null && (!Number.isInteger(n) || n < 1 || n > 5)) return `${key} must be 1–5 or null`;
  }
  return null;
}
