import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip, InfoBanner, InlineError, PrimaryButton, SectionTitle } from '../components/UI';
import { C, S } from '../theme';
import type { Reading, Summary } from '../types';

const choices: [string,number,string][] = [
  ['temperature_c',25.1,'Temperature (°C)'], ['light_lux',315,'Illuminance (lux)'],
  ['noise_db',46.5,'Noise (dB, demo)'], ['motion_index',0.18,'Motion index (demo)']
];
export function SensorsScreen({ summaries, readings, online, onSend, onRefresh }: {summaries:Summary[];readings:Reading[];online:boolean;onSend:(t:string,n:number,consent:true)=>Promise<void>;onRefresh:()=>Promise<void>}) {
  const [selection, setSelection] = useState(choices[0]);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const push = async () => {
    if (!online || !consent || busy) return;
    setError('');
    setSent(false);
    setBusy(true);
    try {
      await onSend(selection[0], selection[1], consent);
      setConsent(false);
      setSent(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not send the synthetic reading.');
    } finally {
      setBusy(false);
    }
  };
  return <>
    <View style={{gap:6}}><Text style={S.eyebrow}>Independent contributor workspace</Text><Text accessibilityRole="header" style={S.h1}>Sensor data lab</Text><Text style={S.muted}>Send fixed sample values to the local API and see how the algorithm summarizes them.</Text></View>
    <InfoBanner tone="info">This is a simulation, not a real sensor connection. No people, locations, audio or camera frames are collected by this starter.</InfoBanner>
    <SectionTitle title="Send synthetic reading" description="The example values below are fixed test inputs. Sending requires the local server."/>
    <View style={S.card}><View style={S.wrap}>{choices.map((item)=><Chip key={item[0]} title={item[2]} selected={item[0]===selection[0]} disabled={busy} onPress={()=>{setSelection(item);setConsent(false);setSent(false);setError('');}}/>)}</View>
      <Text style={S.muted}>Example value: <Text style={{fontWeight:'900',color:C.ink}}>{selection[1]}</Text></Text>
      <Pressable accessibilityRole="checkbox" accessibilityLabel="I consent to send one synthetic reading" accessibilityState={{ checked: consent, disabled: !online || busy }}
        disabled={!online || busy} onPress={()=>{setConsent(!consent);setSent(false);}} style={[S.chip, { flexDirection:'row', gap:10, justifyContent:'flex-start' }]}>
        <Text aria-hidden style={[S.label, { color:C.primary }]}>{consent ? '☑' : '☐'}</Text>
        <Text style={[S.label, { flexShrink:1 }]}>I consent to send one synthetic reading</Text>
      </Pressable>
      <PrimaryButton title={busy?'Sending…':'Send synthetic reading'} disabled={!online||!consent||busy} onPress={push}/>
      {!online&&<Text style={S.small}>Connect the Node API before sending.</Text>}
      {error !== '' && <InlineError>{error}</InlineError>}
      {sent && <Text accessibilityLiveRegion="polite" style={S.body}>The server saved the synthetic reading.</Text>}
    </View>
    <SectionTitle title="Algorithm preview" description="Sample statistics and EWMA (α = 0.3); results are not validated for accessibility decisions."/>
    {summaries.length? summaries.map((s)=><View style={S.card} key={s.sensorType}><Text style={S.h3}>{s.sensorType.replaceAll('_',' ')}</Text><View style={[S.wrap,{justifyContent:'space-between'}]}>
      <View><Text style={S.small}>Average</Text><Text style={S.h2}>{s.average}</Text></View><View><Text style={S.small}>EWMA</Text><Text style={S.h2}>{s.ewma}</Text></View><View><Text style={S.small}>Samples</Text><Text style={S.h2}>{s.count}</Text></View>
    </View><Text style={S.small}>Min {s.minimum} · Max {s.maximum}</Text></View>) : <View style={S.card}><Text style={S.muted}>{online ? 'No sensor readings yet. Send a synthetic reading to test the pipeline.' : 'Sensor readings are unavailable in offline preview.'}</Text></View>}
    <SectionTitle title="Latest readings"/>
    {readings.slice(-5).reverse().map((r)=><View style={[S.card,{padding:12}]} key={r.id}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={S.label}>{r.sensorType}</Text><Text style={S.label}>{r.value}</Text></View>
      <Text style={S.small}>{r.timestamp} · {r.source === 'simulator' ? 'Simulated reading' : 'Device source (reported by sender)'}</Text></View>)}
    <PrimaryButton title={refreshing ? 'Refreshing lab data…' : 'Refresh lab data'} onPress={async()=>{setRefreshing(true);try{await onRefresh();}finally{setRefreshing(false);}}} variant="outline" disabled={!online||refreshing||busy}/>
    <Text style={S.small}>Replace the sensor adapter with a physical device later. See docs/SENSOR_HANDOFF.md for consent, sensor contract, adapter skeleton and research responsibilities.</Text>
  </>;
}
