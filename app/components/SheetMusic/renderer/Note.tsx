// renderer/Note.tsx

import React from "react";
import { View } from "react-native";
import { LayoutNote } from "../engine/models/Layout";
import MusicGlyph from "./MusicGlyph";

interface Props {
  layout: LayoutNote;
}

export default function Note({ layout }: Props) {
  const stemTop = Math.min(layout.stem?.y1 ?? 0, layout.stem?.y2 ?? 0);
  const stemBottom = Math.max(layout.stem?.y1 ?? 0, layout.stem?.y2 ?? 0);

  return (
    <View
      style={{
        position: "absolute",
        left: layout.x,
        top: layout.y ,
      }}
    >
      <MusicGlyph glyph={layout.noteHead} x={0} y={0} />

      {layout.stem && (
        <View
          style={{
            position: "absolute",
            left: layout.stem.x - layout.x,
            top: stemTop - layout.y,
            width: 2,
            height: stemBottom - stemTop,
            backgroundColor: "#111",
          }}
        />
      )}

      {layout.ledgerLines && layout.ledgerLines.map((line, idx) => (
        <View
          key={`ledger-${idx}`}
          style={{
            position: "absolute",
            left: line.x1 - layout.x,
            top: line.y - layout.y,
            width: line.x2 - line.x1,
            height: 2,
            backgroundColor: "#111",
          }}
        />
      ))}
    </View>
  );
}