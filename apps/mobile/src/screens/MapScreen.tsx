import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Chip, InfoBanner, InlineError, PrimaryButton, SectionTitle } from '../components/UI';
import { C, S } from '../theme';
import type { Facility, RouteResult } from '../types';

const readableFeature = (name:string) => name.replaceAll('_',' ').toLowerCase();
export function MapScreen({ facilities, online, onRoute }: { facilities:Facility[]; online:boolean; onRoute:(from:string,to:string)=>Promise<RouteResult> }) {
  const [type, setType] = useState('ALL');
  const [from, setFrom] = useState('hub-a');
  const [to, setTo] = useState('hub-c');
  const [result, setResult] = useState<RouteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const visible = facilities.filter((f)=>type==='ALL'||f.features.some((feature)=>feature.type===type));
  const names = Object.fromEntries(facilities.map((f)=>[f.id,f.name]));
  const plan = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await onRoute(from, to));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not calculate a demonstration route.');
    } finally {
      setBusy(false);
    }
  };
  return <>
    <View style={{gap:6}}><Text style={S.eyebrow}>Accessibility mapping</Text><Text accessibilityRole="header" style={S.h1}>Explore places</Text><Text style={S.muted}>Find features and inspect step-free route logic in a test graph.</Text></View>
    <InfoBanner>All buildings are fictional, and their accessibility is unverified. Use these routes for demonstrations only.</InfoBanner>
    <SectionTitle title="Find facilities" description="Filter by feature. Presence on this list does not mean the feature is verified."/>
    <View style={S.wrap}>{[['ALL','All'],['STEP_FREE_ENTRANCE','Entrances'],['LIFT','Lifts'],['ACCESSIBLE_WASHROOM','Toilets'],['QUIET_SPACE','Quiet'],['REST_POINT','Rest']].map(([key,name])=><Chip key={key} title={name} selected={type===key} onPress={()=>setType(key)}/>)}</View>
    {visible.length === 0 && <Text style={S.muted}>No sample facilities match this filter.</Text>}
    {visible.map((f)=><View key={f.id} style={S.card}><View style={S.row}><View style={{width:38,height:38,backgroundColor:C.blueLight,borderRadius:10,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:22,color:C.blue}}>⌂</Text></View>
      <View style={{flex:1}}><Text style={S.h3}>{f.name}</Text><Text style={S.small}>{f.description}</Text></View></View>
      <View style={S.divider}/>{f.features.map((feature)=><Text key={feature.type} style={S.muted}>• {readableFeature(feature.type)} — <Text style={{color:C.amber,fontWeight:'800'}}>unverified</Text></Text>)}</View>)}
    <SectionTitle title="Route prototype" description="Dijkstra shortest path with simulated passable links; stairs and unknown links are excluded."/>
    <View style={S.card}><Text style={S.label}>From</Text><View style={S.wrap}>{facilities.map((f)=><Chip key={f.id} title={f.name.replace('Demo ','')} label={'From ' + f.name} selected={from===f.id} disabled={busy} onPress={()=>{setFrom(f.id);setResult(null);setError('');}}/>)}</View>
      <Text style={S.label}>To</Text><View style={S.wrap}>{facilities.map((f)=><Chip key={f.id} title={f.name.replace('Demo ','')} label={'To ' + f.name} selected={to===f.id} disabled={busy} onPress={()=>{setTo(f.id);setResult(null);setError('');}}/>)}</View>
      <PrimaryButton title={busy?'Finding…':'Show synthetic route'} onPress={plan} disabled={!online||busy||!names[from]||!names[to]}/>
      {!online&&<Text style={S.small}>Start the Node server to calculate the sample route.</Text>}
      {error !== '' && <InlineError>{error}</InlineError>}
      {online&&result&&<View style={{gap:9,padding:12,backgroundColor:C.amberLight,borderRadius:12}}><Text accessibilityLiveRegion="polite" style={[S.h3,{color:C.amber}]}>{result.found?'DEMO route only':'No usable route in demo graph'}</Text>
        {result.found?<><Text style={S.body}>{result.nodes?.map((id)=>names[id]||id).join('  →  ')}</Text><Text style={S.muted}>Synthetic distance: {result.distanceMetres} m</Text></>:<Text style={S.muted}>{result.reason}</Text>}
        <Text style={S.small}>Not verified. Do not follow this route in person.</Text></View>}
    </View>
  </>;
}
