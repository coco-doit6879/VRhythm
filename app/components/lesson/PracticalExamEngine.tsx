import React, { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
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
  onComplete: () => void;
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
    if (practical?.sheetMusicJson) {
      try {
        return JSON.parse(practical.sheetMusicJson);
      } catch (e) {
        console.warn("Failed to parse sheetMusicJson", e);
      }
    }
    return {
      metadata: { title: "Bản nhạc chưa tải" },
      notes: [],
    };
  }, [practical]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const timer = useRef<number | null>(null);
  const wrongCounter = useRef<number>(0);
  
  const currentNote = score.notes[currentIndex];

  useEffect(() => {
    if (mode === 'exam' && playing) {
      startExamMode();
    } else {
      PitchDetectorService.stop();
    }
    return () => {
      PitchDetectorService.stop();
    };
  }, [mode, playing, currentIndex]);

  const startExamMode = async () => {
    const hasPermission = await PitchDetectorService.requestPermission();
    if (!hasPermission) {
      Alert.alert("Lỗi", "Không có quyền truy cập micro.");
      setPlaying(false);
      return;
    }

    PitchDetectorService.start((frequency) => {
      if (!frequency || frequency <= 0) {
         setDetectedNote(null);
         return;
      }
      
      const note = pitchToNote(frequency);
      setDetectedNote(note);

      if (note) {
        if (note === currentNote.pitch) {
          // Correct!
          wrongCounter.current = 0;
          setIsWrong(false);
          
          // Advance note
          PitchDetectorService.stop(); // stop briefly to avoid double trigger
          
          const durationMs = getNoteDurationMs(currentNote.duration || 'q', score.metadata.tempo || 90);
          
          setTimeout(() => {
            if (currentIndex + 1 >= score.notes.length) {
              setPlaying(false);
              onComplete();
            } else {
              setCurrentIndex(prev => prev + 1);
            }
          }, durationMs);
        } else {
          wrongCounter.current += 1;
          if (wrongCounter.current > 5) {
             setIsWrong(true);
          }
        }
      }
    });
  };

  function stop() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    PitchDetectorService.stop();
    setPlaying(false);
  }

  const playNoteAudio = async (pitch: string, durationMs: number) => {
    try {
      const midi = pitchToMidi(pitch);
      const audioResource = (BambooFluteNotes as any)[midi.toString()];
      if (audioResource) {
        const { sound } = await Audio.Sound.createAsync(audioResource);
        await sound.playAsync();

        let isUnloaded = false;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            isUnloaded = true;
            sound.unloadAsync();
          }
        });

        setTimeout(async () => {
          try {
            if (!isUnloaded) {
              isUnloaded = true;
              await sound.stopAsync();
              await sound.unloadAsync();
            }
          } catch (e) {}
        }, durationMs);
      }
    } catch (e) {
      console.warn('Error playing note:', e);
    }
  };

  function play() {
    if (playing) return;
    setPlaying(true);

    if (mode === 'normal') {
      const playNextNote = (index: number) => {
        if (index >= score.notes.length) {
          stop();
          onComplete();
          return;
        }
        setCurrentIndex(index);
        
        const note = score.notes[index];
        const durationMs = getNoteDurationMs(note.duration || 'q', score.metadata.tempo || 90);
        
        if (note && note.pitch) {
          playNoteAudio(note.pitch, durationMs);
        }

        timer.current = setTimeout(() => {
          playNextNote(index + 1);
        }, durationMs) as any;
      };
      
      playNextNote(currentIndex);
    }
  }

  function pause() {
    stop();
  }

  function reset() {
    stop();
    setCurrentIndex(0);
    setIsWrong(false);
    wrongCounter.current = 0;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {score.metadata?.title || "Twinkle Twinkle Little Star"} {mode === 'exam' ? '(Thi)' : ''}
      </Text>

      {mode === 'exam' && (
        <View style={styles.examStatus}>
          <Text style={styles.detectedNoteText}>
            Phát hiện: <Text style={{ fontWeight: 'bold', color: isWrong ? 'red' : 'green'}}>{detectedNote || '--'}</Text>
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
          <TouchableOpacity onPress={() => setShowHelp(!showHelp)} style={styles.helpBtnToggle}>
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
              <Ionicons name="image-outline" size={40} color="#81C784" />
              <Text style={{ color: '#2E7D32', fontSize: 12, marginTop: 8 }}>Ảnh minh họa thế bấm</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ marginTop: 'auto' }}>
        <PlaybackControls
          playing={playing}
          onPlay={play}
          onPause={pause}
          onStop={reset}
          onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex((i) => Math.min(score.notes.length - 1, i + 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#333333",
  },
  examStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  detectedNoteText: {
    fontSize: 16,
    color: "#333333",
  },
  targetNoteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#333333",
  },
  wrongHighlight: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
  },
  helpBtnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  helpBtnText: {
    marginLeft: 6,
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  helpSection: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  helpText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 20,
  },
  helpImagePlaceholder: {
    marginTop: 12,
    height: 120,
    backgroundColor: '#C8E6C9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderStyle: 'dashed',
  }
});
