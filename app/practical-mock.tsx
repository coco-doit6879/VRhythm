import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import PracticalMock from "./components/lesson/PracticalMock";

export default function PracticalMockRoute() {
  return (
    <SafeAreaView style={styles.safe}>
      <PracticalMock />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FAFC" },
});
