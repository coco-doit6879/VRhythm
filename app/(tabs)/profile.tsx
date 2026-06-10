import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const MENU_ITEMS = [
  { id: '1', icon: 'star', label: 'Yêu thích của tôi', color: '#E63946', bg: '#FDE8EA' },
  { id: '2', icon: 'earth', label: 'Bản thu âm', color: '#4895EF', bg: '#EBF2FE' },
  { id: '3', icon: 'diamond', label: 'Gói đăng ký', color: '#F4A261', bg: '#FEF3E8', badge: 'PRO' },
  { id: '4', icon: 'person', label: 'Cài đặt', color: '#9CB8A8', bg: '#F5F7F5' },
  { id: '5', icon: 'people', label: 'Hỗ trợ & Phản hồi', color: '#7B5EA7', bg: '#F0EBFA' },
];

export default function ProfileScreen() {
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

          {/* Menu */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, idx) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} style={{ marginLeft: 'auto' as any }} />
                </TouchableOpacity>
                {idx < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutCard} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
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
  proBadge: {
    backgroundColor: Colors.warning + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.warning },
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
