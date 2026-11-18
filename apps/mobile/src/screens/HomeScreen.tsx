import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, S } from '../theme';
import { InfoBanner, SectionTitle } from '../components/UI';
import type { Activity, Tab } from '../types';

export function HomeScreen({ activities, onNavigate }: { activities: Activity[]; onNavigate: (tab: Tab) => void }) {
  const remaining = activities.filter((a) => !a.completed);
  const ranked = remaining.filter((activity) => activity.priorityScore != null)
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  return <>
    <View style={{ gap: 7 }}><Text style={S.eyebrow}>Your space, your pace</Text><Text accessibilityRole="header" style={S.h1}>A calmer way around campus.</Text>
      <Text style={S.muted}>Plan activities, explore accessibility data and communicate your needs.</Text></View>
    <InfoBanner>UniEnabler is a synthetic prototype. Campus routes and facilities are unverified.</InfoBanner>
    <View style={{ flexDirection:'row', gap:12 }}>
      <View style={[S.card, { flex:1, borderColor:'#B9DDD2', backgroundColor:C.primaryLight }]}><Text style={{ fontSize:28, fontWeight:'900', color:C.primary }}>{remaining.length}</Text><Text style={S.small}>Pending activities</Text></View>
      <View style={[S.card, { flex:1, borderColor:'#D8D3EB', backgroundColor:C.purpleLight }]}><Text style={{ fontSize:28, fontWeight:'900', color:C.purple }}>{remaining.filter((a)=>a.demand==='HIGH').length}</Text><Text style={S.small}>High-demand tasks</Text></View>
    </View>
    <SectionTitle title="Quick access" description="Four everyday jobs — plus an experimental sensor lab." />
    <View style={{ gap:9 }}>
      {([
        ['map','↗','Explore routes & facilities','Check the demo accessibility map'],
        ['plan','▣','Plan my activities','Priorities, demand and task completion'],
        ['communicate','☏','Communication cards','Large, simple messages'],
        ['sensors','◉','Sensor data lab','Independent data collection module']
      ] as [Tab,string,string,string][]).map(([tab,symbol,title,detail]) => <Pressable key={tab} onPress={()=>onNavigate(tab)} accessibilityRole="button"
        style={({pressed}) => [S.card,{ flexDirection:'row', alignItems:'center', opacity:pressed?0.65:1 }]}>
        <View style={{ width:42, height:42, backgroundColor:C.blueLight, borderRadius:12, justifyContent:'center', alignItems:'center' }}><Text style={{ fontSize:23, color:C.blue }}>{symbol}</Text></View>
        <View style={{ flex:1, gap:3 }}><Text style={S.h3}>{title}</Text><Text style={S.small}>{detail}</Text></View><Text style={{ color:C.muted,fontSize:24 }}>›</Text>
      </Pressable>)}
    </View>
    <SectionTitle title="Top priority" description="Only fully rated tasks receive a score." />
    <View style={S.card}>{ranked[0] ? <><Text style={S.h3}>{ranked[0].name}</Text><Text style={S.muted}>{ranked[0].date} · {ranked[0].startTime}–{ranked[0].endTime}</Text>
      <Text style={[S.label,{color:C.primary}]}>Priority {ranked[0].priorityScore} / 250</Text></> : <Text style={S.muted}>{remaining.length ? 'No pending activities have a priority score.' : 'No pending activities.'}</Text>}</View>
  </>;
}
