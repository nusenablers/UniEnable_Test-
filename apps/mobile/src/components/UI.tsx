import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, S } from '../theme';

export function PrimaryButton({ title, onPress, variant = 'primary', disabled = false }: { title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'quiet'; disabled?: boolean }) {
  const solid = variant === 'primary';
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => [S.button, { backgroundColor: solid ? C.primary : variant === 'quiet' ? C.primaryLight : C.paper,
      borderColor: solid ? C.primary : C.border, borderWidth: solid ? 0 : 1, opacity: pressed || disabled ? 0.65 : 1 }] }>
    <Text style={[S.buttonText, { color: solid ? '#FFFFFF' : C.primary }]}>{title}</Text>
  </Pressable>;
}
export function Chip({ title, label = title, selected, onPress, disabled = false }: {
  title: string; label?: string; selected: boolean; onPress: () => void; disabled?: boolean;
}) {
  const state = Platform.OS === 'web' ? { disabled } : { selected, disabled };
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={state}
    aria-pressed={selected} onPress={onPress} disabled={disabled}
    style={({pressed}) => [S.chip, { borderColor: selected ? C.primary : C.border, backgroundColor: selected ? C.primaryLight : C.paper, opacity: pressed ? 0.7 : 1 }]}>
    <Text style={[S.chipText, { color: selected ? C.primary : C.ink }]}>{title}</Text>
  </Pressable>;
}
export function InfoBanner({ children, tone = 'warning' }: { children: React.ReactNode; tone?: 'warning' | 'info' }) {
  return <View style={tone === 'warning' ? S.banner : [S.banner, { backgroundColor: C.blueLight, borderColor: '#B4C8FB' }]}>
    <Text style={[S.bannerText, tone === 'info' && { color: C.blue }]}>{children}</Text>
  </View>;
}
export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return <View style={{ gap: 4 }}><Text accessibilityRole="header" aria-level={2} style={S.h2}>{title}</Text>{description && <Text style={S.muted}>{description}</Text>}</View>;
}
export function InlineError({ children }: { children: string }) {
  return <Text accessibilityRole="alert" style={[S.body, { color: C.danger }]}>{children}</Text>;
}
export function AppHeader() {
  return <View role="banner" style={styles.header}><View style={styles.mark}><Text style={styles.markText}>U</Text></View>
    <View style={{ flex: 1 }}><Text style={styles.logo}>UniEnabler <Text style={{ color: C.primary }}>2.0</Text></Text><Text style={styles.sub}>Accessible campus companion · Prototype</Text></View>
    <View style={styles.pill}><Text style={styles.pillText}>DEMO</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  header: { minHeight: 76, paddingHorizontal: 18, flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.paper, borderBottomWidth:1, borderBottomColor:C.border },
  mark: { width:36, height:36, backgroundColor:C.primary, borderRadius:11, alignItems:'center', justifyContent:'center' },
  markText: { color:'#FFFFFF', fontSize:22, fontWeight:'900' },
  logo: { fontSize:17, fontWeight:'900', color:C.ink },
  sub: { fontSize:11, color:C.muted },
  pill: { backgroundColor:C.amberLight, borderRadius:8, paddingHorizontal:7, paddingVertical:4 },
  pillText: { fontSize:10, color:C.amber, fontWeight:'900' }
});
