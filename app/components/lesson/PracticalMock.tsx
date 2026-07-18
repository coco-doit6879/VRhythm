import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import SheetMusic from "../SheetMusic/renderer/SheetMusic";
import FingeringCard from "../../components/FingeringCard";
import PlaybackControls from "../../components/PlaybackControls";

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

// ==========================================
// ADJUST SPEED HERE
// 1.0 = Normal speed (based on JSON tempo)
// 0.5 = Twice as fast
// 2.0 = Twice as slow
// ==========================================
const SPEED_MULTIPLIER = 1.0;

export default function PracticeMock() {
  function getNoteDurationMs(durationStr: string, tempo: number = 90) {
    const beatMs = (60 / (tempo || 90)) * 1000 * SPEED_MULTIPLIER;
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
  const score = {
    metadata: raw.metadata,
    notes: raw.notes,
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timer = useRef<number | null>(null);

  const currentNote = score.notes[currentIndex];

  function stop() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  }

  function play() {
    if (playing) return;

    setPlaying(true);

    const playNextNote = (index: number) => {
      if (index >= score.notes.length) {
        stop();
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

  function pause() {
    stop();
  }

  function reset() {
    stop();
    setCurrentIndex(0);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {score.metadata?.title || "Twinkle Twinkle Little Star"}
      </Text>

      <SheetMusic
        score={score}
        currentIndex={currentIndex}
      />

      <View style={{ alignItems: 'center', marginTop: 10, alignSelf: 'stretch' }}>
        <View style={{ alignSelf: 'stretch' }}>
          <FingeringCard
            note={currentNote?.pitch}
            fingering={FINGERING_MAP[currentNote?.pitch] || []}
          />
        </View>
        
        {currentIndex + 1 < score.notes.length && (
          <View style={{ opacity: 0.5, marginTop: -15, zIndex: -1, alignSelf: 'stretch' }}>
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
        onPrev={() =>
          setCurrentIndex((i) => Math.max(0, i - 1))
        }
        onNext={() =>
          setCurrentIndex((i) =>
            Math.min(score.notes.length - 1, i + 1)
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
});