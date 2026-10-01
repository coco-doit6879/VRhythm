import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Text } from '../../ui/Typography';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { api, UserProfileDto } from '../../services/api';
import { storage } from '../../services/api-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [course, setCourse] = useState('');
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.getProfile();
      if (!response.success) throw new Error(response.message || 'Không thể tải hồ sơ.');
      setProfile(response.data);
      const courseId = api.getCurrentCourseId();
      if (courseId) {
        const response = await api.getCourseDetail(courseId);
        if (response.success) {
          const lessons = response.data.chapters?.flatMap(ch => ch.lessons || []) || [];
          setCourse(response.data.title || 'Khóa học của bạn');
          setTotal(lessons.length); setCompleted(lessons.filter(l => l.isCompleted).length);
        }
      } else { setCourse(''); setTotal(0); setCompleted(0); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const percent = total ? Math.round(completed / total * 100) : 0;
  return <SafeAreaView style={Theme.screen} edges={['top']}>
    <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 32 }}>
      <ScreenHeader title="Hồ sơ của bạn" subtitle="Hành trình âm nhạc, theo nhịp riêng." />
      <View style={styles.content}>
        {loading && <ActivityIndicator color={Colors.primary} style={{ padding: 20 }} />}
        {!!error && <View style={Theme.panel}><Text accessibilityRole="alert" style={{ color: Colors.danger }}>{error}</Text><TouchableOpacity accessibilityRole="button" style={styles.link} onPress={load}><Text style={styles.linkText}>Thử lại</Text></TouchableOpacity></View>}
        <LinearGradient colors={Theme.panelGradient} style={styles.identity}>
          <View style={styles.avatar}><Ionicons name="person-outline" size={32} color={Colors.primary} /></View>
          <Text style={styles.name}>{profile?.fullName || 'Học viên VRhythm'}</Text>
          {!!profile?.email && <Text style={Theme.body}>{profile.email}</Text>}
        </LinearGradient>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.number}>{completed}</Text><Text style={styles.meta}>Bài hoàn thành</Text></View>
          <View style={styles.stat}><Text style={styles.number}>{total}</Text><Text style={styles.meta}>Bài trong khóa</Text></View>
          <View style={styles.stat}><Text style={styles.number}>{percent}%</Text><Text style={styles.meta}>Tiến độ</Text></View>
        </View>
        <Text accessibilityRole="header" style={styles.heading}>Đang học</Text>
        <View style={Theme.panel}>
          <Text style={styles.courseTitle}>{course || 'Chọn khóa học đầu tiên'}</Text>
          <Text style={[Theme.body, { marginTop: 8 }]}>{course ? `Đã hoàn thành ${completed}/${total} bài học.` : 'Khám phá nhạc cụ và tìm khóa học phù hợp với bạn.'}</Text>
          {total > 0 && <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View>}
          <TouchableOpacity accessibilityRole="button" style={[Theme.button, { marginTop: 20 }]} onPress={() => router.push(course ? '/(tabs)/learning' : '/(tabs)')}><Text style={Theme.buttonText}>{course ? 'Tiếp tục học' : 'Khám phá khóa học'}</Text></TouchableOpacity>
        </View>
        <Text accessibilityRole="header" style={styles.heading}>Mục tiêu mỗi ngày</Text>
        <View style={styles.goal}><Ionicons name="time-outline" color={Colors.accent} size={24} /><Text style={{ flex: 1 }}>{storage.getItem('onboardingTime') || 'Chưa thiết lập'}</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)')} style={styles.link}><Text style={styles.linkText}>Thay đổi</Text></TouchableOpacity></View>
        <TouchableOpacity accessibilityRole="button" style={styles.logout} onPress={async () => { try { await api.logout(); router.replace('/(auth)/login'); } catch { setError('Chưa xóa được phiên trên thiết bị. Vui lòng thử đăng xuất lại.'); } }}><Ionicons name="log-out-outline" color={Colors.danger} size={22} /><Text style={{ color: Colors.danger, fontWeight: '600' }}>Đăng xuất</Text></TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 }, identity: { padding: 24, borderRadius: 14, gap: 12, alignItems: 'flex-start' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.light.bgCard, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, lineHeight: 34, fontWeight: '700' }, stats: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: Colors.light.border, paddingVertical: 24, gap: 12 },
  stat: { flex: 1, minWidth: 85 }, number: { fontSize: 28, fontWeight: '700', color: Colors.primary }, meta: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginTop: 32, marginBottom: 16 }, courseTitle: { fontSize: 18, fontWeight: '600', lineHeight: 28 },
  track: { height: 6, backgroundColor: Colors.selected, marginTop: 16, borderRadius: 3 }, fill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border, paddingBottom: 16 },
  link: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 }, linkText: { color: Colors.primary, fontWeight: '600' },
  logout: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: Colors.danger, borderRadius: 8, marginTop: 32 },
});
