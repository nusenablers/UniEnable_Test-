export type Tab = 'home' | 'map' | 'plan' | 'communicate' | 'sensors';
export type Demand = 'LOW' | 'MEDIUM' | 'HIGH';
export interface Activity {
  id: string; name: string; date: string; startTime: string; endTime: string;
  demand: Demand; importance: number | null; urgency: number | null;
  commitment: number | null; completed: boolean; priorityScore?: number | null;
}
export type NewActivity = Omit<Activity, 'id' | 'completed' | 'priorityScore'>;
export interface Feature { type: string; status: 'YES' | 'NO' | 'UNKNOWN'; }
export interface Facility { id: string; name: string; description: string; evidenceStatus: string; features: Feature[]; }
export interface RouteResult { found: boolean; demo: boolean; nodes?: string[]; distanceMetres?: number; reason?: string; warning: string; }
export interface Phrase { id: string; label: string; text: string; icon: string; }
export interface Reading { id: string; sensorType: string; value: number; timestamp: string; source: 'simulator' | 'device'; }
export interface Summary { sensorType: string; count: number; average: number; minimum: number; maximum: number; ewma: number; lastTimestamp: string; demo: boolean; }
