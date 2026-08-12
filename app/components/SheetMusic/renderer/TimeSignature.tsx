// renderer/TimeSignature.tsx

import React from "react";
import { Text } from "react-native";

export default function TimeSignature() {
  return (
    <>
      <Text
        style={{
          position: "absolute",
          left: 80,
          top: 40,
          fontSize: 18,
        }}
      >
        4
      </Text>

      <Text
        style={{
          position: "absolute",
          left: 80,
          top: 60,
          fontSize: 18,
        }}
      >
        4
      </Text>
    </>
  );
}