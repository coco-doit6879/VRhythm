// renderer/Measure.tsx

import React from "react";
import { View } from "react-native";
import { LayoutMeasure } from "../engine/models/Layout";
import { STAFF } from "../engine/constants";

interface Props {
  measure: LayoutMeasure;
  staffTop?: number;
}

export default function Measure({ measure, staffTop = 40 }: Props) {
  return (
    <View>
      <View
        style={{
          position: "absolute",
          left: measure.startX,
          top: staffTop,
          width: 1,
          height: STAFF.HEIGHT,
          backgroundColor: "#999",
        }}
      />

      <View
        style={{
          position: "absolute",
          left: measure.endX,
          top: staffTop,
          width: 1,
          height: STAFF.HEIGHT,
          backgroundColor: "#999",
        }}
      />
    </View>
  );
}