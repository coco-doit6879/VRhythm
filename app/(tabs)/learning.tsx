import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import { api, CourseDetailDto, LessonDto } from "../../services/api";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function LearningScreen() {
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const fetchCourseData = async () => {
    if (!course) setLoading(true);
    try {
      let courseId = api.getCurrentCourseId();

      // Fallback: If no current course is selected, fetch the list and pick the first one
      if (!courseId) {
        const listRes = await api.getCourses();
        if (listRes.success && listRes.data && listRes.data.length > 0) {
          courseId = listRes.data[0].id;
          api.setCurrentCourseId(courseId);
        }
      }

      if (courseId) {
        const detailRes = await api.getCourseDetail(courseId);
        if (detailRes.success && detailRes.data) {
          const data = detailRes.data;
          setCourse(data);

          if (data.chapters && data.chapters.length > 0) {
            const firstChapter = data.chapters[0];
            setExpanded([firstChapter.id.toString()]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCourseData();
    }, [])
  );

  const handleSelectLesson = (lesson: LessonDto) => {
    router.push(`/lesson/${lesson.id}` as any);
  };

  const toggleChapter = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSaveNote = async () => {
    if (!course) return;
    if (!note.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung ghi chú.");
      return;
    }
    try {
      const res = await api.saveNote(course.id, null, note.trim());
      if (res.success) {
        Alert.alert("Thành công", "Ghi chú của bạn đã được lưu trên máy chủ!");
      } else {
        Alert.alert("Thất bại", res.message || "Không thể lưu ghi chú.");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi kết nối.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 12, color: Colors.light.textMuted }}>
            Đang tải lộ trình học tập...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: Colors.light.textMuted, textAlign: "center", marginBottom: 20 }}>
            Bạn chưa chọn khóa học nào. Vui lòng chọn một khóa học từ Trang chủ.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Quay lại Trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate dynamic progress
  const totalLessons = course.chapters?.reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0) || 0;
  const completedLessons = course.chapters?.reduce((acc, chap) => acc + (chap.lessons?.filter((l) => l.isCompleted).length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? completedLessons / totalLessons : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
            <Text style={styles.courseInstructor}>Nhạc cụ: {course.instrument}</Text>
          </View>
          <TouchableOpacity style={styles.moreBtn} onPress={fetchCourseData}>
            <Ionicons name="refresh" size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ học tập</Text>
              <Text style={styles.progressPercent}>{Math.round(progressPercent * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
              />
            </View>
            <Text style={styles.progressSub}>Hoàn thành {completedLessons}/{totalLessons} bài học trong lộ trình này</Text>
          </View>

          {/* Course Chapters */}
          <Text style={styles.sectionTitle}>LỘ TRÌNH HỌC</Text>
          {course.chapters &&
            course.chapters.map((chapter, index) => {
              const isExpanded = expanded.includes(chapter.id.toString());
              return (
                <View key={chapter.id} style={styles.chapterCard}>
                  <TouchableOpacity
                    style={styles.chapterHeader}
                    onPress={() => toggleChapter(chapter.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.chapterIcon, { backgroundColor: "#EBF6F0" }]}>
                      <Ionicons name="layers-outline" size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.chapterTitle}>Chương {index + 1}: {chapter.title}</Text>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.light.textMuted} />
                  </TouchableOpacity>

                  {isExpanded &&
                    chapter.lessons &&
                    chapter.lessons.map((lesson) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonRow}
                        onPress={() => handleSelectLesson(lesson)}
                      >
                        {lesson.isCompleted ? (
                          <View style={styles.doneBadge}>
                            <Ionicons name="checkmark" size={14} color="#FFF" />
                          </View>
                        ) : (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingDot}>•</Text>
                          </View>
                        )}
                        <Text style={styles.lessonRowTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonDuration}>
                          {lesson.durationSeconds ? formatTime(lesson.durationSeconds) : "Bài học"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              );
            })}

          {/* My Notes */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Ghi chú chung khóa học</Text>
            </View>
            <View style={styles.notesBox}>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Nhập ghi chú học tập của bạn tại đây để lưu lại..."
                value={note}
                onChangeText={setNote}
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>
            <TouchableOpacity style={styles.saveNotesBtn} activeOpacity={0.85} onPress={handleSaveNote}>
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveNotesBtnGradient}
              >
                <Ionicons name="save-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveNotesBtnText}>Lưu ghi chú lên máy chủ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.light.bgElevated, justifyContent: "center", alignItems: "center" },
  courseTitle: { fontSize: 17, fontWeight: "700", color: Colors.light.text },
  courseInstructor: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  moreBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.light.bgElevated, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  progressCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressLabel: { fontSize: 14, fontWeight: "700", color: Colors.light.text },
  progressPercent: { fontSize: 14, fontWeight: "800", color: Colors.primary },
  progressBar: { height: 8, backgroundColor: Colors.light.bgElevated, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSub: { fontSize: 12, color: Colors.light.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.light.text, marginBottom: 16, letterSpacing: 0.5 },
  chapterCard: { backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  chapterHeader: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#FFF" },
  chapterIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  chapterTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: Colors.light.text },
  lessonRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.light.border },
  doneBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", marginRight: 12 },
  pendingBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.light.bgElevated, justifyContent: "center", alignItems: "center", marginRight: 12 },
  pendingDot: { color: Colors.light.textMuted, fontSize: 12, fontWeight: "900" },
  lessonRowTitle: { flex: 1, fontSize: 14, color: Colors.light.textSecondary },
  lessonDuration: { fontSize: 12, color: Colors.light.textMuted, fontWeight: "600" },
  notesCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  notesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  notesTitle: { fontSize: 16, fontWeight: "700", color: Colors.light.text },
  notesBox: { backgroundColor: Colors.light.bgElevated, borderRadius: 12, padding: 14, minHeight: 120, marginBottom: 16 },
  notesInput: { flex: 1, fontSize: 14, color: Colors.light.text, textAlignVertical: "top" },
  saveNotesBtn: { borderRadius: 12, overflow: "hidden" },
  saveNotesBtnGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 14 },
  saveNotesBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
