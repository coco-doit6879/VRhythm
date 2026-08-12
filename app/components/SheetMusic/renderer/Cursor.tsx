// renderer/Cursor.tsx

import React from "react";
import { View } from "react-native";

interface Props {
  x: number;
  height: number;
}

export default function Cursor({ x, height }: Props) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: 40,
        width: 2,
        height,
        backgroundColor: "red",
      }}
    />
  );
}