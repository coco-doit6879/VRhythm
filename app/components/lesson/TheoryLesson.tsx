import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Colors";
import { LessonDto } from "../../../services/api-types";

interface TheoryLessonProps {
  lesson: LessonDto | null;
  content: string | null;
  onComplete: () => void;
}

export function TheoryLesson({ lesson, content, onComplete }: TheoryLessonProps) {
  return (
    <View style={styles.typeSpecificCard}>
      <Text style={styles.cardHeaderTitle}>NỘI DUNG LÝ THUYẾT</Text>
      <Text style={styles.theoryBodyText}>{content || "Đang cập nhật..."}</Text>
      <TouchableOpacity style={styles.actionBtn} onPress={onComplete}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.actionBtnGradient}
        >
          <Text style={styles.actionBtnText}>Hoàn thành bài đọc</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  typeSpecificCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Colors.light.textMuted,
    marginBottom: 14,
  },
  theoryBodyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  actionBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  actionBtnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
