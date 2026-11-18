import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { InfoBanner, PrimaryButton, SectionTitle } from '../components/UI';
import { C, S } from '../theme';
import type { Phrase } from '../types';

export function CommunicateScreen({ phrases }: { phrases:Phrase[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = phrases.find((phrase) => phrase.id === selectedId);
  return <>
    <View style={{gap:6}}><Text style={S.eyebrow}>Express yourself</Text><Text accessibilityRole="header" style={S.h1}>Communication cards</Text><Text style={S.muted}>Choose a phrase to show it in large, readable text.</Text></View>
    <InfoBanner tone="info">Voice playback is planned. You can display messages on screen.</InfoBanner>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{phrases.map((phrase)=><Pressable key={phrase.id} onPress={()=>setSelectedId(phrase.id)} accessibilityRole="button" accessibilityLabel={phrase.label}
      aria-pressed={selected?.id === phrase.id} accessibilityState={Platform.OS === 'web' ? undefined : { selected: selected?.id === phrase.id }}
      style={({pressed})=>[S.card,{width:'47%',minHeight:138,backgroundColor:selected?.id===phrase.id?C.purpleLight:C.paper,opacity:pressed?0.7:1,justifyContent:'center',alignItems:'center'}]}>
      <Text aria-hidden style={{fontSize:32,color:C.purple}}>{phrase.icon}</Text><Text style={[S.label,{textAlign:'center'}]}>{phrase.label}</Text></Pressable>)}</View>
    <SectionTitle title="Display message" description="Hold up the screen so someone nearby can read it."/>
    <View style={[S.card,{minHeight:185,justifyContent:'center',alignItems:'center',backgroundColor:C.blueLight}]}>
      <Text selectable accessibilityLiveRegion="polite" style={{fontSize:25,lineHeight:34,fontWeight:'800',color:C.ink,textAlign:'center'}}>{selected?.text??'Select a message above'}</Text>
    </View>
    <PrimaryButton title="Speak this message (placeholder)" onPress={()=>{}} variant="quiet" disabled/>
  </>;
}
