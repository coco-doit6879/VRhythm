import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  playing: boolean;

  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PlaybackControls({
  playing,
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
}: Props) {
  return (
    <View style={styles.container}>
      <ControlButton
        label="⏮"
        text="Prev"
        onPress={onPrev}
      />

      <ControlButton
        label={playing ? "⏸" : "▶"}
        text={playing ? "Pause" : "Play"}
        primary
        onPress={playing ? onPause : onPlay}
      />

      <ControlButton
        label="⏹"
        text="Stop"
        danger
        onPress={onStop}
      />

      <ControlButton
        label="⏭"
        text="Next"
        onPress={onNext}
      />
    </View>
  );
}

interface ButtonProps {
  label: string;
  text: string;
  onPress: () => void;
  primary?: boolean;
  danger?: boolean;
}

function ControlButton({
  label,
  text,
  onPress,
  primary,
  danger,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary && styles.primaryButton,
        danger && styles.dangerButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{label}</Text>

      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 12,
  },

  button: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 3,
  },

  primaryButton: {
    backgroundColor: "#2D7EF7",
  },

  dangerButton: {
    backgroundColor: "#E74C3C",
  },

  icon: {
    fontSize: 26,
    color: "#222",
  },

  text: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "#222",
  },
});