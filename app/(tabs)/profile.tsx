import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { storage } from '../../services/api-storage';

const MENU_ITEMS = [
  { id: '1', icon: 'star', label: 'Yêu thích của tôi', color: '#E63946', bg: '#FDE8EA' },
  { id: '2', icon: 'earth', label: 'Bản thu âm', color: '#4895EF', bg: '#EBF2FE' },
  { id: '4', icon: 'person', label: 'Cài đặt', color: '#9CB8A8', bg: '#F5F7F5' },
  { id: '5', icon: 'people', label: 'Hỗ trợ & Phản hồi', color: '#7B5EA7', bg: '#F0EBFA' },
];

export default function ProfileScreen() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseInstrument, setCourseInstrument] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [dailyGoal, setDailyGoal] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchProgress = async () => {
        setLoadingProgress(true);
        try {
          const timeGoal = storage.getItem('onboardingTime') || '';
          setDailyGoal(timeGoal);

          const courseId = api.getCurrentCourseId();
          if (courseId) {
            const res = await api.getCourseDetail(courseId);
            if (res.success && res.data) {
              const detail = res.data;
              setCourseTitle(detail.title || '');
              setCourseInstrument(detail.instrument || '');

              const total = detail.chapters?.reduce(
                (acc, ch) => acc + (ch.lessons?.length || 0), 0
              ) || 0;
              const completed = detail.chapters?.reduce(
                (acc, ch) => acc + (ch.lessons?.filter(l => l.isCompleted).length || 0), 0
              ) || 0;
              setTotalLessons(total);
              setCompletedLessons(completed);
              setProgressPercent(total > 0 ? Math.round((completed / total) * 100) : 0);
            }
          }
        } catch (e) {
          console.error('Error fetching profile progress:', e);
        } finally {
          setLoadingProgress(false);
        }
      };
      fetchProgress();
    }, [])
  );

  const handleLogout = () => {
    api.logout();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#0A1A12', '#0D2318', '#1A3020']} style={styles.gradient}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hồ sơ</Text>
            <TouchableOpacity style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Avatar & Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>Lê Minh Anh</Text>
            <Text style={styles.profileEmail}>minhanh.le@vrhythm.vn</Text>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: Colors.accent }]}>12</Text>
              <Text style={styles.statLabel}>BÀI HÁT</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: Colors.warning }]}>48</Text>
              <Text style={styles.statLabel}>GIỜ HỌC</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: Colors.purple }]}>Lv.8</Text>
              <Text style={styles.statLabel}>CẤP ĐỘ</Text>
            </View>
          </View>

          {/* ===== Learning Progress Card (inline with homepage) ===== */}
          <View style={styles.progressSection}>
            <Text style={styles.progressSectionTitle}>Tiến độ học tập hiện tại</Text>
            {loadingProgress ? (
              <View style={styles.progressCardLoading}>
                <ActivityIndicator size="small" color={Colors.accent} />
              </View>
            ) : totalLessons > 0 ? (
              <TouchableOpacity
                style={styles.progressCard}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/learning')}
              >
                <View style={styles.progressCardHeader}>
                  <View style={styles.progressCourseInfo}>
                    <Text style={styles.progressCourseTitle} numberOfLines={1}>
                      {courseTitle || 'Khóa học của bạn'}
                    </Text>
                    <Text style={styles.progressCourseMeta}>
                      {courseInstrument ? `${courseInstrument} • ` : ''}{completedLessons}/{totalLessons} bài
                      {dailyGoal ? ` • Mục tiêu: ${dailyGoal}/ngày` : ''}
                    </Text>
                  </View>
                  <View style={styles.progressPercentCircle}>
                    <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                  />
                </View>

                {/* Milestones */}
                <View style={styles.progressMilestones}>
                  <View style={styles.progressMilestone}>
                    <View style={[styles.milestoneDot, progressPercent >= 25 && styles.milestoneDotActive]} />
                    <Text style={[styles.milestoneText, progressPercent >= 25 && styles.milestoneTextActive]}>25%</Text>
                  </View>
                  <View style={styles.progressMilestone}>
                    <View style={[styles.milestoneDot, progressPercent >= 50 && styles.milestoneDotActive]} />
                    <Text style={[styles.milestoneText, progressPercent >= 50 && styles.milestoneTextActive]}>50%</Text>
                  </View>
                  <View style={styles.progressMilestone}>
                    <View style={[styles.milestoneDot, progressPercent >= 75 && styles.milestoneDotActive]} />
                    <Text style={[styles.milestoneText, progressPercent >= 75 && styles.milestoneTextActive]}>75%</Text>
                  </View>
                  <View style={styles.progressMilestone}>
                    <View style={[styles.milestoneDot, progressPercent >= 100 && styles.milestoneDotActive]} />
                    <Text style={[styles.milestoneText, progressPercent >= 100 && styles.milestoneTextActive]}>100%</Text>
                  </View>
                </View>

                <View style={styles.progressCta}>
                  <Text style={styles.progressCtaText}>Tiếp tục học tập</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.progressCardEmpty}>
                <Ionicons name="school-outline" size={24} color={Colors.dark.textMuted} />
                <Text style={styles.progressCardEmptyText}>
                  Bạn chưa bắt đầu khóa học nào. Hãy khám phá từ Trang chủ!
                </Text>
              </View>
            )}
          </View>

          {/* ===== Subscription Plan Card ===== */}
          <View style={styles.planSection}>
            <TouchableOpacity style={styles.planCard} activeOpacity={0.85}>
              <LinearGradient
                colors={['rgba(244,162,97,0.15)', 'rgba(244,162,97,0.05)']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planIconBox}>
                    <Ionicons name="diamond" size={20} color={Colors.warning} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>Gói đăng ký</Text>
                    <Text style={styles.planStatus}>Gói Miễn phí</Text>
                  </View>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>FREE</Text>
                  </View>
                </View>

                {/* Plan usage bar */}
                <View style={styles.planUsage}>
                  <View style={styles.planUsageHeader}>
                    <Text style={styles.planUsageLabel}>Lượt chấm điểm AI còn lại</Text>
                    <Text style={styles.planUsageValue}>3/5 lượt</Text>
                  </View>
                  <View style={styles.planUsageBarBg}>
                    <View style={[styles.planUsageBarFill, { width: '60%' }]} />
                  </View>
                </View>

                <View style={styles.planUpgrade}>
                  <Text style={styles.planUpgradeText}>Nâng cấp PRO để mở khóa toàn bộ tính năng</Text>
                  <View style={styles.planUpgradeBtn}>
                    <Ionicons name="rocket" size={14} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.planUpgradeBtnText}>Nâng cấp</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Menu */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, idx) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} style={{ marginLeft: 'auto' as any }} />
                </TouchableOpacity>
                {idx < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutIcon}>
              <Ionicons name="exit-outline" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  blobTopRight: {
    position: 'absolute',
    top: -50,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(123,94,167,0.12)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(64,145,108,0.1)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  profileSection: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  avatarWrapper: { marginBottom: 14, position: 'relative' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primarySoft,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A1A12',
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  profileEmail: { fontSize: 14, color: Colors.dark.textMuted, marginBottom: 18 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNum: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.dark.textMuted, letterSpacing: 1 },

  // ===== Learning Progress =====
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  progressSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  progressCardLoading: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressCourseInfo: {
    flex: 1,
    marginRight: 12,
  },
  progressCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  progressCourseMeta: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    lineHeight: 17,
  },
  progressPercentCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(116,198,157,0.15)',
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.accent,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressMilestone: {
    alignItems: 'center',
    gap: 4,
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  milestoneDotActive: {
    backgroundColor: Colors.accent,
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  milestoneTextActive: {
    color: Colors.accent,
  },
  progressCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(116,198,157,0.12)',
    borderRadius: 10,
    paddingVertical: 10,
  },
  progressCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  progressCardEmpty: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressCardEmptyText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ===== Subscription Plan =====
  planSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244,162,97,0.2)',
  },
  planGradient: {
    padding: 18,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  planIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  planStatus: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
  },
  planUsage: {
    marginBottom: 14,
  },
  planUsageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planUsageLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  planUsageValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
  planUsageBarBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  planUsageBarFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 3,
  },
  planUpgrade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  planUpgradeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textMuted,
    lineHeight: 17,
  },
  planUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  planUpgradeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ===== Menu =====
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, color: Colors.dark.text, fontWeight: '500', flex: 1 },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 68 },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230,57,70,0.1)',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.2)',
  },
  logoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(230,57,70,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
