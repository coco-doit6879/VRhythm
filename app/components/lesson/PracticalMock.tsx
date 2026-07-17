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

export default function PracticeMock() {
  const score = useMemo(() => {
    return {
      metadata: raw.metadata,
      notes: raw.notes,
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timer = useRef<number | null>(null);

  const currentNote = score.notes[currentIndex];

  function stop() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  }

  function play() {
    if (playing) return;

    setPlaying(true);

    let i = currentIndex;

    timer.current = setInterval(() => {
      i++;

      if (i >= score.notes.length) {
        stop();
        return;
      }

      setCurrentIndex(i);
    }, 700);
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
        Twinkle Twinkle Little Star
      </Text>

      <SheetMusic
        score={score}
        currentIndex={currentIndex}
      />

      <FingeringCard
        note={currentNote?.pitch}
        fingering={FINGERING_MAP[currentNote?.pitch] || []}
      />

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