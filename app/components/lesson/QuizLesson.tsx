import React from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Colors";
import { LessonDto, QuizExamDto, QuizSubmitResponseDto } from "../../../services/api-types";

interface QuizLessonProps {
  lesson: LessonDto | null;
  quizLoading: boolean;
  quiz: QuizExamDto | null;
  questions: any[];
  questionIndex: number;
  selectedOptionId?: number;
  submittingQuiz: boolean;
  result: QuizSubmitResponseDto | null;
  onSelectOption: (questionId: number, optionId: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function QuizLesson({
  lesson,
  quizLoading,
  quiz,
  questions,
  questionIndex,
  selectedOptionId,
  submittingQuiz,
  result,
  onSelectOption,
  onPrevious,
  onNext,
  onSubmit,
  onReset,
}: QuizLessonProps) {
  if (quizLoading) {
    return (
      <View style={[styles.typeSpecificCard, styles.loadingCard]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải bài trắc nghiệm...</Text>
      </View>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <View style={[styles.typeSpecificCard, styles.loadingCard]}>
        <Text style={styles.emptyText}>Không có câu hỏi nào trong bài trắc nghiệm này.</Text>
      </View>
    );
  }

  if (result) {
    const isPassed = result.passed;
    return (
      <View style={styles.typeSpecificCard}>
        <Text style={styles.cardHeaderTitle}>KẾT QUẢ BÀI THI</Text>
        <View style={styles.resultContent}>
          <Text style={styles.resultIcon}>{isPassed ? "🏅" : "⚠️"}</Text>
          <Text style={[styles.resultTitle, { color: isPassed ? Colors.primary : Colors.danger }]}> 
            {isPassed ? "ĐÃ ĐẠT BÀI THI!" : "CHƯA ĐẠT YÊU CẦU"}
          </Text>
          <Text style={styles.resultMeta}>Số câu đúng: {result.correctAnswers} / {result.totalQuestions}</Text>
          <Text style={styles.resultMeta}>Tỷ lệ: {result.scorePercentage}% (Yêu cầu: {quiz.passPercentage}%)</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={onReset}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
            <Text style={styles.actionBtnText}>Làm lại</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  return (
    <View style={styles.typeSpecificCard}>
      <View style={styles.headerRow}>
        <Text style={styles.cardHeaderTitle}>BÀI TRẮC NGHIỆM</Text>
        <Text style={styles.stepText}>{questionIndex + 1} / {questions.length}</Text>
      </View>
      <Text style={styles.quizQuestionText}>{currentQuestion.prompt}</Text>
      <View style={styles.quizOptionsCol}>
        {currentQuestion.options?.map((opt: any, oIdx: number) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.quizOptionBtn, isSelected && styles.quizOptionSelected]}
              onPress={() => onSelectOption(currentQuestion.id, opt.id)}
            >
              <View style={styles.quizOptionNumber}>
                <Text style={[styles.quizOptionNumberText, isSelected && { color: "#FFF" }]}> 
                  {String.fromCharCode(65 + oIdx)}
                </Text>
              </View>
              <Text style={[styles.quizOptionText, isSelected && styles.quizOptionTextSelected]}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.buttonRow}>
        {questionIndex > 0 && (
          <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={onPrevious}>
            <View style={[styles.actionBtnGradient, { backgroundColor: "#F0F2F5" }]}> 
              <Text style={[styles.actionBtnText, { color: Colors.light.text }]}>Quay lại</Text>
            </View>
          </TouchableOpacity>
        )}
        {!isLastQuestion ? (
          <TouchableOpacity
            style={[styles.actionBtn, { flex: 2 }]}
            disabled={selectedOptionId === undefined}
            onPress={onNext}
          >
            <LinearGradient
              colors={selectedOptionId === undefined ? ["#A8C5B5", "#86A795"] : [Colors.primary, Colors.primaryDark]}
              style={styles.actionBtnGradient}
            >
              <Text style={styles.actionBtnText}>Câu tiếp theo</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { flex: 2 }]}
            disabled={selectedOptionId === undefined || submittingQuiz}
            onPress={onSubmit}
          >
            <LinearGradient colors={[Colors.warning, "#E76F51"]} style={styles.actionBtnGradient}>
              <Text style={styles.actionBtnText}>Nộp bài</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
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
  loadingCard: { alignItems: "center", padding: 30 },
  loadingText: { marginTop: 12, color: Colors.light.textMuted },
  emptyText: { color: Colors.light.textMuted, textAlign: "center" },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Colors.light.textMuted,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepText: { fontSize: 12, fontWeight: "700", color: Colors.primary },
  quizQuestionText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 18,
  },
  quizOptionsCol: { gap: 12, marginBottom: 18 },
  quizOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.bg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  quizOptionSelected: { borderColor: Colors.warning, backgroundColor: "#FFFBF0" },
  quizOptionText: { flex: 1, fontSize: 14, color: Colors.light.textSecondary, fontWeight: "500" },
  quizOptionTextSelected: { color: Colors.warning, fontWeight: "700" },
  quizOptionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quizOptionNumberText: { fontSize: 12, fontWeight: "700", color: Colors.light.textMuted },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: { borderRadius: 14, overflow: "hidden" },
  actionBtnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  resultContent: { alignItems: "center", marginVertical: 20 },
  resultIcon: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: "800", marginTop: 12 },
  resultMeta: { marginTop: 4, color: Colors.light.textSecondary },
});
