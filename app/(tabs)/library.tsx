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

const { width } = Dimensions.get('window');

const SONGS = [
  {
    id: '1',
    title: 'Áo mới Cà Mau',
    genre: 'Dân ca',
    instrument: 'Đàn Nguyệt',
    level: 'Trung cấp',
    levelColor: Colors.intermediate,
    icon: 'musical-note-outline',
    iconColor: Colors.primary,
    iconBg: '#EBF6F0',
  },
  {
    id: '2',
    title: 'Hòa tấu quê hương',
    genre: 'Hòa tấu',
    instrument: 'Sáo trúc',
    level: 'Nâng cao',
    levelColor: Colors.advanced,
    icon: 'radio-button-on-outline',
    iconColor: Colors.intermediate,
    iconBg: '#FEF3E8',
  },
  {
    id: '3',
    title: 'Em ơi Hà Nội phố',
    genre: 'Nhạc nhẹ',
    instrument: 'Đàn Tranh',
    level: 'Trung cấp',
    levelColor: Colors.intermediate,
    icon: 'mic-outline',
    iconColor: '#4895EF',
    iconBg: '#EBF2FE',
  },
];

const INSTRUMENT_FILTERS = ['Tất cả', 'Đàn Tranh', 'Đàn Nguyệt', 'Sáo Trúc'];
const GENRE_FILTERS = ['Dân gian', 'Cổ điển', 'Hiện đại'];

export default function LibraryScreen() {
  const [activeInstrument, setActiveInstrument] = useState('Tất cả');
  const [activeGenre, setActiveGenre] = useState('Dân gian');
  const [tab, setTab] = useState('Bản nhạc');
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadLeft, setPlayheadLeft] = useState(30);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadLeft((prev) => {
          const next = prev + 3;
          return next > 250 ? 30 : next;
        });
      }, 60);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

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

        {/* Featured Sheet Music Player */}
        <View style={styles.playerCard}>
          {/* Song Info */}
          <View style={styles.playerHeader}>
            <View>
              <Text style={styles.playerTitle}>Lý ngựa ô</Text>
              <Text style={styles.playerMeta}>Dân ca Nam Bộ • Đàn tranh</Text>
            </View>
            <View style={styles.playerActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-outline" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sheet Music Preview */}
          <View style={styles.sheetMusicPreview}>
            <View style={styles.staffLines}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.staffLine} />
              ))}
              {/* Decorative notes */}
              <View style={[styles.noteHead, { bottom: 32, left: 30 }]} />
              <View style={[styles.noteHead, { bottom: 48, left: 80 }]} />
              <View style={[styles.noteHead, { bottom: 56, left: 130 }]} />
              <View style={[styles.noteHead, { bottom: 40, left: 180 }]} />
              <View style={[styles.noteHead, { bottom: 64, left: 220 }]} />
              <View style={[styles.noteStem, { bottom: 40, left: 35 }]} />
              <View style={[styles.noteStem, { bottom: 56, left: 85 }]} />
            </View>
            {/* Active bar indicator */}
            <View style={[styles.activeBar, { left: playheadLeft }]} />
          </View>

          {/* Player Controls */}
          <View style={styles.playerControls}>
            <TouchableOpacity
              style={[styles.playBtn, isPlaying && styles.playBtnActive]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.bpmControl}>
              <Ionicons name="sync-outline" size={14} color={Colors.primary} />
              <Text style={styles.bpmText}>{bpm} BPM</Text>
            </View>
            <View style={styles.autoScrollRow}>
              <Text style={styles.autoScrollLabel}>TỰ ĐỘNG CUỘN</Text>
              <View style={styles.toggle}>
                <View style={styles.toggleThumb} />
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {['Bản nhạc', 'Hợp âm', 'Video mẫu'].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabItem, tab === t && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestSection}>
          <Text style={styles.suggestTitle}>DANH SÁCH GỢI Ý</Text>
          {SONGS.map((song) => (
            <TouchableOpacity key={song.id} style={styles.songRow} activeOpacity={0.7}>
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

  playerCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  playerTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  playerMeta: { fontSize: 13, color: Colors.light.textMuted },
  playerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheetMusicPreview: {
    height: 100,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  staffLines: { position: 'relative', height: 70 },
  staffLine: { height: 1, backgroundColor: '#CCCCCC', marginBottom: 12 },
  noteHead: {
    position: 'absolute',
    width: 10,
    height: 8,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  noteStem: {
    position: 'absolute',
    width: 1.5,
    height: 24,
    backgroundColor: Colors.primary,
  },
  activeBar: {
    position: 'absolute',
    left: 45,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: Colors.primaryLight,
  },

  playerControls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: { backgroundColor: Colors.primary },
  bpmControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bpmText: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  autoScrollRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' as any },
  autoScrollLabel: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.5 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 3,
    alignItems: 'flex-end',
  },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },

  tabsRow: { flexDirection: 'row', gap: 0 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.light.textMuted },
  tabTextActive: { color: '#FFF', fontWeight: '700' },

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
