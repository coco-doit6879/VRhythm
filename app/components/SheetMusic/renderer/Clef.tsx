// renderer/Clef.tsx

import React from "react";
import MusicGlyph from "./MusicGlyph";

export default function Clef({ staffTop = 40 }: { staffTop?: number }) {
  return (
    <MusicGlyph
      glyph="treble"
      x={40}
      y={staffTop + 20}
      size={80}
    />
  );
}