import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Text } from '../../ui/Typography';
import { InstrumentArt } from '../../ui/InstrumentArt';
import { api, CourseSummaryDto } from '../../services/api';
import { storage } from '../../services/api-storage';

export default function HomeScreen() {
  const [courses, setCourses] = useState<CourseSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [goal, setGoal] = useState(storage.getItem('onboardingTime') || '10 phút');
  const [showGoal, setShowGoal] = useState(storage.getItem('hasCompletedOnboarding') !== 'true');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.getCourses();
      if (!response.success) throw new Error(response.message || 'Không thể tải khóa học.');
      setCourses(response.data || []);
      const activeId = api.getCurrentCourseId();
      if (activeId) {
        const detail = await api.getCourseDetail(activeId);
        if (detail.success && detail.data) {
          const lessons = detail.data.chapters?.flatMap(ch => ch.lessons || []) || [];
          setActiveTitle(detail.data.title || 'Khóa học của bạn');
          setProgress(lessons.length ? Math.round(100 * lessons.filter(l => l.isCompleted).length / lessons.length) : 0);
        }
      } else { setProgress(null); setActiveTitle(''); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể kết nối. Kéo xuống để thử lại.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function openCourse(course: CourseSummaryDto) {
    try {
      api.setCurrentCourseId(course.id);
      storage.setItem('onboardingInstrument', course.instrument || '');
      router.push('/learning-detail');
    } catch { setError('Không lưu được lựa chọn trên thiết bị. Hãy mở khóa thiết bị và thử lại.'); }
  }

  return <SafeAreaView style={Theme.screen} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} colors={[Colors.primary]} />}>
      <View style={styles.header}>
        <View style={styles.brand}><Image source={require('../../web/public/images/generated/vrhythm-logo-mark.png')} style={styles.logo} accessible={false} /><Text style={styles.brandName}>VRhythm</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Hồ sơ của bạn" style={Theme.iconButton} onPress={() => router.push('/(tabs)/profile')}><Ionicons name="person-outline" size={22} color={Colors.primary} /></TouchableOpacity>
      </View>
      <LinearGradient colors={Theme.panelGradient} style={styles.hero}>
        <Text accessibilityRole="header" style={styles.heroTitle}>Bảo tồn và lan tỏa{ '\n'}âm nhạc dân tộc</Text>
        <Text style={Theme.body}>Khám phá, học tập và trải nghiệm di sản âm nhạc Việt Nam theo cách hiện đại.</Text>
        <InstrumentArt instrument="Sáo Trúc" style={styles.heroArt} />
        <TouchableOpacity accessibilityRole="button" style={Theme.button} onPress={() => router.push('/(tabs)/learning')}><Text style={Theme.buttonText}>Bắt đầu học nhạc</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.textLink} onPress={() => router.push('/(tabs)/library')}><Text style={styles.linkText}>Khám phá thư viện bản nhạc</Text><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity>
      </LinearGradient>

      {progress !== null && <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Tiếp tục hành trình</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/learning')} style={Theme.panel}>
          <Text style={styles.courseTitle}>{activeTitle}</Text>
          <Text style={styles.meta}>Đã hoàn thành {progress}% · Mục tiêu {goal}/ngày</Text>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }} style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
          <Text style={styles.linkText}>Học tiếp →</Text>
        </TouchableOpacity>
      </View>}

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Tìm nhạc cụ của bạn</Text>
        <Text style={[Theme.body, { marginBottom: 18 }]}>Chọn một khóa học và bắt đầu từ những âm thanh đầu tiên.</Text>
        {loading && <ActivityIndicator color={Colors.primary} style={{ padding: 24 }} />}
        {!!error && <View style={styles.error}><Text accessibilityRole="alert" style={{ color: Colors.danger }}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={load} style={styles.textLink}><Text style={styles.linkText}>Thử lại</Text></TouchableOpacity></View>}
        {!loading && !error && !courses.length && <Text style={Theme.body}>Chưa có khóa học. Kéo xuống để cập nhật.</Text>}
        {courses.map(course => <TouchableOpacity accessibilityRole="button" accessibilityLabel={course.title} key={course.id} onPress={() => openCourse(course)} style={styles.course}>
          <View style={styles.courseArt}><InstrumentArt instrument={course.instrument} style={{ width: '100%', height: 150 }} /></View>
          <View style={styles.courseCopy}>
            <View style={styles.courseMeta}><Text style={styles.meta}>{course.instrument}</Text><Text style={styles.access}>{['Free', '0'].includes(course.accessType) ? 'Miễn phí' : 'Cao cấp'}</Text></View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.meta} numberOfLines={3}>{course.description}</Text>
            <View style={styles.courseAction}><Text style={styles.linkText}>Xem khóa học</Text><Ionicons name="arrow-forward" size={20} color={Colors.primary} /></View>
          </View>
        </TouchableOpacity>)}
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Luyện tập theo nhịp của bạn</Text>
        <View style={Theme.panel}><Text style={Theme.body}>Mục tiêu mỗi ngày: {goal}.</Text>
          {showGoal ? <><View style={styles.goalRow}>{['5 phút', '10 phút', '20 phút'].map(time => <TouchableOpacity key={time} accessibilityRole="radio" accessibilityState={{ checked: time === goal }} onPress={() => setGoal(time)} style={[styles.goal, time === goal && styles.goalSelected]}><Text style={{ color: time === goal ? Colors.onPrimary : Colors.primary }}>{time}</Text></TouchableOpacity>)}</View>
            <TouchableOpacity accessibilityRole="button" style={Theme.button} onPress={() => { try { storage.setItem('onboardingTime', goal); storage.setItem('hasCompletedOnboarding', 'true'); setShowGoal(false); } catch { setError('Không lưu được mục tiêu trên thiết bị. Vui lòng thử lại.'); } }}><Text style={Theme.buttonText}>Lưu mục tiêu</Text></TouchableOpacity></>
            : <TouchableOpacity accessibilityRole="button" style={styles.textLink} onPress={() => setShowGoal(true)}><Text style={styles.linkText}>Đổi mục tiêu</Text></TouchableOpacity>}
        </View>
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Công cụ luyện tập</Text>
        {([{ title: 'Lên dây điện tử', route: '/tuner', icon: 'musical-notes-outline' }, { title: 'Chấm điểm AI', route: '/ai-scoring', icon: 'pulse-outline' }] as const).map(tool => <TouchableOpacity accessibilityRole="button" key={tool.route} style={styles.tool} onPress={() => router.push(tool.route)}>
          <Ionicons name={tool.icon} size={24} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.courseTitle}>{tool.title}</Text><Text style={styles.meta}>Bản xem trước · dữ liệu minh họa</Text></View><Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>)}
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { paddingBottom: 32, width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 }, logo: { width: 40, height: 40, resizeMode: 'contain' },
  brandName: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  hero: { marginHorizontal: 20, padding: 24, borderRadius: 14, marginBottom: 36 },
  heroTitle: { fontSize: 30, fontWeight: '700', lineHeight: 42, marginBottom: 16 },
  heroArt: { width: '100%', height: 160, marginVertical: 20 },
  textLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  linkText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 32 }, sectionTitle: { fontSize: 23, lineHeight: 33, fontWeight: '700', marginBottom: 16 },
  course: { borderWidth: 1, borderColor: Colors.light.border, borderRadius: 14, backgroundColor: Colors.light.bgCard, overflow: 'hidden', marginBottom: 18 },
  courseArt: { backgroundColor: Colors.successBg, padding: 20 }, courseCopy: { padding: 20, gap: 10 },
  courseMeta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  courseTitle: { fontSize: 18, lineHeight: 27, fontWeight: '700' }, meta: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 21 },
  access: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  courseAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  error: { padding: 16, backgroundColor: Colors.dangerBg, borderRadius: 12 },
  track: { height: 6, borderRadius: 3, backgroundColor: Colors.selected, marginVertical: 16 }, fill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  goal: { minHeight: 48, flexGrow: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.bgElevated },
  goalSelected: { backgroundColor: Colors.primary },
  tool: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
});
