import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import {
  api,
  CourseDetailDto,
  LessonDto,
  QuizExamDto,
  QuizSubmitResponseDto,
} from "../../services/api";
import { VideoView, useVideoPlayer } from "expo-video";
const { width } = Dimensions.get("window");

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function LearningScreen() {
  const videoRef = useRef(null);

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<LessonDto | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const player = useVideoPlayer(videoUrl ?? "", (player) => {
    player.loop = false;
  });

  // Interactive states for Quiz/Theory
  const [lessonDetail, setLessonDetail] = useState<LessonDto | null>(null);
  // const [activeQuiz, setActiveQuiz] = useState<QuizExamDto | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestionIndices, setQuizQuestionIndices] = useState<
    Record<number, number>
  >({}); // maps lessonId to currentQuestionIndex
  const [quizAnswers, setQuizAnswers] = useState<
    Record<number, Record<number, number>>
  >({}); // maps lessonId to { questionId: selectedOptionId }
  const [quizResults, setQuizResults] = useState<
    Record<number, QuizSubmitResponseDto>
  >({}); // maps lessonId to QuizSubmitResponseDto
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const simulateLocalCompletion = (lessonId: number) => {
    if (!course) return;
    const updatedChapters =
      course.chapters?.map((chap) => ({
        ...chap,
        lessons:
          chap.lessons?.map((l) =>
            l.id === lessonId ? { ...l, isCompleted: true } : l,
          ) || null,
      })) || null;

    const updatedCourse = {
      ...course,
      chapters: updatedChapters,
    };
    setCourse(updatedCourse);

    if (activeLesson && activeLesson.id === lessonId) {
      const updatedActiveLesson = updatedChapters
        ?.flatMap((chap) => chap.lessons || [])
        .find((l) => l.id === lessonId);
      if (updatedActiveLesson) {
        setActiveLesson(updatedActiveLesson);
      }
    }
  };

  const navigateToNextLesson = (
    currentLessonId: number,
    freshCourse?: CourseDetailDto,
  ) => {
    const activeCourse = freshCourse || course;
    if (!activeCourse || !activeCourse.chapters) return;

    const allLessons = activeCourse.chapters.flatMap(
      (chap) => chap.lessons || [],
    );
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

    if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
      const nextLesson = allLessons[currentIndex + 1];

      // Auto expand next chapter if it is different
      const nextChapter = activeCourse.chapters.find((chap) =>
        chap.lessons?.some((l) => l.id === nextLesson.id),
      );
      if (nextChapter && !expanded.includes(nextChapter.id.toString())) {
        setExpanded((prev) => [...prev, nextChapter.id.toString()]);
      }

      handleSelectLesson(activeCourse.id, nextLesson);
    } else {
      Alert.alert(
        "Chúc mừng!",
        "Bạn đã hoàn thành bài học cuối cùng của khóa học này!",
      );
    }
  };

  const handleCompleteTextOrQuiz = async () => {
    if (!course || !activeLesson) return;
    const currentId = activeLesson.id;
    try {
      const res = await api.updateVideoProgress(
        course.id,
        activeLesson.id,
        totalSeconds,
        totalSeconds,
      );
      if (res && res.success) {
        const detailRes = await api.getCourseDetail(course.id);
        if (detailRes.success && detailRes.data) {
          setCourse(detailRes.data);
          const updatedLesson = detailRes.data.chapters
            ?.flatMap((chap) => chap.lessons || [])
            .find((l) => l.id === currentId);
          if (updatedLesson) {
            setActiveLesson(updatedLesson);
          }
          navigateToNextLesson(currentId, detailRes.data);
          return;
        }
      }
      simulateLocalCompletion(currentId);
      navigateToNextLesson(currentId);
    } catch (e) {
      console.warn(
        "Error completing lesson on server, simulating completion locally:",
        e,
      );
      simulateLocalCompletion(currentId);
      navigateToNextLesson(currentId);
    }
  };
  const fetchCourseData = async () => {
    setLoading(true);
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
            if (firstChapter.lessons && firstChapter.lessons.length > 0) {
              handleSelectLesson(courseId, firstChapter.lessons[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSelectLesson = async (courseId: number, lesson: LessonDto) => {
    setActiveLesson(lesson);
    setLessonDetail(null);

    setVideoUrl(null);
    setVideoLoading(lesson.type === "Video");
    setIsPlaying(false);
    setWatchedSeconds(0);
    setNote("");

    try {
      // 1. FETCH FULL LESSON DETAIL (NEW CORE)
      const res = await api.getLessonDetail(lesson.id);

      if (res.success && res.data) {
        setLessonDetail(res.data);
      } else {
        setLessonDetail(lesson); // fallback
      }
    } catch (e) {
      console.warn("Lesson detail load failed:", e);
      setLessonDetail(lesson);
    }

    // 2. VIDEO HANDLING (KEEP OLD BEHAVIOR)
    if (lesson.type === "Video") {
      try {
        const res = await api.getVideoUrl(courseId, lesson.id);
        if (res.success && res.data) {
          setVideoUrl(res.data);
        } else {
          setVideoUrl(
            "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
          );
        }
      } catch (e) {
        setVideoUrl("https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4");
      } finally {
        setVideoLoading(false);
      }
    } else {
      setVideoLoading(false);
    }
  };
  const totalSeconds = activeLesson?.durationSeconds || 600; // default 10 minutes
  useEffect(() => {
    if (!player || !activeLesson || !course) return;

    let lastReported = 0;

    const subscription = player.addListener(
      "statusChange",
      ({ status, error }) => {
        if (error) {
          console.warn("Video status error:", error);
          return;
        }

        if (status === "readyToPlay") {
          console.log("Video ready");
        }

        if (status === "idle") {
          console.log("Video finished");

          api
            .updateVideoProgress(
              course.id,
              activeLesson.id,
              totalSeconds,
              totalSeconds,
            )
            .then(() => {
              api.getCourseDetail(course.id).then((r) => {
                if (r.success && r.data) {
                  setCourse(r.data);
                  navigateToNextLesson(activeLesson.id, r.data);
                }
              });
            })
            .catch((err) => {
              console.warn(
                "Error updating final progress, simulating completion locally:",
                err,
              );
              simulateLocalCompletion(activeLesson.id);
              navigateToNextLesson(activeLesson.id);
            });
        }
      },
    );
    const interval = setInterval(() => {
      const current = Math.floor(player.currentTime);

      if (current !== lastReported && current % 5 === 0) {
        lastReported = current;

        setWatchedSeconds(current);

        api
          .updateVideoProgress(
            course.id,
            activeLesson.id,
            current,
            totalSeconds,
          )
          .catch(console.error);
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [player, activeLesson, course, totalSeconds]);
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
      const lessonId = activeLesson ? activeLesson.id : null;
      const res = await api.saveNote(course.id, lessonId, note.trim());
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: Colors.light.textMuted,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Bạn chưa chọn khóa học nào. Vui lòng chọn một khóa học từ Trang chủ.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>
              Quay lại Trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const theory = lessonDetail?.theory;
  const quiz = lessonDetail?.quiz;
  const practical = lessonDetail?.practical;
  const quizQuestions = quiz?.questions ?? [];

  // Calculate dynamic progress
  const totalLessons =
    course.chapters?.reduce(
      (acc, chap) => acc + (chap.lessons?.length || 0),
      0,
    ) || 0;
  const completedLessons =
    course.chapters?.reduce(
      (acc, chap) =>
        acc + (chap.lessons?.filter((l) => l.isCompleted).length || 0),
      0,
    ) || 0;
  const progressPercent =
    totalLessons > 0 ? completedLessons / totalLessons : 0;
  const videoProgressPercent =
    totalSeconds > 0 ? (watchedSeconds / totalSeconds) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.courseTitle} numberOfLines={1}>
              {course.title}
            </Text>
            <Text style={styles.courseInstructor}>
              Nhạc cụ: {course.instrument}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={Colors.light.text}
            />
          </TouchableOpacity>
        </View>
        {/* Dynamic Media / Lesson Interface */}
        {activeLesson?.type === "Video" ? (
          <View style={styles.videoContainer}>
            {videoLoading ? (
              <LinearGradient
                colors={["#1A3020", "#0D1F17", "#1A2E22"]}
                style={styles.videoPlayer}
              >
                <ActivityIndicator size="large" color="#FFF" />
              </LinearGradient>
            ) : videoUrl ? (
              <VideoView
                player={player}
                style={{ width: "100%", height: 220 }}
                nativeControls
                contentFit="contain"
                allowsFullscreen
                allowsPictureInPicture
              />
            ) : (
              <LinearGradient
                colors={["#1A3020", "#0D1F17", "#1A2E22"]}
                style={styles.videoPlayer}
              >
                <View style={styles.videoOverlay}>
                  <Text style={{ fontSize: 80 }}>🎵</Text>
                </View>
              </LinearGradient>
            )}
          </View>
        ) : activeLesson?.type === "Theory" ? (
          <View style={styles.mediaContainer}>
            <LinearGradient
              colors={["#1F3A2B", "#112218"]}
              style={styles.mediaHeader}
            >
              <Ionicons name="book-outline" size={48} color={Colors.accent} />
              <View style={styles.mediaHeaderMeta}>
                <Text style={styles.mediaHeaderTag}>BÀI HỌC LÝ THUYẾT</Text>
                <Text style={styles.mediaHeaderSubtitle}>
                  Vui lòng đọc kỹ nội dung bài học bên dưới
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : activeLesson?.type === "Quiz" ? (
          <View style={styles.mediaContainer}>
            <LinearGradient
              colors={["#2D5A27", "#173014"]}
              style={styles.mediaHeader}
            >
              <Ionicons
                name="help-circle-outline"
                size={48}
                color={Colors.warning}
              />
              <View style={styles.mediaHeaderMeta}>
                <Text style={styles.mediaHeaderTag}>BÀI TRẮC NGHIỆM</Text>
                <Text style={styles.mediaHeaderSubtitle}>
                  Kiểm tra kiến thức đã học
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : ["Practice", "Practise", "Practical"].includes(
            activeLesson?.type ?? "",
          ) ? (
          <View style={styles.mediaContainer}>
            <LinearGradient
              colors={["#3B275C", "#1D1330"]}
              style={styles.mediaHeader}
            >
              <Ionicons
                name="musical-notes-outline"
                size={48}
                color={Colors.info}
              />
              <View style={styles.mediaHeaderMeta}>
                <Text style={styles.mediaHeaderTag}>BÀI TẬP THỰC HÀNH</Text>
                <Text style={styles.mediaHeaderSubtitle}>
                  Luyện tập kỹ thuật gảy & bấm đàn
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : null}
        <View style={styles.content}>
          {/* Lesson Info */}
          <Text style={styles.lessonTitle}>
            {activeLesson ? activeLesson.title : "Chọn bài học bên dưới"}
          </Text>
          <View style={styles.lessonMeta}>
            <View style={styles.levelBadge}>
              <Ionicons
                name="bar-chart-outline"
                size={12}
                color={Colors.primary}
              />
              <Text style={styles.levelText}>
                {course.accessType === "Free" || course.accessType === "0"
                  ? "MIỄN PHÍ"
                  : "CAO CẤP"}
              </Text>
            </View>
            <Text style={styles.metaSep}>Lộ trình học chuẩn</Text>
            <Ionicons name="star" size={14} color="#F4A261" />
            <Text style={styles.rating}>5.0</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ học tập</Text>
              <Text style={styles.progressPercent}>
                {Math.round(progressPercent * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${progressPercent * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>
              Hoàn thành {completedLessons}/{totalLessons} bài học trong lộ
              trình này
            </Text>
          </View>

          {/* Dynamic Content Body based on Lesson Type */}
          {activeLesson?.type === "Theory" && (
            <View style={styles.typeSpecificCard}>
              <Text style={styles.cardHeaderTitle}>NỘI DUNG LÝ THUYẾT</Text>

              <Text style={styles.theoryBodyText}>
                {theory?.content || lessonDetail?.content || "Đang cập nhật..."}
              </Text>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={async () => {
                  try {
                    await api.completeTheory(activeLesson.id);
                    handleCompleteTextOrQuiz();
                  } catch (e) {
                    handleCompleteTextOrQuiz();
                  }
                }}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.actionBtnGradient}
                >
                  <Text style={styles.actionBtnText}>Hoàn thành bài đọc</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
{activeLesson?.type === "Quiz" &&
  (() => {
    if (quizLoading) {
      return (
        <View style={[styles.typeSpecificCard, { alignItems: "center", padding: 30 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 12, color: Colors.light.textMuted }}>
            Đang tải bài trắc nghiệm...
          </Text>
        </View>
      );
    }

    const quiz = lessonDetail?.quiz;
    const questions = quiz?.questions ?? [];

    if (!quiz || questions.length === 0) {
      return (
        <View style={[styles.typeSpecificCard, { alignItems: "center", padding: 20 }]}>
          <Text style={{ color: Colors.light.textMuted, textAlign: "center" }}>
            Không có câu hỏi nào trong bài trắc nghiệm này.
          </Text>
        </View>
      );
    }

    const lessonId = activeLesson.id;

    const currentQuestionIndex = quizQuestionIndices[lessonId] || 0;
    const currentQuestion = questions[currentQuestionIndex];

    const currentAnswers = quizAnswers[lessonId] || {};

    // ✅ FIX: dùng option.id
    const selectedOptionId = currentAnswers[currentQuestion.id];

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const result =
      quizResults[lessonId] ||
      (activeLesson.isCompleted
        ? {
            correctAnswers: questions.length,
            totalQuestions: questions.length,
            scorePercentage: 100,
            passed: true,
          }
        : null);

    const hasResult = result !== null;

    // =========================
    // RESULT SCREEN
    // =========================
    if (hasResult) {
      const isPassed = result.passed;

      return (
        <View style={styles.typeSpecificCard}>
          <Text style={styles.cardHeaderTitle}>KẾT QUẢ BÀI THI</Text>

          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <Ionicons
              name={isPassed ? "ribbon-outline" : "alert-circle-outline"}
              size={64}
              color={isPassed ? Colors.primary : Colors.danger}
            />

            <Text style={{
              fontSize: 24,
              fontWeight: "800",
              marginTop: 12,
              color: isPassed ? Colors.primary : Colors.danger,
            }}>
              {isPassed ? "ĐÃ ĐẠT BÀI THI!" : "CHƯA ĐẠT YÊU CẦU"}
            </Text>

            <Text style={{ marginTop: 8, color: Colors.light.textSecondary }}>
              Số câu đúng: {result.correctAnswers} / {result.totalQuestions}
            </Text>

            <Text style={{ marginTop: 4, color: Colors.light.textSecondary }}>
              Tỷ lệ: {result.scorePercentage}% (Yêu cầu: {quiz.passPercentage}%)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setQuizResults(prev => {
                const next = { ...prev };
                delete next[lessonId];
                return next;
              });

              setQuizQuestionIndices(prev => ({
                ...prev,
                [lessonId]: 0,
              }));

              setQuizAnswers(prev => {
                const next = { ...prev };
                delete next[lessonId];
                return next;
              });
            }}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="refresh-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>Làm lại</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // =========================
    // QUIZ UI
    // =========================
    return (
      <View style={styles.typeSpecificCard}>
        {/* header */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <Text style={styles.cardHeaderTitle}>BÀI TRẮC NGHIỆM</Text>

          <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primary }}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* question */}
        <Text style={styles.quizQuestionText}>
          {currentQuestion.prompt}
        </Text>

        {/* options */}
        <View style={styles.quizOptionsCol}>
          {currentQuestion.options?.map((opt, oIdx) => {
            const isSelected = selectedOptionId === opt.id;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.quizOptionBtn,
                  isSelected && styles.quizOptionSelected,
                ]}
                onPress={() => {
                  setQuizAnswers(prev => ({
                    ...prev,
                    [lessonId]: {
                      ...(prev[lessonId] || {}),
                      [currentQuestion.id]: opt.id, 
                    },
                  }));
                }}
              >
                <View style={styles.quizOptionNumber}>
                  <Text style={[
                    styles.quizOptionNumberText,
                    isSelected && { color: "#FFF" },
                  ]}>
                    {String.fromCharCode(65 + oIdx)}
                  </Text>
                </View>

                <Text style={[
                  styles.quizOptionText,
                  isSelected && styles.quizOptionTextSelected,
                ]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          {/* back */}
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1 }]}
              onPress={() =>
                setQuizQuestionIndices(prev => ({
                  ...prev,
                  [lessonId]: Math.max(0, (prev[lessonId] || 0) - 1),
                }))
              }
            >
              <View style={[styles.actionBtnGradient, { backgroundColor: "#F0F2F5" }]}>
                <Text style={[styles.actionBtnText, { color: Colors.light.text }]}>
                  Quay lại
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* next / submit */}
          {!isLastQuestion ? (
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 2 }]}
              disabled={selectedOptionId === undefined}
              onPress={() =>
                setQuizQuestionIndices(prev => ({
                  ...prev,
                  [lessonId]: (prev[lessonId] || 0) + 1,
                }))
              }
            >
              <LinearGradient
                colors={
                  selectedOptionId === undefined
                    ? ["#A8C5B5", "#86A795"]
                    : [Colors.primary, Colors.primaryDark]
                }
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
                  const currentAnswers = quizAnswers[lessonId] || {};

                  const payload = Object.entries(currentAnswers).map(
                    ([questionId, selectedOptionId]) => ({
                      questionId: Number(questionId),
                      selectedOptionId: selectedOptionId as number,
                    })
                  );

                  const res = await api.submitQuiz(activeLesson.id, payload);

                  if (res.success && res.data) {
                    setQuizResults(prev => ({
                      ...prev,
                      [lessonId]: res.data,
                    }));
                  } else {
                    let correct = 0;

                    questions.forEach(q => {
                      const selected = quizAnswers[lessonId]?.[q.id];
                      const correctOption = q.options.find(o => o.isCorrect);

                      if (selected === correctOption?.id) {
                        correct++;
                      }
                    });

                    const score = Math.round((correct / questions.length) * 100);

                    setQuizResults(prev => ({
                      ...prev,
                      [lessonId]: {
                        correctAnswers: correct,
                        totalQuestions: questions.length,
                        scorePercentage: score,
                        passed: score >= (quiz.passPercentage ?? 0),
                      },
                    }));
                  }
                } finally {
                  setSubmittingQuiz(false);
                }
              }}
            >
              <LinearGradient
                colors={[Colors.warning, "#E76F51"]}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>Nộp bài</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  })()}
  {/* Practice Component */}
{practical && (
  <View style={styles.typeSpecificCard}>
    <Text style={styles.cardHeaderTitle}>BÀI LUYỆN ÂM</Text>

    <Text style={styles.practiceBodyText}>
      Luyện theo thứ tự các nốt sau:
    </Text>

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {practical.notes?.map((n, idx) => (
        <View
          key={idx}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: Colors.light.bgElevated,
            borderWidth: 1,
            borderColor: Colors.light.border
          }}
        >
          <Text style={{ fontWeight: '700' }}>
            {n.note}
          </Text>
        </View>
      ))}
    </View>

    {/* ONLY completion button */}
    <TouchableOpacity
      style={[styles.actionBtn, { marginTop: 16 }]}
      onPress={handleCompleteTextOrQuiz}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.actionBtnGradient}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.actionBtnText}>
          Hoàn thành luyện tập
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
)}
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
                    <View
                      style={[
                        styles.chapterIcon,
                        { backgroundColor: "#EBF6F0" },
                      ]}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.chapterTitle}>
                      Chương {index + 1}: {chapter.title}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={Colors.light.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded &&
                    chapter.lessons &&
                    chapter.lessons.map((lesson) => {
                      const isCurrent = activeLesson?.id === lesson.id;
                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          style={[
                            styles.lessonRow,
                            isCurrent && styles.lessonRowActive,
                          ]}
                          onPress={() => handleSelectLesson(course.id, lesson)}
                        >
                          {lesson.isCompleted ? (
                            <View style={styles.doneBadge}>
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#FFF"
                              />
                            </View>
                          ) : isCurrent ? (
                            <View style={styles.currentBadge}>
                              <Ionicons name="play" size={12} color="#FFF" />
                            </View>
                          ) : (
                            <View style={styles.pendingBadge}>
                              <Text style={styles.pendingDot}>•</Text>
                            </View>
                          )}
                          <Text
                            style={[
                              styles.lessonRowTitle,
                              isCurrent && {
                                color: Colors.primary,
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {lesson.title}
                          </Text>
                          {isCurrent ? (
                            <Text style={styles.currentLabel}>ĐANG HỌC</Text>
                          ) : (
                            <Text style={styles.lessonDuration}>
                              {lesson.durationSeconds
                                ? formatTime(lesson.durationSeconds)
                                : "10:00"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </View>
              );
            })}

          {/* My Notes */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Ghi chú học tập</Text>
              {activeLesson && (
                <Text style={{ fontSize: 12, color: Colors.light.textMuted }}>
                  Bài học: {activeLesson.title}
                </Text>
              )}
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
            <TouchableOpacity
              style={styles.saveNotesBtn}
              activeOpacity={0.85}
              onPress={handleSaveNote}
            >
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveNotesBtnGradient}
              >
                <Ionicons
                  name="save-outline"
                  size={16}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveNotesBtnText}>
                  Lưu ghi chú lên máy chủ
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        {/* FABs */}
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="flash" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabBot]}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  courseTitle: { fontSize: 15, fontWeight: "700", color: Colors.light.text },
  courseInstructor: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  moreBtn: { padding: 8 },

  videoContainer: { marginBottom: 0 },
  videoPlayer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoOverlay: { position: "absolute", opacity: 0.2 },
  videoPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  videoControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  videoProgress: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  videoProgressFill: {
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  videoProgressThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    marginLeft: -5,
  },
  videoControlsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  videoTime: { fontSize: 12, color: "#FFF", marginLeft: 4 },

  content: { padding: 20 },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 10,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: { fontSize: 11, fontWeight: "700", color: Colors.primary },
  metaSep: { color: Colors.light.textMuted, fontSize: 13 },
  rating: { fontSize: 13, fontWeight: "600", color: Colors.light.text },

  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
  progressPercent: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 12, color: Colors.light.textMuted },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.textMuted,
    marginBottom: 14,
  },

  chapterCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  chapterIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.bgElevated,
  },
  lessonRowActive: { backgroundColor: Colors.light.bgElevated },
  doneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  currentBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingDot: { color: Colors.light.textMuted, fontSize: 18 },
  lessonRowTitle: { flex: 1, fontSize: 13, color: Colors.light.textSecondary },
  lessonDuration: { fontSize: 12, color: Colors.light.textMuted },
  currentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  notesCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  notesTitle: { fontSize: 15, fontWeight: "700", color: Colors.light.text },
  notesEdit: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  notesBox: {
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  notesText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  notesInput: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveNotesBtn: { borderRadius: 12, overflow: "hidden" },
  saveNotesBtnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveNotesBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 140,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabBot: {
    bottom: 80,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },

  // Interactive Styles
  mediaContainer: {
    height: 180,
    overflow: "hidden",
  },
  mediaHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  mediaHeaderMeta: {
    flex: 1,
  },
  mediaHeaderTag: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mediaHeaderSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
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
  actionBtnDisabled: {
    opacity: 0.7,
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
  quizQuestionText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 18,
  },
  quizOptionsCol: {
    gap: 12,
    marginBottom: 18,
  },
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
  quizOptionSelected: {
    borderColor: Colors.warning,
    backgroundColor: "#FFFBF0",
  },
  quizOptionCorrect: {
    borderColor: Colors.success,
    backgroundColor: "#EBF6F0",
  },
  quizOptionWrong: {
    borderColor: Colors.danger,
    backgroundColor: "#FEE2E2",
  },
  quizOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  quizOptionTextSelected: {
    color: Colors.warning,
    fontWeight: "700",
  },
  quizOptionTextCorrect: {
    color: Colors.success,
    fontWeight: "700",
  },
  quizOptionTextWrong: {
    color: Colors.danger,
    fontWeight: "700",
  },
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
  quizOptionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.textMuted,
  },
  feedbackBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  feedbackBoxCorrect: {
    backgroundColor: "#EBF6F0",
    borderColor: Colors.success + "40",
  },
  feedbackBoxWrong: {
    backgroundColor: "#FEE2E2",
    borderColor: Colors.danger + "40",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackExplanation: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  practiceBodyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
});
