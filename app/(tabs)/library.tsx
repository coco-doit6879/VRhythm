import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const SONGS = [
  {
    id: '1',
    title: 'Twinkle Twinkle Little Star',
    genre: 'Nhạc Thiếu Nhi',
    instrument: 'Sáo trúc',
    level: 'Sơ cấp',
    levelColor: Colors.success,
    icon: 'star-outline',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  {
    id: '2',
    title: 'Senbonzakura',
    genre: 'Nhạc Nhật Bản',
    instrument: 'Sáo trúc',
    level: 'Nâng cao',
    levelColor: Colors.advanced,
    icon: 'musical-notes-outline',
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
  },
  {
    id: '3',
    title: 'Lý Cây Xanh',
    genre: 'Dân ca',
    instrument: 'Sáo trúc',
    level: 'Sơ cấp',
    levelColor: Colors.success,
    icon: 'leaf-outline',
    iconColor: Colors.primary,
    iconBg: '#EBF6F0',
  },
  {
    id: '4',
    title: 'Lạc Trôi',
    genre: 'Nhạc trẻ',
    instrument: 'Sáo trúc',
    level: 'Trung cấp',
    levelColor: Colors.intermediate,
    icon: 'flame-outline',
    iconColor: '#F97316',
    iconBg: '#FFEDD5',
  },
];

const INSTRUMENT_FILTERS = ['Tất cả', 'Đàn Tranh', 'Đàn Nguyệt', 'Sáo Trúc'];
const GENRE_FILTERS = ['Dân gian', 'Cổ điển', 'Hiện đại'];

export default function LibraryScreen() {
  const [activeInstrument, setActiveInstrument] = useState('Tất cả');
  const [activeGenre, setActiveGenre] = useState('Dân gian');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư viện bản nhạc</Text>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={Colors.light.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Tìm kiếm bài hát, tác giả..."
            placeholderTextColor={Colors.light.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Nhạc cụ: </Text>
            <Text style={styles.filterValue}>Tất cả</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Thể loại: </Text>
            <Text style={styles.filterValue}>Dân gian</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestSection}>
          <Text style={styles.suggestTitle}>BẢN NHẠC NỔI BẬT</Text>
          {SONGS.map((song) => (
            <TouchableOpacity 
              key={song.id} 
              style={styles.songRow} 
              activeOpacity={0.7}
              onPress={() => router.push(`/sheet-music/${song.id}`)}
            >
              <View style={[styles.songIconWrapper, { backgroundColor: song.iconBg }]}>
                <Ionicons name={song.icon as any} size={20} color={song.iconColor} />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songMeta}>{song.genre} • {song.instrument}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: song.levelColor + '20' }]}>
                <Text style={[styles.levelText, { color: song.levelColor }]}>{song.level}</Text>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={18} color={Colors.light.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.text },
  bookmarkBtn: { padding: 8 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.light.text },

  filtersRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterLabel: { fontSize: 13, color: Colors.light.textMuted },
  filterValue: { fontSize: 13, fontWeight: '600', color: Colors.light.text },


  suggestSection: { paddingHorizontal: 20 },
  suggestTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, color: Colors.light.textMuted, marginBottom: 14 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  songIconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 3 },
  songMeta: { fontSize: 12, color: Colors.light.textMuted },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: '700' },
  moreBtn: { padding: 4 },
});
