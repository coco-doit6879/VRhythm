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

    const scale = 0.75;
    const visualX = noteForCursor.x * scale;

    scrollRef.current?.scrollTo({
      x: Math.max(0, visualX - screenWidth / 2), // center cursor using visual coordinate
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
      <View style={{ width: layout.width * 0.75 + 40, minHeight: layout.height * 0.75 }}>
        <View
          style={{
            position: "absolute",
            width: layout.width,
            height: layout.height,
            transform: [
              { translateX: 30 - layout.width * 0.125 },
              { translateY: -layout.height * 0.125 },
              { scale: 0.75 }
            ]
          }}
        >
          <Staff width={layout.width} staffTop={layout.staffTop} />
          <Clef staffTop={layout.staffTop} />
          <TimeSignature staffTop={layout.staffTop} />

          {layout.measures.map((m) => (
            <React.Fragment key={m.index}>
              {m.notes.map((n) => (
                <React.Fragment key={n.id}>
                  <Note layout={n} />
                  <Ledger lines={n.ledgerLines} />
                </React.Fragment>
              ))}

              <Measure measure={m} staffTop={layout.staffTop} />
            </React.Fragment>
          ))}

          {noteForCursor && (
            <Cursor x={noteForCursor.x} staffTop={layout.staffTop} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}