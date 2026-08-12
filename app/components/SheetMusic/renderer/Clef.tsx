// renderer/Clef.tsx

import React from "react";
import MusicGlyph from "./MusicGlyph";

export default function Clef() {
  return (
    <MusicGlyph
      glyph="treble"
      x={40}
      y={60}
      size={80}
    />
  );
}