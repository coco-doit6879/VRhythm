import { Text } from '../../../ui/Typography';
import React, { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, View, AppState } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { Audio } from "expo-av";
import { BambooFluteNotes } from "../../../assets/bamboo_flute/rendered_notes";

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

import SheetMusic from "../SheetMusic/renderer/SheetMusic";
import FingeringCard from "../../components/FingeringCard";
import PlaybackControls from "../../components/PlaybackControls";
import { PitchDetectorService, pitchToNote } from "../../services/PitchDetector";

const FINGERING_MAP: Record<string, number[]> = {
  "C4": [1, 1, 1, 1, 1, 1],
  "D4": [1, 1, 1, 1, 1, 0],
  "E4": [1, 1, 1, 1, 0, 0],
  "F4": [1, 1, 1, 0, 0, 0],
  "G4": [1, 1, 0, 0, 0, 0],
  "A4": [1, 0, 0, 0, 0, 0],
  "B4": [0, 0, 0, 0, 0, 0],
  "C5": [1, 1, 1, 1, 1, 1],
  "D5": [1, 1, 1, 1, 1, 0],
  "E5": [1, 1, 1, 1, 0, 0],
  "F5": [1, 1, 1, 0, 0, 0],
  "G5": [1, 1, 0, 0, 0, 0],
  "A5": [1, 0, 0, 0, 0, 0],
  "B5": [0, 0, 0, 0, 0, 0],
  "C6": [1, 1, 1, 1, 1, 1],
  "D6": [1, 1, 1, 1, 1, 0],
  "E6": [1, 1, 1, 1, 0, 0],
  "F6": [1, 1, 1, 0, 0, 0],
  "G6": [1, 1, 0, 0, 0, 0],
  "A6": [1, 0, 0, 0, 0, 0],
  "B6": [0, 0, 0, 0, 0, 0],
  "C7": [1, 1, 1, 1, 1, 1],
};

interface Props {
  mode: 'normal' | 'exam';
  onComplete: (notes: string[]) => Promise<boolean>;
  practical: any;
}

export default function PracticalExamEngine({ mode, onComplete, practical }: Props) {
  function getNoteDurationMs(durationStr: string, tempo: number = 90) {
    const beatMs = (60 / (tempo || 90)) * 1000;
    const s = (durationStr || 'q').toString().trim().toLowerCase();
    switch (s) {
      case 'w': return beatMs * 4;
      case 'h': return beatMs * 2;
      case 'q': return beatMs * 1;
      case 'e':
      case '8': return beatMs * 0.5;
      case 's':
      case '16': return beatMs * 0.25;
      default: return beatMs;
    }
  }

  const score = useMemo(() => {
    try {
      const parsed = JSON.parse(practical?.sheetMusicJson || 'null');
      const notes = parsed?.notes;
      const metadata = parsed?.metadata;
      if (!Array.isArray(notes) || !notes.length || notes.length > 2000 ||
          !metadata || !Number.isFinite(metadata.tempo) || metadata.tempo <= 0 ||
          !Number.isInteger(metadata.timeSignature?.beats) || metadata.timeSignature.beats < 1 ||
          metadata.timeSignature.beats > 32 ||
          notes.some((n: any) => !n || typeof n.id !== 'string' || !/^[A-G][4-7]$/.test(n.pitch) ||
            !['w', 'h', 'q', '8', '16'].includes(n.duration))) return null;
      return parsed;
    } catch { return null; }
  }, [practical]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [engineError, setEngineError] = useState('');
  const [pendingNotes, setPendingNotes] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useRef(0);
  const mounted = useRef(true);
  const submissionLock = useRef(false);
  const recordedNotes = useRef<string[]>([]);
  const wrongCounter = useRef(0);
  const sounds = useRef(new Set<{ unloadAsync: () => Promise<unknown> }>());
  const soundTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const currentNote = score?.notes[currentIndex];

  function releaseResources() {
    session.current++;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    for (const timeout of soundTimers.current) clearTimeout(timeout);
    soundTimers.current.clear();
    for (const sound of sounds.current) void sound.unloadAsync().catch(() => {});
    sounds.current.clear();
    PitchDetectorService.stop();
  }

  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') { releaseResources(); setPlaying(false); }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
      releaseResources();
    };
  }, []);

  const sendAttempt = async (notes: string[]) => {
    if (submissionLock.current || !notes.length) return;
    submissionLock.current = true; setSubmitting(true); setPendingNotes(notes);
    try {
      const accepted = await onComplete(notes);
      if (mounted.current && accepted) setPendingNotes(null);
    } finally {
      submissionLock.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  useEffect(() => {
    if (mode !== 'exam' || !playing || !currentNote || !score) return;
    let cancelled = false;
    let advancing = false;
    let advanceTimer: ReturnType<typeof setTimeout> | undefined;
    const start = async () => {
      try {
        const allowed = await PitchDetectorService.requestPermission();
        if (cancelled) return;
        if (!allowed) throw new Error('Chưa có quyền micro. Hãy cấp quyền trong Cài đặt rồi nhấn Phát để thử lại.');
        PitchDetectorService.start(frequency => {
          if (cancelled || advancing) return;
          const note = frequency ? pitchToNote(frequency) : null;
          setDetectedNote(note);
          if (!note) return;
          if (note === currentNote.pitch) {
            advancing = true;
            recordedNotes.current[currentIndex] = note;
            wrongCounter.current = 0; setIsWrong(false);
            PitchDetectorService.stop();
            advanceTimer = setTimeout(() => {
              if (cancelled) return;
              if (currentIndex + 1 >= score.notes.length) {
                setPlaying(false);
                if (recordedNotes.current.length === score.notes.length &&
                    recordedNotes.current.every(n => typeof n === 'string')) {
                  void sendAttempt([...recordedNotes.current]);
                }
              } else setCurrentIndex(index => index + 1);
            }, getNoteDurationMs(currentNote.duration, score.metadata.tempo));
          } else {
            wrongCounter.current++;
            if (wrongCounter.current > 5) setIsWrong(true);
          }
        });
      } catch (error) {
        if (!cancelled) {
          setEngineError(error instanceof Error ? error.message : 'Không mở được micro. Hãy kiểm tra quyền và thử lại.');
          setPlaying(false);
        }
      }
    };
    void start();
    return () => { cancelled = true; if (advanceTimer) clearTimeout(advanceTimer); PitchDetectorService.stop(); };
  }, [mode, playing, currentIndex, score]);

  function stop() {
    releaseResources();
    setPlaying(false);
  }

  const playNoteAudio = async (pitch: string, durationMs: number, run: number) => {
    try {
      const audioResource = (BambooFluteNotes as any)[pitchToMidi(pitch).toString()];
      if (!audioResource) throw new Error('Chưa có âm thanh mẫu cho nốt này.');
      const { sound } = await Audio.Sound.createAsync(audioResource);
      if (session.current !== run || !mounted.current) { await sound.unloadAsync(); return; }
      sounds.current.add(sound);
      await sound.playAsync();
      if (session.current !== run) return;
      const timeout = setTimeout(() => {
        soundTimers.current.delete(timeout); sounds.current.delete(sound);
        void sound.unloadAsync().catch(() => {});
      }, durationMs);
      soundTimers.current.add(timeout);
    } catch {
      if (session.current === run && mounted.current) {
        stop(); setEngineError('Không phát được âm thanh mẫu. Hãy nhấn Phát để thử lại.');
      }
    }
  };

  function play() {
    if (playing || !score || submitting || pendingNotes) return;
    setEngineError(''); setPlaying(true);
    const run = ++session.current;
    if (mode === 'normal') {
      const playNextNote = (index: number) => {
        if (session.current !== run) return;
        if (index >= score.notes.length) { stop(); setCurrentIndex(0); return; }
        setCurrentIndex(index);
        const note = score.notes[index];
        const durationMs = getNoteDurationMs(note.duration, score.metadata.tempo);
        void playNoteAudio(note.pitch, durationMs, run);
        timer.current = setTimeout(() => playNextNote(index + 1), durationMs);
      };
      playNextNote(currentIndex);
    } else {
      // Every exam starts from the first note; seeking cannot fabricate an attempt.
      recordedNotes.current = []; setCurrentIndex(0);
    }
  }

  function pause() { stop(); }
  function reset() {
    if (submitting) return;
    stop(); setCurrentIndex(0); setIsWrong(false); setEngineError('');
    setPendingNotes(null); recordedNotes.current = []; wrongCounter.current = 0;
  }

  if (!score) return <View style={styles.container}>
    <Text accessibilityRole="alert">Bản nhạc chưa sẵn sàng. Hãy quay lại bài học và tải lại.</Text>
  </View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {score.metadata?.title || "Bài thực hành"} {mode === 'exam' ? '(Thi)' : ''}
      </Text>

      {!!engineError && <Text accessibilityRole="alert" style={{ color: Colors.danger, marginVertical: 12 }}>{engineError}</Text>}
      {pendingNotes && <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={() => void sendAttempt(pendingNotes)} style={styles.helpBtnToggle}>
        <Text>{submitting ? 'Đang gửi kết quả...' : 'Gửi lại bài thực hành'}</Text>
      </TouchableOpacity>}
      {mode === 'exam' && (
        <View style={styles.examStatus}>
          <Text style={styles.detectedNoteText}>
            Phát hiện: <Text style={{ fontWeight: 'bold', color: isWrong ? Colors.danger : Colors.primary}}>{detectedNote || '--'}</Text>
          </Text>
          <Text style={styles.targetNoteText}>
            Mục tiêu: {currentNote?.pitch}
          </Text>
        </View>
      )}

      <View style={isWrong ? styles.wrongHighlight : null}>
        <SheetMusic
          score={score}
          currentIndex={currentIndex}
        />
      </View>

      <View style={{ alignItems: 'center', marginTop: 0, marginBottom: 30 , alignSelf: 'stretch' }}>
        <View style={{ alignSelf: 'stretch' }}>
          <FingeringCard
            note={currentNote?.pitch}
            fingering={FINGERING_MAP[currentNote?.pitch] || []}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showHelp }} onPress={() => setShowHelp(!showHelp)} style={styles.helpBtnToggle}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.helpBtnText}>Hướng dẫn cầm sáo</Text>
          </TouchableOpacity>
        </View>

        {showHelp && (
          <View style={styles.helpSection}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
              <Text style={styles.helpText}>
                Gợi ý: Cầm sáo ngang, giữ thẳng lưng. Các nốt màu xám là lỗ mở, nốt đen là lỗ đóng. Lỗ số 1 gần miệng thổi nhất.
              </Text>
            </View>
            <View style={styles.helpImagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={Colors.primary} />
              <Text style={{ color: Colors.primary, fontSize: 12, marginTop: 8 }}>Ảnh minh họa thế bấm</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ marginTop: 'auto' }}>
        <PlaybackControls
          playing={playing}
          disabled={submitting || !!pendingNotes}
          allowSeek={mode === 'normal'}
          onPlay={play}
          onPause={pause}
          onStop={reset}
          onPrev={() => { stop(); setCurrentIndex((i) => Math.max(0, i - 1)); }}
          onNext={() => { stop(); setCurrentIndex((i) => Math.min(score.notes.length - 1, i + 1)); }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.bg,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: Colors.light.text,
  },
  examStatus: {
    flexWrap: 'wrap',
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  detectedNoteText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  targetNoteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  wrongHighlight: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 8,
  },
  helpBtnToggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.selected,
  },
  helpBtnText: {
    marginLeft: 6,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  helpSection: {
    backgroundColor: Colors.successBg,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.selected,
  },
  helpText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 20,
  },
  helpImagePlaceholder: {
    marginTop: 12,
    height: 120,
    backgroundColor: Colors.selected,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  }
});
