import React from "react";
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ScreenHeader } from '../ui/ScreenHeader';
import PracticalMock from "./components/lesson/PracticalMock";

export default function PracticalMockRoute() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Luyện nghe" back />
      <ScrollView><PracticalMock /></ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
});
