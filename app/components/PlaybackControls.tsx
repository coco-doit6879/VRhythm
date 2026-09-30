import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Text } from '../../ui/Typography';
interface Props {
  disabled?: boolean; allowSeek?: boolean;
  playing: boolean; onPlay: () => void; onPause: () => void; onStop: () => void; onPrev: () => void; onNext: () => void;
}
export default function PlaybackControls({ playing, onPlay, onPause, onStop, onPrev, onNext, disabled = false, allowSeek = true }: Props) {
  const controls = [
    { label: 'Nốt trước', icon: 'play-skip-back', action: onPrev, primary: false },
    { label: playing ? 'Tạm dừng' : 'Phát', icon: playing ? 'pause' : 'play', action: playing ? onPause : onPlay, primary: true },
    { label: 'Dừng', icon: 'stop', action: onStop, primary: false },
    { label: 'Nốt sau', icon: 'play-skip-forward', action: onNext, primary: false },
  ] as const;
  return <View style={styles.row}>{controls.filter(control => allowSeek || !['Nốt trước', 'Nốt sau'].includes(control.label)).map(control => <TouchableOpacity key={control.label} disabled={disabled} accessibilityState={{ disabled }} accessibilityRole="button" accessibilityLabel={control.label} onPress={control.action} style={[styles.button, control.primary && styles.primary]}>
    <Ionicons name={control.icon} color={control.primary ? Colors.onPrimary : Colors.primary} size={22} />
    <Text style={[styles.label, control.primary && { color: Colors.onPrimary }]}>{control.label}</Text>
  </TouchableOpacity>)}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  button: { flexGrow: 1, flexBasis: 60, minHeight: 64, padding: 10, borderRadius: 8, backgroundColor: Colors.light.bgElevated, alignItems: 'center', justifyContent: 'center', gap: 6 },
  primary: { backgroundColor: Colors.primary }, label: { fontSize: 11, textAlign: 'center', color: Colors.primary },
});
