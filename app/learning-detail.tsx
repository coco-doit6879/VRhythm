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

  useEffect(() => {
    const fetchCourseDetail = async () => {
      const courseId = api.getCurrentCourseId();
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.getCourseDetail(courseId);
        if (response.success && response.data) {
          setCourse(response.data);
        }
      } catch (error) {
        console.error('Error fetching course detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, []);

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
          <Text style={styles.headerTitle}>Lỗi</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: Colors.light.textMuted, textAlign: 'center', fontSize: 16 }}>
            Không tìm thấy thông tin khóa học. Vui lòng quay lại Trang chủ.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const emoji = course.instrument?.includes('Tranh') ? '🎵' 
              : course.instrument?.includes('Nguyệt') ? '🎸' 
              : course.instrument?.includes('Sáo') ? '🎶' : '🎼';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết khóa học</Text>
          <View style={{ width: 38 }} />
        </View>
        <LinearGradient colors={['#1A3020', '#2D6A4F']} style={styles.banner}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{emoji}</Text>
          <Text style={styles.bannerTitle}>{course.title}</Text>
          <Text style={styles.bannerSub}>Nhạc cụ: {course.instrument || 'Nhạc cụ dân tộc'}</Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(tabs)/learning')}>
            <Text style={styles.startBtnText}>Bắt đầu học</Text>
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Giới thiệu khóa học</Text>
          <Text style={styles.desc}>
            {course.description || `Khóa học giảng dạy nhạc cụ truyền thống ${course.instrument} của Việt Nam từ cơ bản đến nâng cao.`}
          </Text>
          <TouchableOpacity style={styles.learnBtn} onPress={() => router.push('/(tabs)/learning')}>
            <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.learnBtnGrad}>
              <Ionicons name="school-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.learnBtnText}>Vào học ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.light.bgElevated, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.text },
  banner: { margin: 20, borderRadius: 20, padding: 32, alignItems: 'center' },
  bannerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 20, textAlign: 'center' },
  startBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  startBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 12 },
  desc: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 22, marginBottom: 24 },
  learnBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  learnBtnGrad: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  learnBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
