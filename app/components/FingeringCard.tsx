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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.note}>{note ?? "—"}</Text>

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
        <Text style={styles.label}>Thổi</Text>

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