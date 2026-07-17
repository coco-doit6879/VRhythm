import React, { useMemo, useRef, useEffect } from "react";
import { View, ScrollView, Dimensions } from "react-native";

import { Score } from "../engine/models/Score";
import { createLayout } from "../engine/engines/LayoutEngine";

import Staff from "./Staff";
import Clef from "./Clef";
import TimeSignature from "./TimeSignature";
import Note from "./Note";
import Ledger from "./Ledger";
import Measure from "./Measure";
import Cursor from "./Cursor";

interface Props {
  score: Score;
  currentIndex?: number;
}

export default function SheetMusic({
  score,
  currentIndex = -1,
}: Props) {
  const layout = useMemo(
    () => createLayout(score, currentIndex),
    [score, currentIndex]
  );

  const scrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;

  const allNotes = useMemo(
    () => layout.measures.flatMap((m) => m.notes),
    [layout]
  );

  const noteForCursor = allNotes[currentIndex];

  useEffect(() => {
    if (!noteForCursor) return;

    const x = noteForCursor.x;

    const visibleLeft = x;
    const visibleRight = x;

    scrollRef.current?.scrollTo({
      x: Math.max(0, x - screenWidth / 2), // center cursor
      animated: true,
    });
  }, [currentIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View
        style={{
          flex: 1,
          position: "relative",
          minHeight: 300,
          width: 3000, // IMPORTANT: phải đủ rộng để scroll
        }}
      >
        <Staff />
        <Clef />
        <TimeSignature />

        {layout.measures.map((m) => (
          <React.Fragment key={m.index}>
            {m.notes.map((n) => (
              <React.Fragment key={n.id}>
                <Note layout={n} />
                <Ledger lines={n.ledgerLines} />
              </React.Fragment>
            ))}

            <Measure measure={m} />
          </React.Fragment>
        ))}

        {noteForCursor && (
          <Cursor x={noteForCursor.x} height={120} />
        )}
      </View>
    </ScrollView>
  );
}