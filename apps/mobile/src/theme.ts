import { StyleSheet } from 'react-native';
export const C = {
  ink: '#142C3C', muted: '#526778', primary: '#0C6A61', primaryLight: '#E7F5F1',
  blue: '#285AC5', blueLight: '#EAF0FE', amber: '#995511', amberLight: '#FFF3DE',
  purple: '#6144A5', purpleLight: '#F0EAFA', background: '#F5F7FA', paper: '#FFFFFF',
  border: '#D9E2E8', danger: '#AC3544', success: '#247C55'
};
export const S = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.background },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28, gap: 16 },
  eyebrow: { fontSize: 12, letterSpacing: 1.3, textTransform: 'uppercase', color: C.primary, fontWeight: '800' },
  h1: { fontSize: 27, lineHeight: 33, fontWeight: '800', color: C.ink },
  h2: { fontSize: 19, fontWeight: '800', color: C.ink },
  h3: { fontSize: 16, fontWeight: '700', color: C.ink },
  body: { fontSize: 15, lineHeight: 22, color: C.ink },
  muted: { fontSize: 14, lineHeight: 20, color: C.muted },
  small: { fontSize: 12, lineHeight: 18, color: C.muted },
  card: { backgroundColor: C.paper, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  divider: { height: 1, backgroundColor: C.border },
  field: { minHeight: 50, borderRadius: 11, borderWidth: 1, borderColor: C.border, backgroundColor: C.paper, paddingHorizontal: 13, paddingVertical: 12, color: C.ink, fontSize: 16 },
  label: { color: C.ink, fontSize: 14, fontWeight: '700' },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '800' },
  chip: { minHeight: 44, paddingVertical: 10, paddingHorizontal: 13, borderWidth: 1, borderColor: C.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper },
  chipText: { fontSize: 13, fontWeight: '700', color: C.ink },
  banner: { borderWidth: 1, borderColor: '#E6C68F', backgroundColor: C.amberLight, borderRadius: 12, padding: 12, gap: 4 },
  bannerText: { fontSize: 13, lineHeight: 19, color: '#70400C' }
});
