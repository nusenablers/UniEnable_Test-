/** UI preview ONLY when the local API is unreachable; mutations require server connection. */
import type { Activity, Facility, Phrase } from './types';
const dateIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
export const previewActivities: Activity[] = [
  { id:'offline-1', name:'Review tutorial slides', date:dateIn(1), startTime:'10:00', endTime:'11:00', demand:'MEDIUM', importance:4, urgency:4, commitment:3, completed:false, priorityScore:112 },
  { id:'offline-2', name:'Project group check-in', date:dateIn(2), startTime:'14:00', endTime:'15:00', demand:'LOW', importance:null, urgency:null, commitment:null, completed:false, priorityScore:null },
  { id:'offline-3', name:'Prepare demo materials', date:dateIn(3), startTime:'09:00', endTime:'10:30', demand:'HIGH', importance:5, urgency:5, commitment:4, completed:false, priorityScore:225 }
];
export const previewFacilities: Facility[] = [
  { id:'hub-a', name:'Demo Learning Hub', description:'Fictional — for UI testing', evidenceStatus:'DEMO_ONLY', features:[{ type:'STEP_FREE_ENTRANCE', status:'UNKNOWN' }] },
  { id:'hub-b', name:'Demo Study Centre', description:'Fictional — for UI testing', evidenceStatus:'DEMO_ONLY', features:[{ type:'QUIET_SPACE', status:'UNKNOWN' }] },
  { id:'hub-c', name:'Demo Resource Room', description:'Fictional — for UI testing', evidenceStatus:'DEMO_ONLY', features:[{ type:'REST_POINT', status:'UNKNOWN' }] }
];
export const previewPhrases: Phrase[] = [
  { id:'phrase-1', label:'I need assistance', text:'Hello, could you please help me?', icon:'◉' },
  { id:'phrase-2', label:'A quiet space', text:'Could you show me a quiet place?', icon:'☾' },
  { id:'phrase-3', label:'Please repeat', text:'Could you repeat that more slowly?', icon:'↻' },
  { id:'phrase-4', label:'I need a break', text:'I need a short break, please.', icon:'◷' }
];
