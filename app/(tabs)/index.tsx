import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../../constants/Colors';
import { api, CourseSummaryDto } from '../../services/api';
import { storage } from '../../services/api-storage';

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

  // User onboarding states
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [onboardingInstrument, setOnboardingInstrument] = useState('');
  const [onboardingTime, setOnboardingTime] = useState('');

  // Onboarding Modal states
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Active course progress states
  const [currentCourseProgress, setCurrentCourseProgress] = useState<number | null>(null);
  const [currentCourseTitle, setCurrentCourseTitle] = useState<string>('');

  const fetchHomeData = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      // 1. Fetch courses list
      const response = await api.getCourses();
      let fetchedCourses: CourseSummaryDto[] = [];
      if (response.success && response.data) {
        fetchedCourses = response.data;
        setCourses(fetchedCourses);
      }

      // 2. Read onboarding status from storage
      const onboardingStatus = storage.getItem("hasCompletedOnboarding");
      const instrumentPref = storage.getItem("onboardingInstrument") || '';
      const timePref = storage.getItem("onboardingTime") || '';

      const completedOnboarding = onboardingStatus === "true";
      setHasCompletedOnboarding(completedOnboarding);
      setOnboardingInstrument(instrumentPref);
      setOnboardingTime(timePref);

      // If onboarding is not completed, we trigger the onboarding modal
      if (!completedOnboarding) {
        setOnboardingVisible(true);
        setOnboardingStep(1);
      }

      // 3. Fetch active course and calculate progress
      const activeCourseId = api.getCurrentCourseId();
      if (activeCourseId) {
        const detailRes = await api.getCourseDetail(activeCourseId);
        if (detailRes.success && detailRes.data) {
          const detail = detailRes.data;
          setCurrentCourseTitle(detail.title || '');

          const totalLessons = detail.chapters?.reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0) || 0;
          const completedLessons = detail.chapters?.reduce((acc, chap) => acc + (chap.lessons?.filter((l) => l.isCompleted).length || 0), 0) || 0;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          setCurrentCourseProgress(progressPercent);
        } else {
          setCurrentCourseProgress(null);
          setCurrentCourseTitle('');
        }
      } else {
        setCurrentCourseProgress(null);
        setCurrentCourseTitle('');
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHomeData(courses.length === 0);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHomeData(false);
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
      router.push('/(tabs)/learning');
    }
  };

  const handleFinishOnboarding = async () => {
    if (!selectedInstrument || !selectedTime) return;
    setEnrolling(true);
    try {
      // 1. Save preferences to local storage
      storage.setItem("hasCompletedOnboarding", "true");
      storage.setItem("onboardingInstrument", selectedInstrument);
      storage.setItem("onboardingTime", selectedTime);

      // 2. Map selected instrument to course ID
      let searchKey = '';
      if (selectedInstrument === 'Đàn Tranh') searchKey = 'tranh';
      else if (selectedInstrument === 'Sáo Trúc') searchKey = 'sáo';
      else if (selectedInstrument === 'Đàn Bầu') searchKey = 'bầu';

      const matchedCourse = courses.find(c => 
        (c.instrument && c.instrument.toLowerCase().includes(searchKey)) ||
        (c.title && c.title.toLowerCase().includes(searchKey))
      );

      let targetCourseId = matchedCourse ? matchedCourse.id : (courses.length > 0 ? courses[0].id : null);

      if (targetCourseId) {
        // Enroll user in course
        await api.enrollCourse(targetCourseId);
        api.setCurrentCourseId(targetCourseId);
      }

      // Close modal
      setOnboardingVisible(false);

      // Refresh Home page layout with new values
      await fetchHomeData(true);

      // Redirect user to the active course detail screen
      if (targetCourseId) {
        router.push('/learning-detail');
      } else {
        router.push('/(tabs)/learning');
      }
    } catch (error) {
      console.error("Error finalizing onboarding:", error);
      setOnboardingVisible(false);
    } finally {
      setEnrolling(false);
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

        {/* Call To Action (CTA) Section */}
        {hasCompletedOnboarding && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentCourseProgress !== null ? "Tiếp tục bài học của bạn" : "Bài học thử của bạn"}
            </Text>
            
            {currentCourseProgress !== null ? (
              /* User cũ: Tiếp tục bài học với thanh tiến độ thực tế và nút Tập luyện ngay! */
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
                    <Text style={styles.continueLessonTitle} numberOfLines={1}>
                      {currentCourseTitle || "Khóa học của bạn"}
                    </Text>
                    <Text style={styles.continueMeta}>
                      Mục tiêu: {onboardingTime || "10 phút"}/ngày • Nhấn để học tiếp
                    </Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${currentCourseProgress}%` }]} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
                    <Text style={styles.continuePercent}>{currentCourseProgress}%</Text>
                    <View style={styles.practiceNowBadge}>
                      <Text style={styles.practiceNowBadgeText}>Tập luyện ngay!</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              /* User mới: Có nút "Học thử ngay" giới thiệu nhạc cụ họ đã chọn trong Onboarding */
              <TouchableOpacity
                style={styles.newUserCtaCard}
                activeOpacity={0.85}
                onPress={handleContinueLearning}
              >
                <LinearGradient
                  colors={['#2D6A4F', '#1B4332']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.newUserCtaGradient}
                >
                  <View style={styles.newUserCtaInfo}>
                    <Text style={styles.newUserCtaSubtitle}>DÀNH RIÊNG CHO BẠN</Text>
                    <Text style={styles.newUserCtaTitle}>
                      Khóa học {onboardingInstrument || "Nhạc cụ truyền thống"}
                    </Text>
                    <Text style={styles.newUserCtaDesc}>
                      Bạn đã đặt mục tiêu luyện tập {onboardingTime || "10 phút"} mỗi ngày. Bắt đầu ngay để không bỏ lỡ cảm hứng!
                    </Text>
                  </View>
                  <View style={styles.newUserCtaBtn}>
                    <Text style={styles.newUserCtaBtnText}>Học thử ngay</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Onboarding Welcome Survey Modal */}
      <Modal
        visible={onboardingVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Step Indicators */}
            <View style={styles.progressDots}>
              <View style={[styles.progressDot, onboardingStep >= 1 && styles.progressDotActive]} />
              <View style={[styles.progressDot, onboardingStep >= 2 && styles.progressDotActive]} />
              <View style={[styles.progressDot, onboardingStep >= 3 && styles.progressDotActive]} />
            </View>

            {onboardingStep === 1 && (
              <View>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconBox, { backgroundColor: '#EBF6F0' }]}>
                    <Ionicons name="musical-notes" size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>Chào mừng bạn đến với VRhythm!</Text>
                  <Text style={styles.modalSubtitle}>
                    Hãy chọn một loại nhạc cụ truyền thống mà bạn muốn bắt đầu học và luyện tập:
                  </Text>
                </View>

                <View style={styles.optionList}>
                  {[
                    { name: 'Đàn Tranh', emoji: '🎵', desc: 'Họ dây gảy truyền thống, âm sắc lảnh lót' },
                    { name: 'Sáo Trúc', emoji: '🎶', desc: 'Âm thanh thanh tao, mộc mạc quê hương' },
                    { name: 'Đàn Bầu', emoji: '🎼', desc: 'Độc huyền cầm, âm điệu da diết, đặc trưng' },
                  ].map((inst) => {
                    const isSelected = selectedInstrument === inst.name;
                    return (
                      <TouchableOpacity
                        key={inst.name}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                        onPress={() => setSelectedInstrument(inst.name)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.optionEmoji}>{inst.emoji}</Text>
                        <View style={styles.optionTextWrapper}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                            {inst.name}
                          </Text>
                          <Text style={styles.optionDesc}>{inst.desc}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary, !selectedInstrument && { opacity: 0.5 }]}
                    disabled={!selectedInstrument}
                    onPress={() => setOnboardingStep(2)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalBtnPrimaryText}>Tiếp tục</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {onboardingStep === 2 && (
              <View>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconBox, { backgroundColor: '#FEF3E8' }]}>
                    <Ionicons name="time" size={28} color={Colors.warning} />
                  </View>
                  <Text style={styles.modalTitle}>Luyện tập hàng ngày</Text>
                  <Text style={styles.modalSubtitle}>
                    Chọn mục tiêu thời gian bạn muốn dành để tập luyện mỗi ngày:
                  </Text>
                </View>

                <View style={styles.optionList}>
                  {[
                    { val: '5 phút', title: '5 phút / ngày', desc: 'Mục tiêu thảnh thơi - Phù hợp cho người bận rộn' },
                    { val: '10 phút', title: '10 phút / ngày', desc: 'Mục tiêu tiêu chuẩn - Tiến bộ vững vàng, đều đặn' },
                    { val: '20 phút', title: '20 phút / ngày', desc: 'Mục tiêu bứt phá - Dành cho người muốn làm chủ nhanh' },
                  ].map((time) => {
                    const isSelected = selectedTime === time.val;
                    return (
                      <TouchableOpacity
                        key={time.val}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                        onPress={() => setSelectedTime(time.val)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.optionEmoji}>⏱️</Text>
                        <View style={styles.optionTextWrapper}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                            {time.title}
                          </Text>
                          <Text style={styles.optionDesc}>{time.desc}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setOnboardingStep(1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary, !selectedTime && { opacity: 0.5 }]}
                    disabled={!selectedTime}
                    onPress={() => setOnboardingStep(3)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalBtnPrimaryText}>Tiếp tục</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {onboardingStep === 3 && (
              <View>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconBox, { backgroundColor: '#EBF2FE' }]}>
                    <Ionicons name="trophy" size={28} color={Colors.info} />
                  </View>
                  <Text style={styles.modalTitle}>Cam kết thiết lập!</Text>
                  <Text style={styles.modalSubtitle}>
                    Mục tiêu luyện tập của bạn đã sẵn sàng được khởi tạo.
                  </Text>
                </View>

                <View style={[styles.newUserCtaCard, { marginHorizontal: 0, marginBottom: 20 }]}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={{ padding: 20, borderRadius: 16 }}
                  >
                    <Text style={{ color: Colors.accentLight, fontWeight: '700', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 }}>
                      CAM KẾT HỌC TẬP
                    </Text>
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18, marginBottom: 6 }}>
                      Khóa học: {selectedInstrument}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 }}>
                      Thời gian: {selectedTime} mỗi ngày.{"\n"}Hệ thống AI sẽ đồng hành và chấm điểm cho bạn từng ngày.
                    </Text>
                  </LinearGradient>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setOnboardingStep(2)}
                    activeOpacity={0.8}
                    disabled={enrolling}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={handleFinishOnboarding}
                    activeOpacity={0.85}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.modalBtnPrimaryText}>Học thử ngay!</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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

  // New CTA & Onboarding Styles
  newUserCtaCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  newUserCtaGradient: {
    padding: 20,
    flexDirection: 'column',
    gap: 16,
  },
  newUserCtaInfo: {
    flex: 1,
  },
  newUserCtaSubtitle: {
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  newUserCtaTitle: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  newUserCtaDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  newUserCtaBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  newUserCtaBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  practiceNowBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  practiceNowBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 26, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0EBE4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionList: {
    marginVertical: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8F2EC',
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#FAFDFB',
  },
  optionItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EBF6F0',
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 14,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  optionTitleSelected: {
    color: Colors.primaryDark,
  },
  optionDesc: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0EBE4',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalBtnPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalBtnSecondary: {
    backgroundColor: '#FFF',
  },
  modalBtnSecondaryText: {
    color: Colors.light.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0EBE4',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});
