import { Text } from '../../ui/Typography';
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "../../constants/Theme";
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
  const navigation = useNavigation();

  useEffect(() => {
    // The hook releases the player when its source changes or this screen unmounts.
    // Only pause on navigation blur while this instance is still active.
    return navigation.addListener('blur', () => {
      if (videoUrl && lessonDetail?.type === 'Video') player.pause();
    });
  }, [navigation, player, videoUrl, lessonDetail?.type]);

  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [retakingQuiz, setRetakingQuiz] = useState(false);
  const [practiceMessage, setPracticeMessage] = useState('');
  const generation = useRef(0);
  const actionLock = useRef(false);
  const videoRequest = useRef(0);

  const message = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
  const requireSuccess = <T,>(response: { success: boolean; data: T; message: string | null }): T => {
    if (!response.success) throw new Error(response.message || 'Chưa lưu được kết quả. Vui lòng thử lại.');
    return response.data;
  };

  useEffect(() => {
    void fetchLessonData();
    return () => { generation.current++; videoRequest.current++; };
  }, [lessonId]);

  const fetchLessonData = async () => {
    const run = ++generation.current;
    videoRequest.current++;
    actionLock.current = false;
    setLoading(true); setLoadError(''); setActionError(''); setVideoError('');
    setLessonDetail(null); setCourse(null); setVideoUrl(null); setVideoLoading(false);
    setCurrentQuestionIndex(0); setQuizAnswers({}); setQuizResult(null); setRetakingQuiz(false);
    setPracticalMode(null); setCompleting(false); setSubmittingQuiz(false); setPracticeMessage('');
    try {
      const courseId = api.getCurrentCourseId();
      if (!Number.isSafeInteger(lessonId) || lessonId <= 0) throw new Error('Đường dẫn bài học không hợp lệ. Hãy quay lại lộ trình.');
      if (!courseId) throw new Error('Chưa chọn khóa học. Hãy quay lại lộ trình để chọn khóa học.');
      const [courseRes, lessonRes] = await Promise.all([api.getCourseDetail(courseId), api.getLessonDetail(lessonId)]);
      const nextCourse = requireSuccess(courseRes);
      const nextLesson = requireSuccess(lessonRes);
      if (!nextCourse || !nextLesson) throw new Error('Không tìm thấy bài học. Hãy quay lại lộ trình.');
      if (generation.current !== run) return;
      setCourse(nextCourse); setLessonDetail(nextLesson);
      if (nextLesson.type === 'Video') void fetchVideoUrl(courseId, lessonId);
    } catch (error) {
      if (generation.current === run) setLoadError(message(error, 'Không tải được bài học. Kiểm tra kết nối rồi thử lại.'));
    } finally {
      if (generation.current === run) setLoading(false);
    }
  };

  const fetchVideoUrl = async (courseId: number, lId: number) => {
    const run = generation.current;
    const requestId = ++videoRequest.current;
    setVideoLoading(true); setVideoError(''); setVideoUrl(null);
    try {
      const url = requireSuccess(await api.getVideoUrl(courseId, lId));
      if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) throw new Error('Video chưa sẵn sàng. Vui lòng tải lại sau.');
      if (generation.current === run && videoRequest.current === requestId) setVideoUrl(url);
    } catch (error) {
      if (generation.current === run && videoRequest.current === requestId) setVideoError(message(error, 'Không tải được video. Kiểm tra kết nối rồi thử lại.'));
    } finally {
      if (generation.current === run && videoRequest.current === requestId) setVideoLoading(false);
    }
  };

  const videoDuration = () => {
    const duration = player.duration || lessonDetail?.video?.durationSeconds || lessonDetail?.durationSeconds || 0;
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
  };

  const handleCompleteLesson = async () => {
    if (!course || !lessonDetail || actionLock.current || lessonDetail.isCompleted) return;
    if (!['Theory', 'Video'].includes(lessonDetail.type || '')) return;
    const run = generation.current;
    actionLock.current = true; setCompleting(true); setActionError('');
    try {
      if (lessonDetail.type === 'Theory') {
        requireSuccess(await api.completeTheory(lessonDetail.id));
      } else {
        const total = videoDuration();
        if (!videoUrl || videoError || !total || player.currentTime / total < 0.9) {
          throw new Error('Hãy xem ít nhất 90% video trước khi xác nhận hoàn thành.');
        }
        requireSuccess(await api.updateVideoProgress(course.id, lessonDetail.id, player.currentTime, total));
      }
      const confirmed = requireSuccess(await api.getLessonDetail(lessonDetail.id));
      if (!confirmed) throw new Error('Chưa tải được tiến độ mới. Vui lòng thử lại.');
      if (generation.current === run) {
        setLessonDetail(confirmed);
        if (!confirmed.isCompleted) setActionError('Máy chủ chưa xác nhận hoàn thành. Vui lòng kiểm tra tiến độ rồi thử lại.');
      }
    } catch (error) {
      if (generation.current === run) setActionError(message(error, 'Chưa lưu được tiến độ. Vui lòng thử lại.'));
    } finally {
      if (generation.current === run) { actionLock.current = false; setCompleting(false); }
    }
  };

  useEffect(() => {
    if (!lessonDetail || lessonDetail.type !== 'Video' || !course || !videoUrl) return;
    const run = generation.current;
    let reporting = false;
    let lastReported = -1;
    const status = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') setVideoError('Không phát được video. Hãy tải lại video để nhận liên kết mới.');
    });
    const ended = player.addListener('playToEnd', () => { void handleCompleteLesson(); });
    const interval = setInterval(async () => {
      const current = Math.floor(player.currentTime);
      const total = videoDuration();
      if (!player.playing || !total || current <= 0 || current === lastReported || reporting) return;
      reporting = true;
      try {
        requireSuccess(await api.updateVideoProgress(course.id, lessonDetail.id, current, total));
        if (generation.current === run) { lastReported = current; setWatchedSeconds(current); }
      } catch {
        if (generation.current === run) setActionError('Chưa đồng bộ được tiến độ video. Kiểm tra kết nối rồi xác nhận lại khi xem xong.');
      } finally { reporting = false; }
    }, 5000);
    return () => { status.remove(); ended.remove(); clearInterval(interval); };
  }, [player, lessonDetail?.id, course?.id, videoUrl, videoError]);

  const submitQuiz = async () => {
    if (!lessonDetail || actionLock.current) return;
    const questions = lessonDetail.quiz?.questions || [];
    if (!questions.length || questions.some(q => !q.options?.some(o => o.id === quizAnswers[q.id]))) {
      setActionError('Hãy chọn đáp án cho tất cả câu hỏi trước khi nộp bài.'); return;
    }
    const run = generation.current;
    actionLock.current = true; setSubmittingQuiz(true); setActionError('');
    try {
      const result = requireSuccess(await api.submitQuiz(lessonDetail.id, questions.map(q => ({ questionId: q.id, selectedOptionId: quizAnswers[q.id] }))));
      if (!result || typeof result.passed !== 'boolean' || !Number.isFinite(result.scorePercentage)) throw new Error('Kết quả trả về không hợp lệ. Vui lòng nộp lại bài.');
      if (generation.current !== run) return;
      setQuizResult(result); setRetakingQuiz(false);
      if (result.passed) setLessonDetail(prev => prev ? { ...prev, isCompleted: true } : prev);
    } catch (error) {
      if (generation.current === run) setActionError(message(error, 'Chưa nộp được bài. Đáp án đã được giữ lại; hãy thử lại.'));
    } finally {
      if (generation.current === run) { actionLock.current = false; setSubmittingQuiz(false); }
    }
  };

  const submitPractice = async (notes: string[]) => {
    if (!lessonDetail || actionLock.current) return false;
    const run = generation.current;
    actionLock.current = true; setCompleting(true); setActionError(''); setPracticeMessage('');
    try {
      if (!notes.length) throw new Error('Chưa thu được nốt nhạc. Hãy thử lại với micro.');
      const result = requireSuccess(await api.submitPractical(lessonDetail.id, notes));
      if (!result || typeof result.passed !== 'boolean') throw new Error('Kết quả thực hành không hợp lệ. Vui lòng thử lại.');
      if (generation.current !== run) return false;
      setPracticeMessage(result.passed ? 'Máy chủ xác nhận: đã đạt bài thực hành.' : 'Chưa đạt yêu cầu. Bạn có thể luyện tập rồi thử lại.');
      if (result.passed) setLessonDetail(prev => prev ? { ...prev, isCompleted: true } : prev);
      return true;
    } catch (error) {
      if (generation.current === run) setActionError(message(error, 'Chưa gửi được bài thực hành. Hãy thử gửi lại.'));
      return false;
    } finally {
      if (generation.current === run) { actionLock.current = false; setCompleting(false); }
    }
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
      router.replace(`/lesson/${nextLesson.id}` as any);
    } else {
      Alert.alert("Chúc mừng!", "Bạn đã hoàn thành bài học cuối cùng của khóa học này!");
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lessonDetail) return <SafeAreaView style={styles.safe}><View style={[styles.content, { gap: 16 }]}>
    <Text accessibilityRole="alert">{loadError || 'Không tìm thấy bài học.'}</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => void fetchLessonData()} style={Theme.button}><Text style={Theme.buttonText}>Tải lại bài học</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/(tabs)/learning')} style={Theme.button}><Text style={Theme.buttonText}>Về lộ trình</Text></TouchableOpacity>
  </View></SafeAreaView>;

  // Quiz variables
  const theory = lessonDetail.theory;
  const quiz = lessonDetail.quiz;
  const practical = lessonDetail.practical;
  const quizQuestions = quiz?.questions ?? [];
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? quizAnswers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

  const hasResult = !retakingQuiz && (quizResult !== null || (lessonDetail.type === 'Quiz' && lessonDetail.isCompleted));
  const quizPassed = quizResult ? quizResult.passed : lessonDetail.isCompleted;

  const renderMediaHeader = () => {
    if (lessonDetail.type === "Video") {
      return <VideoLesson videoLoading={videoLoading} videoUrl={videoUrl} player={player} error={videoError} onRetry={() => course && void fetchVideoUrl(course.id, lessonId)} />;
    }
    if (lessonDetail.type === "Theory") {
      return (
        <LinearGradient colors={Theme.panelGradient} style={styles.mediaHeader}>
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
        <LinearGradient colors={Theme.panelGradient} style={styles.mediaHeader}>
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
        <LinearGradient colors={Theme.panelGradient} style={styles.mediaHeader}>
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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quay lại lộ trình" style={styles.backBtn} onPress={() => router.push('/(tabs)/learning')}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{lessonDetail.title}</Text>
            <Text style={styles.headerSubtitle}>Khóa học: {course?.title}</Text>
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} scrollEnabled showsVerticalScrollIndicator={false}>
        {!practicalMode && renderMediaHeader()}
        {!!actionError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: Colors.danger, padding: 16 }}>{actionError}</Text>}
        {!!practiceMessage && <Text accessibilityLiveRegion="polite" style={{ padding: 16 }}>{practiceMessage}</Text>}

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

              <TouchableOpacity accessibilityRole="button" style={styles.actionBtn}
                disabled={completing || !videoUrl || !!videoError || lessonDetail.isCompleted}
                onPress={() => void handleCompleteLesson()}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>{completing ? 'Đang lưu...' : lessonDetail.isCompleted ? 'Đã hoàn thành' : 'Tôi đã xem xong'}</Text>
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
              <TouchableOpacity accessibilityRole="button" style={styles.actionBtn}
                disabled={completing || lessonDetail.isCompleted}
                onPress={() => void handleCompleteLesson()}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionBtnGradient}>
                  <Text style={styles.actionBtnText}>{completing ? 'Đang lưu...' : lessonDetail.isCompleted ? 'Đã hoàn thành' : 'Hoàn thành bài đọc'}</Text>
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
                      name={quizPassed ? "ribbon-outline" : "alert-circle-outline"}
                      size={64}
                      color={quizPassed ? Colors.primary : Colors.danger}
                    />
                    <Text style={{
                      fontSize: 24,
                      fontWeight: "800",
                      marginTop: 12,
                      color: quizPassed ? Colors.primary : Colors.danger,
                    }}>
                      {quizPassed ? "ĐÃ ĐẠT BÀI THI!" : "CHƯA ĐẠT YÊU CẦU"}
                    </Text>
                    {quizResult && (
                      <Text style={{ marginTop: 8, color: Colors.light.textSecondary }}>
                        Số câu đúng: {quizResult.correctAnswers} / {quizResult.totalQuestions}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity accessibilityRole="button" style={styles.actionBtn}
                    onPress={() => {
                      setQuizResult(null);
                      setRetakingQuiz(true); setActionError('');
                      setCurrentQuestionIndex(0);
                      setQuizAnswers({});
                    }}
                  >
                    <LinearGradient colors={[Colors.primary, Colors.primary]} style={styles.actionBtnGradient}>
                      <Ionicons name="refresh-outline" size={20} color="#FFF" />
                      <Text style={styles.actionBtnText}> Làm lại</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : !quizQuestions.length ? <View style={styles.card}><Text>Bài trắc nghiệm chưa có câu hỏi. Vui lòng quay lại sau.</Text></View> : (
                <View style={styles.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={styles.cardTitle}>CÂU HỎI {currentQuestionIndex + 1}/{quizQuestions.length}</Text>
                  </View>
                  <Text style={styles.quizQuestionText}>{currentQuestion?.prompt}</Text>
                  <View style={styles.quizOptionsCol}>
                    {currentQuestion?.options?.map((opt, oIdx) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <TouchableOpacity accessibilityRole="radio" aria-checked={isSelected} accessibilityState={{ checked: isSelected }} key={opt.id}
                          style={[styles.quizOptionBtn, isSelected && styles.quizOptionSelected]}
                          onPress={() => setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.id }))}
                        >
                          <View style={styles.quizOptionNumber}>
                            <Text style={[styles.quizOptionNumberText, isSelected && { color: Colors.primaryDark }]}>
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
                      <TouchableOpacity accessibilityRole="button" style={[styles.actionBtn, { flex: 1 }]}
                        onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                      >
                        <View style={[styles.actionBtnGradient, { backgroundColor: Colors.light.bgElevated }]}>
                          <Text style={[styles.actionBtnText, { color: Colors.light.text }]}>Quay lại</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {!isLastQuestion ? (
                      <TouchableOpacity accessibilityRole="button" style={[styles.actionBtn, { flex: 2 }]}
                        disabled={selectedOptionId === undefined}
                        onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
                      >
                        <LinearGradient
                          colors={selectedOptionId === undefined ? [Colors.light.textSecondary, Colors.light.textSecondary] : [Colors.primary, Colors.primaryDark]}
                          style={styles.actionBtnGradient}
                        >
                          <Text style={styles.actionBtnText}>Câu tiếp theo</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity accessibilityRole="button" style={[styles.actionBtn, { flex: 2 }]}
                        disabled={selectedOptionId === undefined || submittingQuiz}
                        onPress={() => void submitQuiz()}
                      >
                        <LinearGradient colors={[Colors.accent, Colors.accent]} style={styles.actionBtnGradient}>
                          <Text style={styles.actionBtnText}>{submittingQuiz ? 'Đang nộp...' : 'Nộp bài'}</Text>
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
              onComplete={submitPractice}
              mode={practicalMode}
              setMode={setPracticalMode}
            />
          )}

        </View>
      </ScrollView>

      {/* Persistent Bottom Bar for Navigation */}
      {!practicalMode && (
        <View style={styles.bottomBar}>
          <TouchableOpacity accessibilityRole="button" style={styles.navBtn} onPress={() => router.push('/(tabs)/learning')}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.navBtnText}>Danh sách</Text>
          </TouchableOpacity>

          {lessonDetail.isCompleted && (
            <TouchableOpacity accessibilityRole="button" style={styles.nextBtn} onPress={navigateToNextLesson}>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border, backgroundColor: Colors.light.bgCard },
  backBtn: { padding: 12, minWidth: 48, minHeight: 48 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.light.text },
  headerSubtitle: { fontSize: 13, color: Colors.light.textMuted },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.light.bgCard, borderRadius: 16, padding: 18, marginBottom: 20, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1.5, color: Colors.light.textMuted, marginBottom: 14 },
  bodyText: { fontSize: 15, color: Colors.light.textSecondary, lineHeight: 24 },
  mediaHeader: { padding: 24, alignItems: "center", justifyContent: "center", minHeight: 160 },
  mediaHeaderMeta: { alignItems: "center", marginTop: 12 },
  mediaHeaderTag: { color: Colors.light.text, fontSize: 14, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  mediaHeaderSubtitle: { color: Colors.light.textSecondary, fontSize: 13 },
  actionBtn: { borderRadius: 14, overflow: "hidden", marginTop: 16 },
  actionBtnGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 14 },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  quizQuestionText: { fontSize: 16, fontWeight: "600", color: Colors.light.text, lineHeight: 24, marginBottom: 20 },
  quizOptionsCol: { gap: 12 },
  quizOptionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.bgElevated, borderWidth: 2, borderColor: "transparent", borderRadius: 16, padding: 12 },
  quizOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.selected },
  quizOptionNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.infoBg, justifyContent: "center", alignItems: "center", marginRight: 12 },
  quizOptionNumberText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  quizOptionText: { flex: 1, fontSize: 15, color: Colors.light.textSecondary, lineHeight: 22 },
  quizOptionTextSelected: { color: Colors.primaryDark, fontWeight: "600" },
  bottomBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: Colors.light.border, backgroundColor: Colors.light.bgCard, alignItems: 'center' },
  navBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Colors.light.bgElevated, borderRadius: 12 },
  navBtnText: { marginLeft: 8, color: Colors.primary, fontWeight: '600' },
  nextBtn: { flex: 1, minWidth: 180, borderRadius: 12, overflow: 'hidden' },
  nextBtnGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
  nextBtnText: { flexShrink: 1, color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 }
});
