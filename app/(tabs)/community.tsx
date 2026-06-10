import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const POSTS = [
  {
    id: '1',
    user: 'Nguyễn Hồng Anh',
    time: '2 giờ trước',
    content: 'Sau 3 tháng tự học, mình đã chơi được bài Lý Ngựa Ô rồi! 🎵 Cảm ơn cộng đồng VRhythm đã hỗ trợ mình rất nhiều!',
    likes: 42,
    comments: 8,
    tag: 'Đàn Tranh',
    tagColor: Colors.basic,
  },
  {
    id: '2',
    user: 'Trần Minh Khoa',
    time: '5 giờ trước',
    content: 'Ai có kinh nghiệm về Sáo Trúc không? Mình đang học nhưng gặp khó khăn với kỹ thuật rung hơi. Mọi người có thể chia sẻ tips không?',
    likes: 15,
    comments: 12,
    tag: 'Sáo Trúc',
    tagColor: Colors.advanced,
  },
  {
    id: '3',
    user: 'Lê Thu Hương',
    time: 'Hôm qua',
    content: 'Vừa đạt điểm 95/100 trên bài kiểm tra AI! 🔥 Cảm giác tiến bộ thật sự rất thỏa mãn. Mọi người cùng cố lên nhé!',
    likes: 87,
    comments: 24,
    tag: 'AI Scoring',
    tagColor: Colors.info,
  },
];

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cộng đồng</Text>
          <TouchableOpacity style={styles.postBtn}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.postBtnText}>Đăng bài</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>2.4K</Text>
            <Text style={styles.statLabel}>Thành viên</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>184</Text>
            <Text style={styles.statLabel}>Đang online</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>6.8K</Text>
            <Text style={styles.statLabel}>Bài đăng</Text>
          </View>
        </View>

        {/* Posts */}
        <View style={styles.postsSection}>
          {POSTS.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={{ fontSize: 16 }}>
                    {post.user.charAt(0)}
                  </Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <View style={[styles.postTag, { backgroundColor: post.tagColor + '20' }]}>
                  <Text style={[styles.postTagText, { color: post.tagColor }]}>{post.tag}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction}>
                  <Ionicons name="heart-outline" size={18} color={Colors.light.textMuted} />
                  <Text style={styles.postActionText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Ionicons name="chatbubble-outline" size={18} color={Colors.light.textMuted} />
                  <Text style={styles.postActionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Ionicons name="share-social-outline" size={18} color={Colors.light.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.light.text },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  postBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.light.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.light.border, marginVertical: 4 },

  postsSection: { paddingHorizontal: 20, gap: 14 },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postMeta: { flex: 1 },
  postUser: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  postTime: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  postTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  postTagText: { fontSize: 11, fontWeight: '700' },
  postContent: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20, marginBottom: 14 },
  postActions: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: Colors.light.bgElevated, paddingTop: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postActionText: { fontSize: 13, color: Colors.light.textMuted },
});
