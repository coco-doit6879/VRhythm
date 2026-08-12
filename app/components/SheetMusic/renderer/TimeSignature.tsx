// renderer/TimeSignature.tsx

import React from "react";
import { Text } from "react-native";

export default function TimeSignature({ staffTop = 40 }: { staffTop?: number }) {
  return (
    <>
      <Text
        style={{
          position: "absolute",
          left: 80,
          top: staffTop,
          fontSize: 18,
        }}
      >
        4
      </Text>

      <Text
        style={{
          position: "absolute",
          left: 80,
          top: staffTop + 20,
          fontSize: 18,
        }}
      >
        4
      </Text>
    </>
  );
}