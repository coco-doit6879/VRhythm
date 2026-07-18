// renderer/Measure.tsx

import React from "react";
import { View } from "react-native";
import { LayoutMeasure } from "../engine/models/Layout";

interface Props {
  measure: LayoutMeasure;
}

export default function Measure({ measure }: Props) {
  return (
    <View>
      <View
        style={{
          position: "absolute",
          left: measure.startX,
          top: 40,
          width: 1,
          height: 120,
          backgroundColor: "#999",
        }}
      />

      <View
        style={{
          position: "absolute",
          left: measure.endX,
          top: 40,
          width: 1,
          height: 120,
          backgroundColor: "#999",
        }}
      />
    </View>
  );
}