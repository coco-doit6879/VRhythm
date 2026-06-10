import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const STRINGS_DAN_TRANH = [
  { label: 'Dây 1', note: 'D5', active: true },
  { label: 'Dây 2', note: 'A4', active: false },
  { label: 'Dây 3', note: 'G4', active: false },
  { label: 'Dây 4', note: 'E4', active: false },
  { label: 'Dây 5', note: 'D4', active: false },
  { label: 'Dây 6', note: 'C4', active: false },
];

export default function TunerScreen() {
  const [selectedString, setSelectedString] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // Simulated tuner state
  const cent = 0;
  const currentNote = STRINGS_DAN_TRANH[selectedString].note;
  const tuneStatus = cent === 0 ? 'Chuẩn' : cent < 0 ? 'Thấp' : 'Cao';
  const tuneColor = cent === 0 ? Colors.primary : cent < 0 ? Colors.info : Colors.danger;

  // Needle angle: 0 cents = straight up (0 deg), ±50 = max ±90 deg
  const needleAngle = (cent / 50) * 85;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bộ lên dây điện tử</Text>
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={() => setIsListening(!isListening)}
          >
            <Ionicons name="mic" size={20} color={isListening ? '#FFF' : Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Instrument Selector */}
          <View style={styles.instrumentSelector}>
            <View style={styles.instrumentInfo}>
              <View style={styles.instrumentIconWrap}>
                <Text style={{ fontSize: 22 }}>🎵</Text>
              </View>
              <View>
                <Text style={styles.instrumentSelectLabel}>ĐANG CHỌN</Text>
                <Text style={styles.instrumentName}>Đàn Tranh (19 dây)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Thay đổi</Text>
            </TouchableOpacity>
          </View>

          {/* Tuner Meter */}
          <View style={styles.tunerCard}>
            <Text style={styles.currentStringLabel}>
              {STRINGS_DAN_TRANH[selectedString].label}
            </Text>
            <Text style={styles.currentNote}>{currentNote}</Text>

            {/* Semicircle meter */}
            <View style={styles.meterContainer}>
              {/* Background arc */}
              <View style={styles.meterArc}>
                {/* Scale marks */}
                {[-50, -25, 0, 25, 50].map((val) => (
                  <View
                    key={val}
                    style={[
                      styles.scaleMark,
                      {
                        left: ((val + 50) / 100) * (width - 100) + 8,
                        bottom: val === 0 ? 60 : 40,
                      },
                    ]}
                  />
                ))}
                <Text style={[styles.scaleLabel, { left: 4 }]}>-50</Text>
                <Text style={[styles.scaleLabel, { right: 4 }]}>+50</Text>
                {/* 0 mark */}
                <View style={[styles.zeroMark, { left: (width - 100) / 2 - 1 }]} />
                <Text style={[styles.zeroLabel, { left: (width - 100) / 2 - 6 }]}>0</Text>

                {/* Needle */}
                <View style={styles.needleOrigin}>
                  <View
                    style={[
                      styles.needle,
                      { transform: [{ rotate: `${needleAngle}deg` }] },
                    ]}
                  />
                </View>

                {/* Needle pivot */}
                <View style={styles.needlePivot} />
              </View>
            </View>

            {/* Status */}
            <View style={[styles.tuneStatusBadge, { backgroundColor: tuneColor + '20' }]}>
              <Text style={[styles.tuneStatusText, { color: tuneColor }]}>{tuneStatus}</Text>
              <Text style={[styles.centsText, { color: tuneColor }]}>{cent} cents</Text>
            </View>
          </View>

          {/* Strings List */}
          <View style={styles.stringsSection}>
            <View style={styles.stringsSectionHeader}>
              <Text style={styles.sectionTitle}>DANH SÁCH DÂY ĐÀN</Text>
              <Text style={styles.sampleHint}>Chạm để nghe âm mẫu</Text>
            </View>
            <View style={styles.stringsGrid}>
              {STRINGS_DAN_TRANH.map((str, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.stringCard, selectedString === idx && styles.stringCardActive]}
                  onPress={() => setSelectedString(idx)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={[styles.stringLabel, selectedString === idx && styles.stringLabelActive]}>
                      {str.label}
                    </Text>
                    <Text style={[styles.stringNote, selectedString === idx && styles.stringNoteActive]}>
                      {str.note}
                    </Text>
                  </View>
                  <View style={[styles.playStringBtn, selectedString === idx && styles.playStringBtnActive]}>
                    <Ionicons
                      name="volume-medium"
                      size={16}
                      color={selectedString === idx ? '#FFF' : Colors.light.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.text },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  micBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  content: { paddingHorizontal: 20 },

  instrumentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  instrumentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  instrumentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  instrumentSelectLabel: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  instrumentName: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginTop: 2 },
  changeBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  changeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.light.text },

  tunerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  currentStringLabel: { fontSize: 13, color: Colors.light.textMuted, marginBottom: 6 },
  currentNote: { fontSize: 56, fontWeight: '900', color: Colors.primary, marginBottom: 16 },

  meterContainer: { width: '100%', alignItems: 'center', marginBottom: 20 },
  meterArc: {
    width: width - 88,
    height: 100,
    borderTopLeftRadius: (width - 88) / 2,
    borderTopRightRadius: (width - 88) / 2,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.bgElevated,
    position: 'relative',
    overflow: 'visible',
  },
  scaleMark: { position: 'absolute', width: 1.5, height: 12, backgroundColor: Colors.light.textMuted },
  scaleLabel: { position: 'absolute', bottom: 4, fontSize: 11, color: Colors.light.textMuted },
  zeroMark: { position: 'absolute', bottom: 0, height: 20, width: 1.5, backgroundColor: Colors.primary },
  zeroLabel: { position: 'absolute', top: 8, fontSize: 12, fontWeight: '600', color: Colors.primary },
  needleOrigin: {
    position: 'absolute',
    bottom: 0,
    left: (width - 88) / 2 - 1,
    alignItems: 'center',
  },
  needle: {
    width: 2,
    height: 80,
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    transformOrigin: 'bottom',
  },
  needlePivot: {
    position: 'absolute',
    bottom: -6,
    left: (width - 88) / 2 - 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },

  tuneStatusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  tuneStatusText: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  centsText: { fontSize: 12, fontWeight: '600' },

  stringsSection: { marginBottom: 20 },
  stringsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: Colors.light.textMuted },
  sampleHint: { fontSize: 12, color: Colors.primary },

  stringsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stringCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stringCardActive: { borderColor: Colors.primary, backgroundColor: Colors.light.bgElevated },
  stringLabel: { fontSize: 11, color: Colors.light.textMuted, marginBottom: 4 },
  stringLabelActive: { color: Colors.primary, fontWeight: '600' },
  stringNote: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  stringNoteActive: { color: Colors.primary },
  playStringBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playStringBtnActive: { backgroundColor: Colors.primary },
});
