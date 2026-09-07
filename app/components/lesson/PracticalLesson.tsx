import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Colors";
import { LessonDto, PracticalDto } from "../../../services/api-types";
import PracticalExamEngine from "./PracticalExamEngine";

interface PracticalLessonProps {
  lesson: LessonDto | null;
  practical: PracticalDto | null;
  onComplete: () => void;
  mode: 'normal' | 'exam' | null;
  setMode: (mode: 'normal' | 'exam' | null) => void;
}

export function PracticalLesson({ lesson, practical, onComplete, mode, setMode }: PracticalLessonProps) {
  if (!practical) {
    return null;
  }

  if (mode) {
    return (
      <View style={[styles.engineContainer, { flex: 1 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
          <View style={styles.backButtonContainer}>
            <Text style={styles.backButtonText}>← Đổi chế độ tập luyện</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <PracticalExamEngine mode={mode} onComplete={onComplete} practical={practical} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.typeSpecificCard}>
      <Text style={styles.cardHeaderTitle}>BÀI LUYỆN ÂM: {lesson?.title?.toUpperCase()}</Text>
      
      <Text style={styles.practiceBodyText}>
        Bạn có 2 tùy chọn để thực hành. Hãy chọn 1 chế độ bên dưới:
      </Text>
      
      <TouchableOpacity style={[styles.actionBtn, { marginBottom: 16 }]} onPress={() => setMode('normal')}>
        <LinearGradient colors={['#A8C5B5', '#86A795']} style={styles.actionBtnGradient}>
          <Text style={styles.actionBtnText}>🎧 Nghe mẫu (Tự động chạy)</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setMode('exam')}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
          <Text style={styles.actionBtnText}>🎤 Bắt đầu thực hành thi</Text>
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
  engineContainer: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  backButtonContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  backButtonText: {
    color: '#4A5568',
    fontWeight: '700',
    fontSize: 15,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Colors.light.textMuted,
    marginBottom: 14,
  },
  practiceBodyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionBtn: { borderRadius: 14, overflow: "hidden" },
  actionBtnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
