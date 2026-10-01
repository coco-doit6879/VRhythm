// renderer/Cursor.tsx

import React from "react";
import { View } from "react-native";
import { STAFF } from "../engine/constants";
import { Colors } from '../../../../constants/Colors';

interface Props {
  x: number;
  height?: number; // legacy
  staffTop?: number;
}

export default function Cursor({ x, staffTop = 40 }: Props) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: staffTop - 10,
        width: 2,
        height: STAFF.HEIGHT + 20,
        backgroundColor: Colors.accent,
      }}
    />
  );
}
