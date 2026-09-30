import { Colors } from './Colors';

export const Theme = {
  pageGradient: ['#D5E2CB', '#E2E9DC', '#ECD8C6'] as const,
  panelGradient: ['#DCE7D3', '#E7EDDF', '#F0D9C5'] as const,
  buttonGradient: [Colors.primary, Colors.primary] as const,
  screen: { flex: 1, backgroundColor: Colors.light.bg },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, width: '100%', maxWidth: 760, alignSelf: 'center' } as const,
  panel: { backgroundColor: Colors.light.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.light.border, padding: 20 },
  heading: { fontSize: 26, lineHeight: 36, fontWeight: '700', color: Colors.light.text } as const,
  body: { fontSize: 15, lineHeight: 24, color: Colors.light.textSecondary },
  button: { minHeight: 48, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' } as const,
  buttonText: { color: Colors.onPrimary, fontSize: 15, fontWeight: '700' } as const,
  iconButton: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.bgElevated } as const,
};
