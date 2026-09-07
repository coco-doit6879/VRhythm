import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  note?: string;
  fingering?: number[] | null;
  title?: string;
}

export default function FingeringCard({
  note,
  fingering,
  title = "Fingering",
}: Props) {
  const safeFingering = Array.isArray(fingering) ? fingering : [];
  
  const NOTE_NAMES: Record<string, string> = {
    "C4": "Đô (C4)", "D4": "Rê (D4)", "E4": "Mi (E4)", "F4": "Pha (F4)", "G4": "Son (G4)", "A4": "La (A4)", "B4": "Si (B4)",
    "C5": "Đô (C5)", "D5": "Rê (D5)", "E5": "Mi (E5)", "F5": "Pha (F5)", "G5": "Son (G5)", "A5": "La (A5)", "B5": "Si (B5)",
    "C6": "Đô (C6)", "D6": "Rê (D6)", "E6": "Mi (E6)", "F6": "Pha (F6)", "G6": "Son (G6)", "A6": "La (A6)", "B6": "Si (B6)",
    "C7": "Đô (C7)"
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.note}>{note ? (NOTE_NAMES[note] || note) : "—"}</Text>

      <View style={styles.instrument}>
        {/* Blow hole */}
        <View style={styles.blowHole} />

        {/* 6 holes */}
        {safeFingering.map((closed, index) => (
          <View
            key={index}
            style={[
              styles.hole,
              closed ? styles.closedHole : styles.openHole,
            ]}
          />
        ))}
      </View>

      <View style={styles.labels}>
        <View style={{ width: HOLE_SIZE }} />

        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Text key={n} style={styles.number}>
            {n}
          </Text>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.closedHole]} />
          <Text style={styles.legendText}>Đóng</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.openHole]} />
          <Text style={styles.legendText}>Mở</Text>
        </View>
      </View>
    </View>
  );
}

const HOLE_SIZE = 32;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 5,
    marginTop: 15,
    elevation: 5,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  note: {
    marginTop: 2,
    marginBottom: 4,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D7EF7",
  },

  instrument: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  blowHole: {
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    backgroundColor: "#E9D39C",
    borderWidth: 2,
    borderColor: "#C59D2D",
  },

  hole: {
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    borderWidth: 2,
  },

  closedHole: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  openHole: {
    backgroundColor: "#FFF",
    borderColor: "#777",
  },

  labels: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 6,
    alignItems: "center",
  },

  label: {
    width: HOLE_SIZE,
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
  },

  number: {
    width: HOLE_SIZE,
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },

  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },

  legendText: {
    color: "#666",
  },
});