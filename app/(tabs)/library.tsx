import { Text, TextInput } from '../../ui/Typography';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Theme } from '../../constants/Theme';
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
    iconColor: Colors.warning,
    iconBg: Colors.warningBg,
  },
  {
    id: '2',
    title: 'Senbonzakura',
    genre: 'Nhạc Nhật Bản',
    instrument: 'Sáo trúc',
    level: 'Nâng cao',
    levelColor: Colors.advanced,
    icon: 'musical-notes-outline',
    iconColor: Colors.danger,
    iconBg: Colors.dangerBg,
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
    iconBg: Colors.successBg,
  },
  {
    id: '4',
    title: 'Lạc Trôi',
    genre: 'Nhạc trẻ',
    instrument: 'Sáo trúc',
    level: 'Trung cấp',
    levelColor: Colors.intermediate,
    icon: 'flame-outline',
    iconColor: Colors.warning,
    iconBg: Colors.warningBg,
  },
];

const INSTRUMENT_FILTERS = ['Tất cả', 'Đàn Tranh', 'Đàn Nguyệt', 'Sáo Trúc'];
const GENRE_FILTERS = [...new Set(SONGS.map(song => song.genre))];

export default function LibraryScreen() {
  const [activeInstrument, setActiveInstrument] = useState('Tất cả');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = SONGS.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          song.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          song.instrument.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInstrument = activeInstrument === 'Tất cả' || song.instrument.toLowerCase().includes(activeInstrument.toLowerCase());
    const matchesGenre = activeGenre === 'Tất cả' || song.genre.toLowerCase().includes(activeGenre.toLowerCase());
    return matchesSearch && matchesInstrument && matchesGenre;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ width: "100%", maxWidth: 760, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Thư viện bản nhạc" subtitle="Tìm giai điệu để bắt đầu buổi luyện tập." />
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={Colors.light.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            accessibilityLabel="Tìm bản nhạc"
            placeholder="Tìm tên bài hoặc nhạc cụ..."
            placeholderTextColor={Colors.light.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" style={Theme.iconButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity accessibilityRole="button" style={styles.filterDropdown}
            onPress={() => {
              const idx = INSTRUMENT_FILTERS.indexOf(activeInstrument);
              const next = INSTRUMENT_FILTERS[(idx + 1) % INSTRUMENT_FILTERS.length];
              setActiveInstrument(next);
            }}
          >
            <Text style={styles.filterLabel}>Nhạc cụ: </Text>
            <Text style={styles.filterValue}>{activeInstrument}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.filterDropdown}
            onPress={() => {
              const filters = ['Tất cả', ...GENRE_FILTERS];
              const idx = filters.indexOf(activeGenre);
              const next = filters[(idx + 1) % filters.length];
              setActiveGenre(next);
            }}
          >
            <Text style={styles.filterLabel}>Thể loại: </Text>
            <Text style={styles.filterValue}>{activeGenre}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestSection}>
          <Text style={styles.suggestTitle}>Bản nhạc ({filteredSongs.length})</Text>
          {filteredSongs.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Ionicons name="musical-notes-outline" size={40} color={Colors.light.textMuted} />
              <Text style={{ marginTop: 8, color: Colors.light.textMuted }}>Không tìm thấy bản nhạc nào phù hợp.</Text>
            </View>
          ) : (
            filteredSongs.map((song) => (
              <TouchableOpacity accessibilityRole="button" key={song.id}
                style={styles.songRow}
                activeOpacity={0.7}
                onPress={() => router.push(`/sheet-music/${song.id}` as any)}
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
                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            ))
          )}
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
    width: 48,
    minHeight: 52,
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
    backgroundColor: Colors.light.bgCard,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.light.text },

  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  filterDropdown: {
    minHeight: 48,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.bgCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterLabel: { fontSize: 13, color: Colors.light.textMuted },
  filterValue: { fontSize: 13, fontWeight: '600', color: Colors.light.text },


  suggestSection: { paddingHorizontal: 20 },
  suggestTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.textMuted, marginBottom: 14 },
  songRow: {
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  songIconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  songInfo: { flex: 1, minWidth: 140 },
  songTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 3 },
  songMeta: { fontSize: 12, color: Colors.light.textMuted },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: '700' },
  moreBtn: { padding: 4 },
});
