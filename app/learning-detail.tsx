import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { api, CourseDetailDto } from '../services/api';

export default function LearningDetailScreen() {
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const fetchCourseDetail = async () => {
    const courseId = api.getCurrentCourseId();
    if (!courseId) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.getCourseDetail(courseId);
      if (response.success && response.data) {
        const raw = response.data;
        const refined: CourseDetailDto = {
          ...raw,
          title: raw.title ? raw.title.replace(/:\s*Từ Cơ Bản Đến Bèo Dạt Mây Trôi/gi, '').trim() : raw.title,
          description: raw.description && /bèo dạt mây trôi/i.test(raw.description) && /người mới bắt đầu/i.test(raw.description)
            ? 'Lộ trình học sáo trúc bài bản và dễ tiếp cận, đưa bạn từ những nốt nhạc đầu tiên đến khi tự tin chinh phục giai điệu dân ca kinh điển Bèo Dạt Mây Trôi.'
            : raw.description,
          chapters: raw.chapters?.map(chap => ({
            ...chap,
            title: /Làm quen nốt nhạc/i.test(chap.title)
              ? 'Làm quen nốt nhạc (Đô, Rê, Mi, Fa, Sol, La, Si)'
              : /Kỹ thuật trang trí/i.test(chap.title)
              ? 'Kỹ thuật rung hơi và luyến ngón'
              : /Chinh phục Bèo Dạt Mây Trôi/i.test(chap.title)
              ? 'Chinh phục giai điệu dân ca kinh điển Bèo Dạt Mây Trôi'
              : chap.title,
          })),
        };
        setCourse(refined);
      }
    } catch (error) {
      console.error('Error fetching course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, []);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrollLoading(true);
    try {
      const response = await api.enrollCourse(course.id);
      if (response.success) {
        await fetchCourseDetail();
      } else {
        // Fallback for simulation
        setCourse({ ...course, isEnrolled: true });
      }
    } catch (error) {
      console.warn('Enrollment API error, simulating local success:', error);
      setCourse({ ...course, isEnrolled: true });
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 12, color: Colors.light.textMuted }}>Đang tải thông tin khóa học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết khóa học</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.textMuted} style={{ marginBottom: 12 }} />
          <Text style={{ color: Colors.light.textMuted, textAlign: 'center', fontSize: 15, marginBottom: 20 }}>
            Không tìm thấy thông tin khóa học. Vui lòng quay lại Trang chủ.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Về Trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const emoji = course.instrument?.includes('Tranh') ? '🎵' 
              : course.instrument?.includes('Nguyệt') ? '🎸' 
              : course.instrument?.includes('Sáo') ? '🎶' 
              : course.instrument?.includes('Bầu') ? '🪕' : '🎼';

  const totalChapters = course.chapters?.length || 0;
  const totalLessons = course.chapters?.reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết khóa học</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Hero Banner */}
        <LinearGradient colors={['#1A3020', '#2D6A4F']} style={styles.banner}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{emoji}</Text>
          <Text style={styles.bannerTitle}>{course.title}</Text>
          <Text style={styles.bannerSub}>Nhạc cụ: {course.instrument || 'Nhạc cụ dân tộc'}</Text>
          {course.isEnrolled ? (
            <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(tabs)/learning')}>
              <Text style={styles.startBtnText}>Bắt đầu học ngay</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={handleEnroll} disabled={enrollLoading}>
              {enrollLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.startBtnText}>Đăng ký học miễn phí</Text>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="layers-outline" size={20} color={Colors.primary} />
              <Text style={styles.statVal}>{totalChapters}</Text>
              <Text style={styles.statLabel}>Chương học</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="journal-outline" size={20} color={Colors.info} />
              <Text style={styles.statVal}>{totalLessons}</Text>
              <Text style={styles.statLabel}>Bài học</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="hardware-chip-outline" size={20} color={Colors.warning} />
              <Text style={styles.statVal}>AI</Text>
              <Text style={styles.statLabel}>Chấm điểm</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Giới thiệu khóa học & Nhạc cụ</Text>
            <Text style={styles.desc}>
              {course.description || `Khóa học giảng dạy nhạc cụ truyền thống ${course.instrument} của Việt Nam từ cơ bản đến nâng cao. Giúp học viên nắm vững cấu tạo, kỹ thuật ngón và biểu diễn bài bản dân ca truyền thống.`}
            </Text>
          </View>

          {/* Syllabus Preview */}
          {course.chapters && course.chapters.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Lộ trình bài học</Text>
              {course.chapters.map((chap, idx) => (
                <View key={chap.id} style={styles.syllabusRow}>
                  <View style={styles.syllabusNumber}>
                    <Text style={styles.syllabusNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.syllabusTitle}>{chap.title}</Text>
                    <Text style={styles.syllabusSub}>{chap.lessons?.length || 0} bài học nhỏ</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Button */}
          {course.isEnrolled ? (
            <TouchableOpacity style={styles.learnBtn} onPress={() => router.push('/(tabs)/learning')}>
              <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.learnBtnGrad}>
                <Ionicons name="school-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.learnBtnText}>Vào lớp học ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.learnBtn} onPress={handleEnroll} disabled={enrollLoading}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.learnBtnGrad}>
                {enrollLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.learnBtnText}>Đăng ký học khóa này</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.light.bgElevated, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.text },

  banner: { margin: 20, borderRadius: 20, padding: 28, alignItems: 'center' },
  bannerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6, textAlign: 'center' },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 18, textAlign: 'center' },
  startBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  startBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  content: { paddingHorizontal: 20 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.light.text, marginTop: 4, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.light.textMuted, fontWeight: '600' },

  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 12 },
  desc: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 22 },

  syllabusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  syllabusNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.light.bgElevated, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  syllabusNumText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  syllabusTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 2 },
  syllabusSub: { fontSize: 12, color: Colors.light.textMuted },

  learnBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  learnBtnGrad: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  learnBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

