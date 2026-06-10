import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const WAVE_BARS = 32;

type NoteResult = { time: number; type: 'correct' | 'wrong' | 'late' };

const NOTES: NoteResult[] = [
  { time: 0, type: 'correct' },
  { time: 1, type: 'correct' },
  { time: 2, type: 'wrong' },
  { time: 3, type: 'late' },
  { time: 4, type: 'correct' },
  { time: 5, type: 'correct' },
  { time: 6, type: 'correct' },
  { time: 7, type: 'late' },
  { time: 8, type: 'correct' },
];

export default function AIScoringScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(45);
  const waveAnimations = useRef(
    Array.from({ length: WAVE_BARS }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      const animateWaves = () => {
        waveAnimations.forEach((anim) => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: Math.random() * 0.7 + 0.3,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0.15,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
            ])
          ).start();
        });
      };
      animateWaves();
      interval = setInterval(() => setTimer((t) => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const totalScore = 85;
  const pitchScore = 88;
  const rhythmScore = 82;
  const stabilityScore = 85;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chấm điểm</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Practice Card */}
          <View style={styles.practiceCard}>
            <View style={styles.practiceCardTop}>
              <View>
                <Text style={styles.practiceLabel}>BÀI TẬP THỰC HÀNH</Text>
                <Text style={styles.practiceTitle}>Lý ngựa ô</Text>
                <Text style={styles.practiceMeta}>Đàn tranh • Cơ bản</Text>
              </View>
              <View style={[styles.recBadge, isRecording && styles.recBadgeActive]}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>REC {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</Text>
              </View>
            </View>

            {/* Waveform */}
            <View style={styles.waveformContainer}>
              {waveAnimations.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      transform: [{ scaleY: anim }],
                      backgroundColor: isRecording
                        ? (i % 3 === 0 ? Colors.primarySoft : Colors.primaryLight)
                        : Colors.accent + '60',
                    },
                  ]}
                />
              ))}
              {/* Stop button overlay */}
              <TouchableOpacity
                style={styles.waveStopBtn}
                onPress={() => setIsRecording(!isRecording)}
              >
                <View style={[styles.stopIcon, isRecording && styles.stopIconActive]}>
                  {isRecording ? (
                    <View style={styles.stopSquare} />
                  ) : (
                    <Ionicons name="play" size={20} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Kết quả của bạn</Text>
            <View style={styles.scoreRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4].map((i) => (
                  <Ionicons key={i} name="star" size={18} color="#F4A261" />
                ))}
                <Ionicons name="star-half" size={18} color="#F4A261" />
                <Text style={styles.scoreGrade}>Tốt</Text>
              </View>
              <Text style={styles.scoreBig}>
                <Text style={styles.scoreNum}>{totalScore}</Text>
                <Text style={styles.scoreDenom}>/100</Text>
              </Text>
            </View>
          </View>

          {/* Sub Scores */}
          <View style={styles.subScoresRow}>
            {[
              { label: 'Cao độ', score: pitchScore, icon: 'musical-note-outline', color: Colors.primary, bg: '#EBF6F0' },
              { label: 'Nhịp điệu', score: rhythmScore, icon: 'swap-vertical-outline', color: Colors.info, bg: '#EBF2FE' },
              { label: 'Độ ổn định', score: stabilityScore, icon: 'dice-outline', color: Colors.warning, bg: '#FEF3E8' },
            ].map((item) => (
              <View key={item.label} style={styles.subScoreCard}>
                <View style={[styles.subScoreIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.subScoreLabel}>{item.label}</Text>
                <Text style={[styles.subScoreNum, { color: item.color }]}>{item.score}/100</Text>
              </View>
            ))}
          </View>

          {/* Detailed Analysis */}
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Phân tích chi tiết</Text>
            <View style={styles.analysisLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendText}>Đúng</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.legendText}>Sai</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendText}>Trễ nhịp</Text>
              </View>
            </View>

            {/* Visual notes timeline */}
            <View style={styles.notesTimeline}>
              <View style={styles.timelineBase} />
              {NOTES.map((note, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.noteMarker,
                    {
                      left: (idx / (NOTES.length - 1)) * (width - 88) + 4,
                      bottom: note.type === 'correct' ? 20 + Math.sin(idx * 0.8) * 16
                        : note.type === 'wrong' ? 2
                        : 10,
                    },
                  ]}
                >
                  <Ionicons
                    name="musical-note"
                    size={20}
                    color={
                      note.type === 'correct' ? Colors.primary
                        : note.type === 'wrong' ? Colors.danger
                        : Colors.warning
                    }
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Suggestions */}
          <View style={styles.suggestCard}>
            <View style={styles.suggestHeader}>
              <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
              <Text style={styles.suggestTitle}>Gợi ý cải thiện</Text>
            </View>
            <Text style={styles.suggestItem}>• Giữ nhịp ổn định hơn ở đoạn điệp khúc.</Text>
            <Text style={styles.suggestItem}>• Nhấn đúng cao độ ở các nốt trầm.</Text>
            <Text style={styles.suggestItem}>• Luyện tập ngón mềm mại hơn để tiếng đàn trong trẻo.</Text>
          </View>

          {/* Retry Button */}
          <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryBtnText}>Thực hiện lại bài tập</Text>
          </TouchableOpacity>
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
  shareBtn: { padding: 8 },

  content: { paddingHorizontal: 20 },

  practiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  practiceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  practiceLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 4 },
  practiceTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text, marginBottom: 2 },
  practiceMeta: { fontSize: 12, color: Colors.light.textMuted },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  recBadgeActive: { backgroundColor: '#FECACA' },
  recDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.danger },
  recText: { fontSize: 11, fontWeight: '700', color: Colors.danger },

  waveformContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 14,
    paddingHorizontal: 12,
    gap: 3,
    overflow: 'hidden',
  },
  waveBar: {
    flex: 1,
    height: 50,
    borderRadius: 3,
  },
  waveStopBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -18,
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIconActive: { backgroundColor: Colors.danger },
  stopSquare: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#FFF' },

  scoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreLabel: { fontSize: 12, color: Colors.light.textMuted, marginBottom: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scoreGrade: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: Colors.light.textSecondary },
  scoreBig: {},
  scoreNum: { fontSize: 42, fontWeight: '900', color: Colors.light.text },
  scoreDenom: { fontSize: 20, color: Colors.light.textMuted },

  subScoresRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  subScoreCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  subScoreIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  subScoreLabel: { fontSize: 11, color: Colors.light.textMuted, textAlign: 'center' },
  subScoreNum: { fontSize: 14, fontWeight: '800' },

  analysisCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  analysisTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 12 },
  analysisLegend: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.light.textMuted },
  notesTimeline: { height: 70, position: 'relative', marginTop: 8 },
  timelineBase: { position: 'absolute', bottom: 8, left: 0, right: 0, height: 2, backgroundColor: Colors.light.bgElevated },
  noteMarker: { position: 'absolute' },

  suggestCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  suggestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  suggestTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  suggestItem: { fontSize: 13, color: Colors.light.textSecondary, lineHeight: 22 },

  retryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
