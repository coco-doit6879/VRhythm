import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import {
  api,
  LessonDto,
  QuizSubmitResponseDto,
  CourseDetailDto,
} from "../../services/api";
import { useVideoPlayer } from "expo-video";
import { VideoLesson } from "../components/lesson/VideoLesson";
import { PracticalLesson } from "../components/lesson/PracticalLesson";

const { width } = Dimensions.get("window");

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);
  
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Video states
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResponseDto | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [practicalMode, setPracticalMode] = useState<'normal' | 'exam' | null>(null);

  const player = useVideoPlayer(videoUrl ?? "", (player) => {
    player.loop = false;
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (player) {
          player.pause();
        }
      };
    }, [player])
  );

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    setLoading(true);
    try {
      const courseId = api.getCurrentCourseId();
      if (!courseId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin khóa học.");
        router.back();
        return;
      }

      // Fetch course to get the syllabus for "Next Lesson" navigation
      const courseRes = await api.getCourseDetail(courseId);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
      }

      const res = await api.getLessonDetail(lessonId);
      if (res.success && res.data) {
        setLessonDetail(res.data);
        if (res.data.type === "Video") {
          fetchVideoUrl(courseId, lessonId);
        } else {
          setVideoLoading(false);
        }
      } else {
        Alert.alert("Lỗi", "Không thể tải bài học.");
        router.back();
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Lỗi", "Không thể tải bài học.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoUrl = async (courseId: number, lId: number) => {
    setVideoLoading(true);
    try {
      const res = await api.getVideoUrl(courseId, lId);
      if (res.success && res.data) {
        setVideoUrl(res.data);
      } else {
        setVideoUrl("https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4");
      }
    } catch (e) {
      setVideoUrl("https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4");
    } finally {
      setVideoLoading(false);
    }
  };

  const totalSeconds = lessonDetail?.durationSeconds || 600;

  useEffect(() => {
    if (!player || !lessonDetail || !course) return;
    let lastReported = 0;
    const subscription = player.addListener("statusChange", ({ status, error }) => {
      if (status === "idle") {
        handleCompleteLesson();
      }
    });
    const interval = setInterval(() => {
      const current = Math.floor(player.currentTime);
      if (current !== lastReported && current % 5 === 0) {
        lastReported = current;
        setWatchedSeconds(current);
        api.updateVideoProgress(course.id, lessonDetail.id, current, totalSeconds).catch(console.error);
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [player, lessonDetail, course]);

  const handleCompleteLesson = async () => {
    if (!course || !lessonDetail) return;
    try {
      if (lessonDetail.type === 'Theory' || lessonDetail.type === 'Video') {
        await api.updateVideoProgress(course.id, lessonDetail.id, totalSeconds, totalSeconds);
      }
    } catch (e) {
      console.warn("Failed to mark complete remotely:", e);
    }
    // Update local state to show 'Next' button if necessary, or just rely on API refresh
    setLessonDetail(prev => prev ? { ...prev, isCompleted: true } : prev);
  };

  const navigateToNextLesson = () => {
    if (!course || !course.chapters) {
      router.back();
      return;
    }
    const allLessons = course.chapters.flatMap((chap) => chap.lessons || []);
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

    if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
      const nextLesson = allLessons[currentIndex + 1];
      router.replace(`/lesson/${nextLesson.id}`);
    } else {
      Alert.alert("Chúc mừng!", "Bạn đã hoàn thành bài học cuối cùng của khóa học này!");
      router.back();
    }
  };

  if (loading || !lessonDetail) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz variables
  const theory = lessonDetail.theory;
  const quiz = lessonDetail.quiz;
  const practical = lessonDetail.practical;
  const quizQuestions = quiz?.questions ?? [];
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? quizAnswers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

  const hasResult = quizResult !== null || (lessonDetail.type === 'Quiz' && lessonDetail.isCompleted);

  const renderMediaHeader = () => {
    if (lessonDetail.type === "Video") {
      return <VideoLesson videoLoading={videoLoading} videoUrl={videoUrl} player={player} />;
    }
    if (lessonDetail.type === "Theory") {
      return (
        <LinearGradient colors={["#1F3A2B", "#112218"]} style={styles.mediaHeader}>
          <Ionicons name="book-outline" size={48} color={Colors.accent} />
          <View style={styles.mediaHeaderMeta}>
            <Text style={styles.mediaHeaderTag}>BÀI HỌC LÝ THUYẾT</Text>
            <Text style={styles.mediaHeaderSubtitle}>Vui lòng đọc kỹ nội dung bài học bên dưới</Text>
          </View>
        </LinearGradient>
      );
    }
    if (lessonDetail.type === "Quiz") {
      return (
        <LinearGradient colors={["#2D5A27", "#173014"]} style={styles.mediaHeader}>
          <Ionicons name="help-circle-outline" size={48} color={Colors.warning} />
          <View style={styles.mediaHeaderMeta}>
            <Text style={styles.mediaHeaderTag}>BÀI TRẮC NGHIỆM</Text>
            <Text style={styles.mediaHeaderSubtitle}>Kiểm tra kiến thức đã học</Text>
          </View>
        </LinearGradient>
      );
    }
    if (["Practice", "Practise", "Practical"].includes(lessonDetail.type ?? "")) {
      return (
        <LinearGradient colors={["#3B275C", "#1D1330"]} style={styles.mediaHeader}>
          <Ionicons name="musical-notes-outline" size={48} color={Colors.info} />
          <View style={styles.mediaHeaderMeta}>
            <Text style={styles.mediaHeaderTag}>BÀI TẬP THỰC HÀNH</Text>
            <Text style={styles.mediaHeaderSubtitle}>Luyện tập kỹ thuật gảy & bấm đàn</Text>
          </View>
        </LinearGradient>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      {!practicalMode && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/learning')}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{lessonDetail.title}</Text>
            <Text style={styles.headerSubtitle}>Khóa học: {course?.title}</Text>
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} scrollEnabled={!practicalMode} showsVerticalScrollIndicator={false}>
        {!practicalMode && renderMediaHeader()}

        <View style={[styles.content, { flex: 1 }, practicalMode ? { padding: 0 } : {}]}>
          {lessonDetail.type === "Video" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>NỘI DUNG BÀI GIẢNG</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.light.text, marginBottom: 8 }}>
                {lessonDetail.title}
              </Text>
              <Text style={styles.bodyText}>
                {lessonDetail.content || "Hãy xem kỹ video bài giảng từ giáo viên để nắm bắt kỹ thuật và kiến thức một cách trực quan nhất. Đừng quên chuẩn bị sáo và thực hành lại ngay sau khi xem xong nhé!"}
              </Text>
              
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleCompleteLesson()}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>Tôi đã xem xong</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {lessonDetail.type === "Theory" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>NỘI DUNG LÝ THUYẾT</Text>
              <Text style={styles.bodyText}>
                {theory?.content || lessonDetail.content || "Đang cập nhật..."}
              </Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={async () => {
                  try {
                    await api.completeTheory(lessonDetail.id);
                  } catch (e) {}
                  handleCompleteLesson();
                }}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
                  <Text style={styles.actionBtnText}>Hoàn thành bài đọc</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {lessonDetail.type === "Quiz" && (
            <>
              {hasResult ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>KẾT QUẢ BÀI THI</Text>
                  <View style={{ alignItems: "center", marginVertical: 20 }}>
                    <Ionicons
                      name={quizResult?.passed || lessonDetail.isCompleted ? "ribbon-outline" : "alert-circle-outline"}
                      size={64}
                      color={quizResult?.passed || lessonDetail.isCompleted ? Colors.primary : Colors.danger}
                    />
                    <Text style={{
                      fontSize: 24,
                      fontWeight: "800",
                      marginTop: 12,
                      color: quizResult?.passed || lessonDetail.isCompleted ? Colors.primary : Colors.danger,
                    }}>
                      {quizResult?.passed || lessonDetail.isCompleted ? "ĐÃ ĐẠT BÀI THI!" : "CHƯA ĐẠT YÊU CẦU"}
                    </Text>
                    {quizResult && (
                      <Text style={{ marginTop: 8, color: Colors.light.textSecondary }}>
                        Số câu đúng: {quizResult.correctAnswers} / {quizResult.totalQuestions}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      setQuizResult(null);
                      setCurrentQuestionIndex(0);
                      setQuizAnswers({});
                    }}
                  >
                    <LinearGradient colors={["#86A795", "#A8C5B5"]} style={styles.actionBtnGradient}>
                      <Ionicons name="refresh-outline" size={20} color="#FFF" />
                      <Text style={styles.actionBtnText}> Làm lại</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={styles.cardTitle}>CÂU HỎI {currentQuestionIndex + 1}/{quizQuestions.length}</Text>
                  </View>
                  <Text style={styles.quizQuestionText}>{currentQuestion?.prompt}</Text>
                  <View style={styles.quizOptionsCol}>
                    {currentQuestion?.options?.map((opt, oIdx) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.quizOptionBtn, isSelected && styles.quizOptionSelected]}
                          onPress={() => setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.id }))}
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
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                    {currentQuestionIndex > 0 && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { flex: 1 }]}
                        onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                      >
                        <View style={[styles.actionBtnGradient, { backgroundColor: "#F0F2F5" }]}>
                          <Text style={[styles.actionBtnText, { color: Colors.light.text }]}>Quay lại</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {!isLastQuestion ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, { flex: 2 }]}
                        disabled={selectedOptionId === undefined}
                        onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
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
                        onPress={async () => {
                          setSubmittingQuiz(true);
                          try {
                            const payload = Object.entries(quizAnswers).map(([qId, oId]) => ({
                              questionId: Number(qId),
                              selectedOptionId: oId,
                            }));
                            const res = await api.submitQuiz(lessonDetail.id, payload);
                            if (res.success && res.data) {
                              setQuizResult(res.data);
                              if (res.data.passed) {
                                handleCompleteLesson();
                              }
                            } else {
                              // mock result
                              setQuizResult({ passed: true, correctAnswers: quizQuestions.length, totalQuestions: quizQuestions.length, scorePercentage: 100 });
                              handleCompleteLesson();
                            }
                          } finally {
                            setSubmittingQuiz(false);
                          }
                        }}
                      >
                        <LinearGradient colors={[Colors.warning, "#E76F51"]} style={styles.actionBtnGradient}>
                          <Text style={styles.actionBtnText}>Nộp bài</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {["Practice", "Practise", "Practical"].includes(lessonDetail.type ?? "") && practical && (
            <PracticalLesson 
              lesson={lessonDetail}
              practical={practical}
              onComplete={handleCompleteLesson}
              mode={practicalMode}
              setMode={setPracticalMode}
            />
          )}

        </View>
      </ScrollView>

      {/* Persistent Bottom Bar for Navigation */}
      {!practicalMode && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(tabs)/learning')}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.navBtnText}>Danh sách</Text>
          </TouchableOpacity>
          
          {lessonDetail.isCompleted && (
            <TouchableOpacity style={styles.nextBtn} onPress={navigateToNextLesson}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.nextBtnGradient}>
                <Text style={styles.nextBtnText}>Tiếp tục bài tiếp theo</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: Colors.light.textMuted },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border, backgroundColor: '#fff' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.light.text },
  headerSubtitle: { fontSize: 13, color: Colors.light.textMuted },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1.5, color: Colors.light.textMuted, marginBottom: 14 },
  bodyText: { fontSize: 15, color: Colors.light.textSecondary, lineHeight: 24 },
  mediaHeader: { padding: 24, alignItems: "center", justifyContent: "center", minHeight: 160 },
  mediaHeaderMeta: { alignItems: "center", marginTop: 12 },
  mediaHeaderTag: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  mediaHeaderSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  actionBtn: { borderRadius: 14, overflow: "hidden", marginTop: 16 },
  actionBtnGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 14 },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  quizQuestionText: { fontSize: 16, fontWeight: "600", color: Colors.light.text, lineHeight: 24, marginBottom: 20 },
  quizOptionsCol: { gap: 12 },
  quizOptionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.bgElevated, borderWidth: 2, borderColor: "transparent", borderRadius: 16, padding: 12 },
  quizOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  quizOptionNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EBF2FE", justifyContent: "center", alignItems: "center", marginRight: 12 },
  quizOptionNumberText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  quizOptionText: { flex: 1, fontSize: 15, color: Colors.light.textSecondary, lineHeight: 22 },
  quizOptionTextSelected: { color: Colors.primaryDark, fontWeight: "600" },
  bottomBar: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: Colors.light.border, backgroundColor: '#fff', alignItems: 'center' },
  navBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Colors.light.bgElevated, borderRadius: 12 },
  navBtnText: { marginLeft: 8, color: Colors.primary, fontWeight: '600' },
  nextBtn: { flex: 1, marginLeft: 16, borderRadius: 12, overflow: 'hidden' },
  nextBtnGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 }
});
