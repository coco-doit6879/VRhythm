import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../../constants/Colors';
import { api, CourseSummaryDto } from '../../services/api';

const { width } = Dimensions.get('window');

const TOOLS = [
  { id: '1', icon: 'hardware-chip-outline', label: 'Chấm điểm AI', desc: 'Phân tích kỹ thuật gảy', color: '#52B788', bg: '#EBF6F0' },
  { id: '2', icon: 'musical-notes-outline', label: 'Lên dây điện tử', desc: 'Chuẩn âm truyền thống', color: '#F4A261', bg: '#FEF3E8' },
];

const FEATURES = [
  { id: '1', icon: 'megaphone-outline', label: 'Quảng bá', color: '#52B788', bg: '#EBF6F0' },
  { id: '2', icon: 'diamond-outline', label: 'Gói cao cấp', color: '#F4A261', bg: '#FEF3E8' },
  { id: '3', icon: 'earth-outline', label: 'Tour văn hóa', color: '#4895EF', bg: '#EBF2FE' },
  { id: '4', icon: 'play-circle-outline', label: 'Hướng dẫn', color: '#7B5EA7', bg: '#F0EBFA' },
  { id: '5', icon: 'musical-note-outline', label: 'Thư viện', color: '#52B788', bg: '#E8F5EF' },
  { id: '6', icon: 'ellipsis-horizontal', label: 'Thêm', color: '#9CB8A8', bg: '#F5F5F5' },
];

const INSTRUMENTS = [
  {
    id: '1',
    name: 'Đàn Tranh',
    desc: 'Đàn tranh là nhạc cụ truyền thống của Việt Nam, thuộc họ dây gảy...',
    level: 'Cơ bản',
    levelColor: Colors.basic,
    emoji: '🎵',
  },
  {
    id: '2',
    name: 'Đàn Nguyệt',
    desc: 'Sở hữu âm sắc trong trẻo, réo rắt, gắn liền với hát Chầu văn...',
    level: 'Trung cấp',
    levelColor: Colors.intermediate,
    emoji: '🎸',
  },
  {
    id: '3',
    name: 'Sáo Trúc',
    desc: 'Mang âm hưởng của làng quê Việt Nam, tiếng sáo thanh thoát...',
    level: 'Nâng cao',
    levelColor: Colors.advanced,
    emoji: '🎶',
  },
];

export default function HomeScreen() {
  const [courses, setCourses] = useState<CourseSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await api.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleSelectCourse = (courseId: number) => {
    api.setCurrentCourseId(courseId);
    router.push('/learning-detail');
  };

  const handleContinueLearning = () => {
    let activeId = api.getCurrentCourseId();
    if (!activeId && courses.length > 0) {
      activeId = courses[0].id;
      api.setCurrentCourseId(activeId);
    }
    if (activeId) {
      router.push('/(tabs)/learning');
    } else {
      // If no courses at all, go to learning tab anyway
      router.push('/(tabs)/learning');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>V</Text>
            </View>
            <Text style={styles.appName}>VRhythm</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Banner */}
        <TouchableOpacity style={styles.heroBanner} activeOpacity={0.9}>
          <LinearGradient
            colors={['#1A3020', '#2D6A4F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerGradient}
          >
            <View style={styles.heroBannerContent}>
              <Text style={styles.heroTitle}>Bảo tồn và lan{'\n'}tỏa âm nhạc{'\n'}dân tộc</Text>
              <Text style={styles.heroSubtitle}>
                Khám phá, học tập và trải nghiệm di sản âm nhạc Việt Nam theo cách hiện đại.
              </Text>
              <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
                <Text style={styles.heroBtnText}>Khám phá ngay</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroDecor}>
              <Text style={{ fontSize: 72 }}>🎼</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Smart Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Công cụ thông minh</Text>
          <View style={styles.toolsRow}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                activeOpacity={0.8}
                onPress={() => tool.id === '1' ? router.push('/ai-scoring') : router.push('/tuner')}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.bg }]}>
                  <Ionicons name={tool.icon as any} size={26} color={tool.color} />
                </View>
                <Text style={styles.toolLabel}>{tool.label}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text style={styles.featuresSectionLabel}>TÍNH NĂNG NỔI BẬT</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feat) => (
              <TouchableOpacity key={feat.id} style={styles.featureCell} activeOpacity={0.7}>
                <View style={[styles.featureCellIcon, { backgroundColor: feat.bg }]}>
                  <Ionicons name={feat.icon as any} size={22} color={feat.color} />
                </View>
                <Text style={styles.featureCellLabel}>{feat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Instruments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa học phổ biến</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : courses.length === 0 ? (
            <Text style={{ color: Colors.light.textMuted, textAlign: 'center', marginVertical: 20 }}>
              Không tìm thấy khóa học nào.
            </Text>
          ) : (
            courses.map((course) => {
              const emoji = course.instrument.includes('Tranh') ? '🎵' 
                          : course.instrument.includes('Nguyệt') ? '🎸' 
                          : course.instrument.includes('Sáo') ? '🎶' : '🎼';
              
              const levelColor = course.accessType === 'Free' || course.accessType === '0'
                ? Colors.basic 
                : Colors.intermediate;
              const levelText = course.accessType === 'Free' || course.accessType === '0'
                ? 'Miễn phí' 
                : 'Cao cấp';

              return (
                <TouchableOpacity
                  key={course.id}
                  style={styles.instrumentCard}
                  activeOpacity={0.8}
                  onPress={() => handleSelectCourse(course.id)}
                >
                  <View style={styles.instrumentEmoji}>
                    <Text style={{ fontSize: 36 }}>{emoji}</Text>
                  </View>
                  <View style={styles.instrumentInfo}>
                    <View style={styles.instrumentHeader}>
                      <Text style={styles.instrumentName}>{course.title}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                        <Text style={[styles.levelText, { color: levelColor }]}>{levelText}</Text>
                      </View>
                    </View>
                    <Text style={styles.instrumentDesc} numberOfLines={2}>
                      {course.description || `Khóa học học nhạc cụ ${course.instrument} truyền thống.`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiếp tục học tập</Text>
          <TouchableOpacity
            style={styles.continueCard}
            activeOpacity={0.85}
            onPress={handleContinueLearning}
          >
            <LinearGradient
              colors={['#1A3020', '#0D1F17']}
              style={styles.continueGradient}
            >
              <View style={styles.continuePlayBtn}>
                <Ionicons name="play" size={22} color="#FFF" />
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueLessonTitle}>Bài học gần đây</Text>
                <Text style={styles.continueMeta}>Khóa học của bạn • Nhấn để học tiếp</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '45%' }]} />
                </View>
              </View>
              <Text style={styles.continuePercent}>45%</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  appName: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBanner: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  heroBannerGradient: { padding: 24, flexDirection: 'row', alignItems: 'center', minHeight: 160 },
  heroBannerContent: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', lineHeight: 30, marginBottom: 10 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18, marginBottom: 16 },
  heroBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  heroDecor: { marginLeft: 12, opacity: 0.8 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  featuresSectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, color: Colors.light.textMuted, marginBottom: 14 },

  toolsRow: { flexDirection: 'row', gap: 14 },
  toolCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  toolIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolLabel: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  toolDesc: { fontSize: 12, color: Colors.light.textMuted, lineHeight: 16 },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCell: {
    width: (width - 40 - 24) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  featureCellIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureCellLabel: { fontSize: 12, fontWeight: '500', color: Colors.light.textSecondary, textAlign: 'center' },

  instrumentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  instrumentEmoji: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instrumentInfo: { flex: 1 },
  instrumentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  instrumentName: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: '700' },
  instrumentDesc: { fontSize: 12, color: Colors.light.textMuted, lineHeight: 17 },

  continueCard: { borderRadius: 18, overflow: 'hidden' },
  continueGradient: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  continuePlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueInfo: { flex: 1 },
  continueLessonTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  continueMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  continuePercent: { fontSize: 13, color: Colors.accent, fontWeight: '700' },
});
