import { Platform } from 'react-native';
import type { Activity, Facility, NewActivity, Phrase, Reading, RouteResult, Summary } from './types';
// This is a DEV-ONLY unauthenticated API. Never put a production URL or secrets in EXPO_PUBLIC_ env.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://127.0.0.1:3001',
  default: 'http://127.0.0.1:3001'
});
export class ApiError extends Error {}
export class ApiUnavailableError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(API_BASE + path, {
      ...init,
      signal: controller.signal,
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined
    });
    const data = await response.json();
    if (response.status >= 500) throw new ApiUnavailableError('The local API could not complete the request.');
    if (!response.ok) throw new ApiError(data.error || 'HTTP ' + response.status);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiUnavailableError) throw error;
    throw new ApiUnavailableError('Could not connect to the local API. Check that the server is running.');
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  activities: () => request<{ items: Activity[] }>('/api/activities'),
  createActivity: (payload: NewActivity) => request<{ item: Activity }>('/api/activities', { method: 'POST', body: JSON.stringify(payload) }),
  updateCompleted: (id: string, completed: boolean) => request<{ item: Activity }>(`/api/activities/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  deleteActivity: (id: string) => request<{ deleted: boolean }>(`/api/activities/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  facilities: () => request<{ items: Facility[] }>('/api/facilities'),
  demoRoute: (from: string, to: string) => request<RouteResult>(`/api/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&demo=true`),
  phrases: () => request<{ items: Phrase[] }>('/api/phrases'),
  readings: () => request<{ items: Reading[] }>('/api/sensors/readings?limit=30'),
  summaries: () => request<{ items: Summary[] }>('/api/sensors/summary'),
  sendDemoSensor: (sensorType: string, value: number, consent: true) => request<{ item: Reading }>('/api/sensors/readings', {
    method: 'POST', body: JSON.stringify({ sensorType, value, source: 'simulator', timestamp: new Date().toISOString(), consent })
  })
};
