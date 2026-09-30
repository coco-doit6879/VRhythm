import { Text } from '../../ui/Typography';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import SheetMusic from '../components/SheetMusic/renderer/SheetMusic';
import FingeringCard from '../components/FingeringCard';
import { Audio, Video, ResizeMode } from 'expo-av';
import { BambooFluteNotes } from '../../assets/bamboo_flute/rendered_notes';

function pitchToMidi(pitch: string): number {
  if (!pitch) return 60;
  const notes = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
  const regex = /^([A-G])(#|s|b)?(\d)$/;
  const match = pitch.match(regex);
  if (!match) return 60;

  let noteStr = match[1];
  const acc = match[2];
  const oct = parseInt(match[3], 10);

  if (acc === '#' || acc === 's') noteStr += 's';
  else if (acc === 'b') {
    const flatMap: Record<string, string> = {
      'Db': 'Cs', 'Eb': 'Ds', 'Gb': 'Fs', 'Ab': 'Gs', 'Bb': 'As'
    };
    noteStr = flatMap[noteStr + 'b'] || noteStr;
  }

  const noteIndex = notes.indexOf(noteStr);
  if (noteIndex === -1) return 60;

  return (oct + 1) * 12 + noteIndex;
}

const FINGERING_MAP: Record<string, number[]> = {
  "C4": [1, 1, 1, 1, 1, 1], "D4": [1, 1, 1, 1, 1, 0], "E4": [1, 1, 1, 1, 0, 0],
  "F4": [1, 1, 1, 0, 0, 0], "G4": [1, 1, 0, 0, 0, 0], "A4": [1, 0, 0, 0, 0, 0],
  "B4": [0, 0, 0, 0, 0, 0], "C5": [1, 1, 1, 1, 1, 1], "D5": [1, 1, 1, 1, 1, 0],
  "E5": [1, 1, 1, 1, 0, 0], "F5": [1, 1, 1, 0, 0, 0], "G5": [1, 1, 0, 0, 0, 0],
  "A5": [1, 0, 0, 0, 0, 0], "B5": [0, 0, 0, 0, 0, 0],
  "C6": [1, 1, 1, 1, 1, 1], "D6": [1, 1, 1, 1, 1, 0], "E6": [1, 1, 1, 1, 0, 0],
  "F6": [1, 1, 1, 0, 0, 0], "G6": [1, 1, 0, 0, 0, 0], "A6": [1, 0, 0, 0, 0, 0],
  "B6": [0, 0, 0, 0, 0, 0], "C7": [1, 1, 1, 1, 1, 1],
};

const saotruckData = require('../components/lesson/saotruck_holes.json');
const senbonzakuraData = require('../components/lesson/senbonzakura.json');
const lycayxanhData = require('../components/lesson/lycayxanh.json');
const lactroiData = require('../components/lesson/lactroi.json');

const MUSIC_DATA: Record<string, any> = {
  '1': saotruckData,
  '2': senbonzakuraData,
  '3': lycayxanhData,
  '4': lactroiData,
};

export default function SheetMusicPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tab, setTab] = useState('Bản nhạc');

  const raw = MUSIC_DATA[id] || saotruckData;
  const score = {
    metadata: raw.metadata,
    notes: raw.notes,
  };

  const activeSounds = useRef<any[]>([]);
  const videoRef = useRef<any>(null);

  const stopAllSounds = async () => {
    for (const s of activeSounds.current) {
      try {
        await s.stopAsync();
        await s.unloadAsync();
      } catch (e) {}
    }
    activeSounds.current = [];
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsPlaying(false);
        stopAllSounds();
        videoRef.current?.stopAsync();
      };
    }, [])
  );

  const playNote = async (pitch: string, durationStr: string, tempo: number) => {
    try {
      const midi = pitchToMidi(pitch);
      const audioResource = (BambooFluteNotes as any)[midi.toString()];
      if (audioResource) {
        const { sound } = await Audio.Sound.createAsync(audioResource);
        activeSounds.current.push(sound);
        await sound.playAsync();

        let durationMs = (60 / tempo) * 1000;
        const d = String(durationStr).toLowerCase();
        if (d.includes('w')) durationMs *= 4;
        else if (d.includes('h')) durationMs *= 2;
        else if (d.includes('8')) durationMs /= 2;
        else if (d.includes('16')) durationMs /= 4;
        if (d.includes('d')) durationMs *= 1.5;

        let isUnloaded = false;
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            isUnloaded = true;
            sound.unloadAsync();
            activeSounds.current = activeSounds.current.filter((s) => s !== sound);
          }
        });

        setTimeout(async () => {
          try {
            if (!isUnloaded) {
              isUnloaded = true;
              await sound.stopAsync();
              await sound.unloadAsync();
              activeSounds.current = activeSounds.current.filter((s) => s !== sound);
            }
          } catch (e) {}
        }, durationMs);
      }
    } catch (e) {
      console.warn('Error playing note:', e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const tempo = score.metadata.tempo || 120;
      const currentNote = score.notes[currentIndex];
      if (currentNote && currentNote.pitch) {
        playNote(currentNote.pitch, currentNote.duration || 'q', tempo);
      }

      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= score.notes.length) {
            setIsPlaying(false);
            return 0;
          }
          const nextNote = score.notes[next];
          if (nextNote && nextNote.pitch) {
            playNote(nextNote.pitch, nextNote.duration || 'q', tempo);
          }
          return next;
        });
      }, (60 / tempo) * 1000);
    } else {
      stopAllSounds();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, score.metadata.tempo, score.notes.length]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{score.metadata.title}</Text>

      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerTitle}>{score.metadata.title}</Text>
              <Text style={styles.playerMeta}>{score.metadata.composer || "Nhạc Quốc Tế"} • Sáo trúc</Text>
            </View>

          </View>

          <View style={[styles.sheetMusicPreview, { paddingVertical: 10 }]}>
            <View style={{ transform: [{ scale: 1 }], marginTop: 0, pointerEvents: 'auto' }}>
              <SheetMusic score={score} currentIndex={currentIndex} />
            </View>
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={isPlaying ? "Tạm dừng bản nhạc" : "Phát bản nhạc"} style={[styles.playBtn, isPlaying && styles.playBtnActive]} onPress={() => setIsPlaying(!isPlaying)}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Dừng bản nhạc" style={[styles.playBtn, { width: 48, height: 48, backgroundColor: Colors.light.bgElevated }]} onPress={() => { setIsPlaying(false); setCurrentIndex(0); }}>
              <Ionicons name={'stop'} size={16} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <View style={styles.bpmControl}>
              <Ionicons name="sync-outline" size={14} color={Colors.primary} />
              <Text style={styles.bpmText}>{score.metadata.tempo || 120} BPM</Text>
            </View>
            <View style={styles.autoScrollRow}>
              <Text style={styles.autoScrollLabel}>TỰ ĐỘNG CUỘN</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.tabsRow}>
            {['Bản nhạc', 'Hợp âm', 'Video mẫu'].map((t) => (
              <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: tab === t }} key={t} onPress={() => setTab(t)} style={[styles.tabItem, tab === t && styles.tabItemActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'Bản nhạc' && (
            <View style={{ marginTop: 24 }}>
              <FingeringCard
                note={score.notes[currentIndex]?.pitch}
                fingering={FINGERING_MAP[score.notes[currentIndex]?.pitch] || []}
                title="Hướng dẫn bấm nốt"
              />
            </View>
          )}

          {tab === 'Hợp âm' && (
            <View style={styles.emptyTab}>
              <Ionicons name="musical-notes-outline" size={48} color={Colors.light.textMuted} />
              <Text style={styles.emptyTabTitle}>Hợp âm đệm hát</Text>
              <Text style={styles.emptyTabText}>Tính năng đang được phát triển. Sắp tới bạn có thể xem hợp âm Guitar/Piano đệm theo ở đây nhé!</Text>
            </View>
          )}

          {tab === 'Video mẫu' && <View style={styles.emptyTab}><Ionicons name="videocam-outline" size={40} color={Colors.primary} /><Text style={styles.emptyTabTitle}>Video mẫu đang được cập nhật</Text><Text style={styles.emptyTabText}>Bạn có thể nghe bản nhạc và xem hướng dẫn bấm nốt trong lúc chờ video.</Text></View>}
        </View>
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
    paddingVertical: 14,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 17, fontWeight: '700', color: Colors.light.text },
  bookmarkBtn: { padding: 8 },
  content: { paddingBottom: 40, width: '100%', maxWidth: 760, alignSelf: 'center' },
  playerCard: {
    backgroundColor: Colors.light.bgCard,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  playerTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  playerMeta: { fontSize: 13, color: Colors.light.textMuted },
  playerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetMusicPreview: {
    minHeight: 140,
    backgroundColor: Colors.sheet,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  playerControls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 16 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: { backgroundColor: Colors.primary },
  bpmControl: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 10 },
  bpmText: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  autoScrollRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  autoScrollLabel: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.5 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 3,
    alignItems: 'flex-end',
  },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.light.bgCard },
  tabsRow: { flexDirection: 'row', gap: 0 },
  tabItem: { flex: 1, minHeight: 48, justifyContent: 'center', paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.light.textMuted },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  emptyTab: { marginTop: 32, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTabTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginTop: 12, marginBottom: 8 },
  emptyTabText: { fontSize: 14, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 22 },
  videoTab: { marginTop: 24, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F0F0F0' },
  video: { width: '100%', height: 200, backgroundColor: '#000' },
  videoHint: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, backgroundColor: '#F8F8F8' },
  videoHintText: { fontSize: 13, color: Colors.light.textSecondary, flex: 1 },
});
