import React from "react";
import { useFonts } from "expo-font";
import { Text } from "react-native";

export type NoteHeadType = "whole" | "half" | "black" | "treble";

const GLYPH_MAP: Record<NoteHeadType, string> = {
  whole: "\uE0A2",
  half: "\uE0A3",
  black: "\uE0A4",
  treble: "\uE050",
};

interface Props {
  glyph: NoteHeadType;
  x: number;
  y: number;
  size?: number;
  color?: string;
}

export default function MusicGlyph({
  glyph,
  x,
  y,
  size = 60,
  color = "#111",
}: Props) {
  const [fontsLoaded] = useFonts({
    Bravura: require("../../../../assets/fonts/Bravura.otf"),
  });

  return (
    <Text
      style={{
        position: "absolute",
        left: x - size / 2 + 22,
        top: y - size / 2 - 90,
        fontSize: size,
        color,
        fontFamily: fontsLoaded ? "Bravura" : undefined,
      }}
    >
      {GLYPH_MAP[glyph]}
    </Text>
  );
}