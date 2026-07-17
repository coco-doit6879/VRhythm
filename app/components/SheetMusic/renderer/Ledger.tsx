// renderer/Ledger.tsx

import React from "react";
import { View } from "react-native";
import { LayoutLedgerLine } from "../engine/models/Layout";

interface Props {
  lines: LayoutLedgerLine[];
}

export default function Ledger({ lines }: Props) {
  return (
    <>
      {lines.map((l, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: l.x1,
            top: l.y,
            width: l.x2 - l.x1,
            height: 3,
            backgroundColor: "#111",
          }}
        />
      ))}
    </>
  );
}