import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Chip, InlineError, PrimaryButton, SectionTitle } from '../components/UI';
import { C, S } from '../theme';
import type { Activity, Demand, NewActivity } from '../types';

function TodayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function Rating({ title, value, onChange }: { title:string; value:number | null; onChange:(n:number|null)=>void }) {
  return <View style={{ gap: 6 }}><Text style={S.label}>{title} <Text style={S.small}>(optional)</Text></Text>
    <View style={S.wrap}><Chip title="Unset" label={title + ' unset'} selected={value===null} onPress={()=>onChange(null)} />{[1,2,3,4,5].map((n)=><Chip key={n} title={String(n)} label={title + ' ' + n} selected={value===n} onPress={()=>onChange(n)}/>)}</View>
  </View>;
}
export function PlanScreen({ activities, online, onAdd, onToggle, onDelete }: { activities:Activity[]; online:boolean; onAdd:(data:NewActivity)=>Promise<void>; onToggle:(a:Activity)=>Promise<void>; onDelete:(a:Activity)=>Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(TodayLocal);
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('11:00');
  const [demand, setDemand] = useState<Demand>('MEDIUM');
  const [importance, setImportance] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<number | null>(null);
  const [commitment, setCommitment] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [listError, setListError] = useState('');
  const score = useMemo(()=>importance!==null && urgency!==null && commitment!==null ? urgency*urgency*(importance+commitment) : null,[importance,urgency,commitment]);
  const sorted = useMemo(()=>[...activities].sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)),[activities]);
  const submit = async () => {
    if (!name.trim()) { setFormError('Enter an activity name.'); return; }
    setFormError('');
    setBusy(true);
    try {
      await onAdd({ name, date, startTime: start, endTime: end, demand, importance, urgency, commitment });
      setOpen(false);
      setName('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the activity.');
    } finally {
      setBusy(false);
    }
  };
  const changeActivity = async (activity: Activity, update: (entry: Activity) => Promise<void>) => {
    setPendingId(activity.id);
    setListError('');
    try {
      await update(activity);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update the activity.';
      setListError(activity.name + '. ' + message);
    } finally {
      setPendingId(null);
    }
  };
  return <>
    <View style={{gap:6}}><Text style={S.eyebrow}>Daily planning</Text><Text accessibilityRole="header" style={S.h1}>Activities</Text><Text style={S.muted}>Keep tasks visible and flexible. Demand and numeric priority are separate measures.</Text></View>
    <PrimaryButton title={open ? 'Close activity form' : '+ Add activity'} onPress={()=>{setOpen(!open);setFormError('');}} variant={open?'outline':'primary'} disabled={busy}/>
    {open && <View style={S.card}>
      <Text style={S.h2}>New activity</Text><Text style={S.label}>Activity name</Text><TextInput accessibilityLabel="Activity name" style={S.field} value={name} onChangeText={setName} placeholder="e.g. Group discussion" placeholderTextColor={C.muted}/>
      <Text style={S.label}>Date (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Date (YYYY-MM-DD)" style={S.field} value={date} onChangeText={setDate} autoCapitalize="none"/>
      <View style={{ flexDirection:'row',flexWrap:'wrap',gap:10 }}><View style={{flex:1,minWidth:100,gap:6}}><Text style={S.label}>Start (HH:mm)</Text><TextInput accessibilityLabel="Start time (HH:mm)" style={S.field} value={start} onChangeText={setStart}/></View>
        <View style={{flex:1,minWidth:100,gap:6}}><Text style={S.label}>End (HH:mm)</Text><TextInput accessibilityLabel="End time (HH:mm)" style={S.field} value={end} onChangeText={setEnd}/></View></View>
      <Text style={S.label}>Demand level</Text><View style={S.wrap}>{(['LOW','MEDIUM','HIGH'] as Demand[]).map((d)=><Chip key={d} title={d} selected={demand===d} onPress={()=>setDemand(d)}/>)}</View>
      <Rating title="Importance" value={importance} onChange={setImportance}/><Rating title="Urgency" value={urgency} onChange={setUrgency}/><Rating title="Commitment" value={commitment} onChange={setCommitment}/>
      <View style={{ backgroundColor:C.primaryLight, borderRadius:12, padding:12 }}><Text style={[S.label,{color:C.primary}]}>Priority score: {score ?? 'Incomplete'} / 250</Text><Text style={S.small}>Urgency² × (Importance + Commitment)</Text></View>
      <PrimaryButton title={busy?'Saving…':'Save activity'} onPress={submit} disabled={busy||!online}/>{!online && <Text style={S.small}>Connect the local server to save changes.</Text>}
      {formError !== '' && <InlineError>{formError}</InlineError>}
    </View>}
    <SectionTitle title={`Your schedule (${sorted.length})`} description="Mark completed or delete example records; changes persist on the local server." />
    {listError !== '' && <InlineError>{listError}</InlineError>}
    {sorted.map((a)=> <View key={a.id} style={S.card}>
      <View style={S.row}><View style={{flex:1,gap:5}}><Text style={[S.h3,a.completed&&{textDecorationLine:'line-through',color:C.muted}]}>{a.name}</Text>
        <Text style={S.small}>{a.date} · {a.startTime}–{a.endTime}</Text></View>
        <Text style={{fontSize:12,fontWeight:'900',color:a.demand==='HIGH'?C.danger:C.primary}}>{a.demand}</Text></View>
      <Text accessibilityLiveRegion="polite" style={S.small}>{a.completed ? 'Completed' : 'Pending'} · Priority {a.priorityScore ?? 'unrated'}</Text>
      <View style={S.wrap}>
        <Pressable accessibilityRole="button" accessibilityLabel={(a.completed ? 'Undo completion for ' : 'Complete ') + a.name} onPress={()=>changeActivity(a, onToggle)} disabled={!online || pendingId !== null} style={S.chip}><Text style={[S.chipText,{color:C.primary}]}>{a.completed ? 'Undo completion' : 'Complete'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={'Delete ' + a.name} onPress={()=>changeActivity(a, onDelete)} disabled={!online || pendingId !== null} style={S.chip}><Text style={[S.chipText,{color:C.danger}]}>Delete</Text></Pressable>
      </View>
    </View>)}
    {sorted.length===0&&<Text style={S.muted}>No activities yet.</Text>}
  </>;
}
