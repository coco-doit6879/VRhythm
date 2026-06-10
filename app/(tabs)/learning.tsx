import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const COURSE_CHAPTERS = [
  {
    id: '1',
    number: 'I',
    title: 'Nhập môn & Cơ bản',
    icon: 'layers-outline',
    iconColor: Colors.primary,
    iconBg: '#EBF6F0',
    expanded: true,
    lessons: [
      { id: '1a', title: 'Bài 1: Làm quen với đàn', duration: '10:20', done: true },
      { id: '1b', title: 'Bài 2: Tư thế và cách cầm', duration: '12:45', done: true },
      { id: '1c', title: 'Bài 3: Nốt nhạc cơ bản', duration: '15:40', done: false, current: true },
    ],
  },
  {
    id: '2',
    number: 'II',
    title: 'Kỹ thuật Trung cấp',
    icon: 'star-outline',
    iconColor: Colors.intermediate,
    iconBg: '#FEF3E8',
    expanded: false,
    lessons: [],
  },
  {
    id: '3',
    number: 'III',
    title: 'Biểu diễn Nâng cao',
    icon: 'trophy-outline',
    iconColor: '#7B5EA7',
    iconBg: '#F0EBFA',
    expanded: false,
    lessons: [],
  },
];

export default function LearningScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.3);
  const [expanded, setExpanded] = useState<string[]>(['1']);
  const [note, setNote] = useState('Luyện ngón cái và ngón trỏ thật đều. Nhớ thả lỏng cổ tay khi gảy nốt cao...');

  const toggleChapter = (id: string) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.courseTitle}>Khóa học Đàn Tranh</Text>
            <Text style={styles.courseInstructor}>Giảng viên: Nguyễn Minh Anh</Text>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <LinearGradient
            colors={['#1A3020', '#0D1F17', '#1A2E22']}
            style={styles.videoPlayer}
          >
            <View style={styles.videoOverlay}>
              <Text style={{ fontSize: 80 }}>🎵</Text>
            </View>
            <TouchableOpacity
              style={styles.videoPlayBtn}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFF" />
            </TouchableOpacity>
            {/* Controls bar */}
            <View style={styles.videoControls}>
              <View style={styles.videoProgress}>
                <View style={[styles.videoProgressFill, { width: '37%' }]} />
                <View style={styles.videoProgressThumb} />
              </View>
              <View style={styles.videoControlsRow}>
                <TouchableOpacity>
                  <Ionicons name="pause" size={18} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="play-skip-forward" size={18} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.videoTime}>05:24 / 15:40</Text>
                <TouchableOpacity style={{ marginLeft: 'auto' as any }}>
                  <Ionicons name="text-outline" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="settings-outline" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="expand-outline" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Lesson Info */}
          <Text style={styles.lessonTitle}>Bài 3: Nốt nhạc cơ bản</Text>
          <View style={styles.lessonMeta}>
            <View style={styles.levelBadge}>
              <Ionicons name="bar-chart-outline" size={12} color={Colors.primary} />
              <Text style={styles.levelText}>CƠ BẢN</Text>
            </View>
            <Text style={styles.metaSep}>154 lượt học</Text>
            <Ionicons name="star" size={14} color="#F4A261" />
            <Text style={styles.rating}>4.9</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ học tập</Text>
              <Text style={styles.progressPercent}>45%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: '45%' }]}
              />
            </View>
            <Text style={styles.progressSub}>Hoàn thành 3/7 bài học trong lộ trình này</Text>
          </View>

          {/* Course Chapters */}
          <Text style={styles.sectionTitle}>LỘ TRÌNH HỌC</Text>
          {COURSE_CHAPTERS.map((chapter) => (
            <View key={chapter.id} style={styles.chapterCard}>
              <TouchableOpacity
                style={styles.chapterHeader}
                onPress={() => toggleChapter(chapter.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.chapterIcon, { backgroundColor: chapter.iconBg }]}>
                  <Ionicons name={chapter.icon as any} size={18} color={chapter.iconColor} />
                </View>
                <Text style={styles.chapterTitle}>{chapter.number}. {chapter.title}</Text>
                <Ionicons
                  name={expanded.includes(chapter.id) ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.light.textMuted}
                />
              </TouchableOpacity>

              {expanded.includes(chapter.id) && chapter.lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonRow, lesson.current && styles.lessonRowActive]}
                >
                  {lesson.done ? (
                    <View style={styles.doneBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  ) : lesson.current ? (
                    <View style={styles.currentBadge}>
                      <Ionicons name="play" size={12} color="#FFF" />
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingDot}>•</Text>
                    </View>
                  )}
                  <Text style={[styles.lessonRowTitle, lesson.current && { color: Colors.primary, fontWeight: '700' }]}>
                    {lesson.title}
                  </Text>
                  {lesson.current ? (
                    <Text style={styles.currentLabel}>ĐANG HỌC</Text>
                  ) : (
                    <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* My Notes */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Ghi chú của tôi</Text>
              <TouchableOpacity>
                <Text style={styles.notesEdit}>Sửa</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{note}</Text>
            </View>
            <TouchableOpacity style={styles.saveNotesBtn} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveNotesBtnGradient}
              >
                <Ionicons name="save-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveNotesBtnText}>Lưu ghi chú</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* FABs */}
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="flash" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabBot]}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  courseInstructor: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  moreBtn: { padding: 8 },

  videoContainer: { marginBottom: 0 },
  videoPlayer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoOverlay: { position: 'absolute', opacity: 0.2 },
  videoPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  videoControls: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  videoProgress: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoProgressFill: { height: 3, backgroundColor: Colors.accent, borderRadius: 2 },
  videoProgressThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginLeft: -5,
  },
  videoControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  videoTime: { fontSize: 12, color: '#FFF', marginLeft: 4 },

  content: { padding: 20 },
  lessonTitle: { fontSize: 22, fontWeight: '800', color: Colors.light.text, marginBottom: 10 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  metaSep: { color: Colors.light.textMuted, fontSize: 13 },
  rating: { fontSize: 13, fontWeight: '600', color: Colors.light.text },

  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  progressPercent: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  progressBar: { height: 8, backgroundColor: Colors.light.bgElevated, borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 12, color: Colors.light.textMuted },

  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: Colors.light.textMuted, marginBottom: 14 },

  chapterCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  chapterIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  chapterTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.light.text },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.bgElevated,
  },
  lessonRowActive: { backgroundColor: Colors.light.bgElevated },
  doneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingDot: { color: Colors.light.textMuted, fontSize: 18 },
  lessonRowTitle: { flex: 1, fontSize: 13, color: Colors.light.textSecondary },
  lessonDuration: { fontSize: 12, color: Colors.light.textMuted },
  currentLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },

  notesCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  notesTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  notesEdit: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  notesBox: {
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  notesText: { fontSize: 13, color: Colors.light.textSecondary, lineHeight: 20 },
  saveNotesBtn: { borderRadius: 12, overflow: 'hidden' },
  saveNotesBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveNotesBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabBot: {
    bottom: 80,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
});
