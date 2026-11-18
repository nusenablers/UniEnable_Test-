import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiUnavailableError } from './src/api';
import { previewActivities, previewFacilities, previewPhrases } from './src/fallback';
import { AppHeader, PrimaryButton } from './src/components/UI';
import { HomeScreen } from './src/screens/HomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { CommunicateScreen } from './src/screens/CommunicateScreen';
import { SensorsScreen } from './src/screens/SensorsScreen';
import { C, S } from './src/theme';
import type { Activity, Facility, NewActivity, Phrase, Reading, RouteResult, Summary, Tab } from './src/types';

const tabs: {id:Tab; icon:string; label:string}[] = [
  {id:'home',icon:'⌂',label:'Home'}, {id:'map',icon:'↗',label:'Map'},
  {id:'plan',icon:'▣',label:'Plan'}, {id:'communicate',icon:'◉',label:'Talk'},
  {id:'sensors',icon:'≋',label:'Sensors'}
];

type AppData = {
  activities: Activity[];
  facilities: Facility[];
  phrases: Phrase[];
  readings: Reading[];
  summaries: Summary[];
};

const previewData: AppData = {
  activities: previewActivities, facilities: previewFacilities, phrases: previewPhrases,
  readings: [], summaries: []
};

function AppBody() {
  const [tab, setTab] = useState<Tab>('home');
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    try {
      const [a, f, p, r, s] = await Promise.all([
        api.activities(), api.facilities(), api.phrases(), api.readings(), api.summaries()
      ]);
      if (version === refreshVersion.current) {
        setData({ activities: a.items, facilities: f.items, phrases: p.items, readings: r.items, summaries: s.items });
      }
    } catch {
      if (version === refreshVersion.current) setData(null);
    } finally {
      if (version === refreshVersion.current) setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function runAction<T>(action: Promise<T>): Promise<T> {
    try {
      return await action;
    } catch (error) {
      if (error instanceof ApiUnavailableError) {
        refreshVersion.current++;
        setData(null);
        setLoading(false);
      }
      throw error;
    }
  }

  const onAdd = async (activity: NewActivity) => {
    await runAction(api.createActivity(activity));
    await refresh();
  };
  const onToggle = async (activity: Activity) => {
    await runAction(api.updateCompleted(activity.id, !activity.completed));
    await refresh();
  };
  const onDelete = async (activity: Activity) => {
    await runAction(api.deleteActivity(activity.id));
    await refresh();
  };
  const onRoute = (from: string, to: string): Promise<RouteResult> => runAction(api.demoRoute(from, to));
  const onSend = async (type: string, value: number, consent: true) => {
    await runAction(api.sendDemoSensor(type, value, consent));
    await refresh();
  };
  const online = data !== null;
  const { activities, facilities, phrases, readings, summaries } = data ?? previewData;

  return <SafeAreaView style={S.screen} edges={['top','bottom']}>
    <StatusBar barStyle="dark-content"/><AppHeader/>
    <View role="main" style={{ flex:1 }}>
      <ScrollView key={tab} contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
        {loading && <Text accessibilityLiveRegion="polite" style={S.muted}>Loading data from the local server…</Text>}
        {!loading && !online && <View style={S.banner}>
          <Text accessibilityLiveRegion="polite" style={S.bannerText}>Preview mode: local API unavailable. These are sample records. Saving is unavailable.</Text>
          <PrimaryButton title="Retry local server" onPress={() => { setLoading(true); void refresh(); }} variant="outline"/>
        </View>}
        {!loading && tab==='home' && <HomeScreen activities={activities} onNavigate={setTab}/>}
        {tab==='map' && <MapScreen facilities={facilities} online={online} onRoute={onRoute}/>}
        {tab==='plan' && <PlanScreen activities={activities} online={online} onAdd={onAdd} onToggle={onToggle} onDelete={onDelete}/>}
        {tab==='communicate' && <CommunicateScreen phrases={phrases}/>}
        {tab==='sensors' && <SensorsScreen summaries={summaries} readings={readings} online={online} onSend={onSend} onRefresh={refresh}/>}
      </ScrollView>
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="Application screens" style={{flexDirection:'row',backgroundColor:C.paper,borderTopColor:C.border,borderTopWidth:1,paddingHorizontal:8,paddingTop:6,paddingBottom:7}}>
      {tabs.map((item)=><Pressable key={item.id} accessibilityRole="tab" accessibilityState={{selected:tab===item.id}} accessibilityLabel={item.label}
        onPress={()=>setTab(item.id)} style={({pressed})=>({flex:1,alignItems:'center',justifyContent:'center',minHeight:58,borderRadius:10,backgroundColor:tab===item.id?C.primaryLight:'transparent',opacity:pressed?0.55:1})}>
        <Text style={{fontSize:23,color:tab===item.id?C.primary:C.muted}}>{item.icon}</Text>
        <Text style={{fontSize:11,fontWeight:tab===item.id?'900':'700',color:tab===item.id?C.primary:C.muted}}>{item.label}</Text>
      </Pressable>)}
    </View>
  </SafeAreaView>;
}
export default function App() {return <SafeAreaProvider><AppBody/></SafeAreaProvider>;}
