import React, { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SheetMusic from "../SheetMusic/renderer/SheetMusic";
import FingeringCard from "../../components/FingeringCard";
import PlaybackControls from "../../components/PlaybackControls";
import { PitchDetectorService, pitchToNote } from "../../services/PitchDetector";

const raw = require("./saotruck_holes.json");

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
      case 'e': return beatMs * 0.5;
      case 's': return beatMs * 0.25;
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
      metadata: raw.metadata,
      notes: raw.notes,
    };
  }, [practical]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);

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

      <View style={{ alignItems: 'center', marginTop: -30, marginBottom: 30 , alignSelf: 'stretch' }}>
        <View style={{ alignSelf: 'stretch' }}>
          <FingeringCard
            note={currentNote?.pitch}
            fingering={FINGERING_MAP[currentNote?.pitch] || []}
          />
        </View>
        
        {currentIndex + 1 < score.notes.length && (
          <View style={{ opacity: 0.5, marginTop: -10, zIndex: -1, alignSelf: 'stretch' }}>
            <FingeringCard
              note={score.notes[currentIndex + 1]?.pitch}
              fingering={FINGERING_MAP[score.notes[currentIndex + 1]?.pitch] || []}
              title="Tiếp theo"
            />
          </View>
        )}
      </View>

      <PlaybackControls
        playing={playing}
        onPlay={play}
        onPause={pause}
        onStop={reset}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentIndex((i) => Math.min(score.notes.length - 1, i + 1))}
      />
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
  },
  examStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  detectedNoteText: {
    fontSize: 16,
  },
  targetNoteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wrongHighlight: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
  }
});
