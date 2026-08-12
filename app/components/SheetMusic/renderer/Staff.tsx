// renderer/Staff.tsx

import React from "react";
import { View } from "react-native";
import { STAFF } from "../engine/constants";

export default function Staff({ width = 3000, staffTop = STAFF.TOP }: { width?: number, staffTop?: number }) {
  const lines = Array.from({ length: STAFF.LINE_COUNT }, (_, i) => i);

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
      {lines.map((i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: STAFF.LEFT,
            top: staffTop + i * STAFF.LINE_SPACING,
            width: width,
            height: 1,
            backgroundColor: "#000",
          }}
        />
      ))}
    </View>
  );
}