import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const POSTS = [
  {
    id: '1',
    user: 'Minh Anh',
    time: '2 giờ trước',
    content: 'Thật không thể tin được! Cuối cùng mình cũng đạt được 95/100 điểm cho bài "Lưu Thủy Kim Tiền" trên Đàn Tranh. Công cụ AI Scoring của VRhythm thực sự giúp mình nhận ra lỗi nhịp ở đoạn cao trào. 🎵',
    likes: 124,
    comments: 18,
    tag: 'AI Scoring',
    tagColor: Colors.info,
  },
  {
    id: '2',
    user: 'Thầy Hữu Đức',
    time: '5 giờ trước',
    content: 'Mẹo nhỏ cho các bạn mới học Sáo Trúc: Để âm thanh thanh thoát hơn ở các nốt cao, hãy chú ý đến độ mở của môi và hướng luồng hơi. Đừng cố thổi quá mạnh, hãy để hơi thở đi thật tự nhiên từ bụng.',
    likes: 89,
    comments: 32,
    tags: ['Sáo Trúc', 'Tips'],
    tag: 'Sáo Trúc',
    tagColor: Colors.advanced,
  },
  {
    id: '3',
    user: 'Thanh Lam',
    time: '1 ngày trước',
    content: 'Hoàn thành 30 ngày liên tiếp luyện tập trên VRhythm! Cảm ơn cộng đồng đã luôn truyền cảm hứng. Từ một người chưa biết gì về âm nhạc truyền thống, giờ mình đã có thể tự tin biểu diễn vài bài cơ bản cho gia đình rồi. ❤️',
    likes: 256,
    comments: 45,
    tag: 'Đàn Tranh',
    tagColor: Colors.basic,
  },
];

const CHALLENGES = [
  {
    id: '1',
    title: 'Tuần lễ Đàn Tranh',
    desc: 'Gảy bài "Lý Ngựa Ô" và đạt 80+ điểm AI',
    participants: 128,
    daysLeft: 3,
    icon: '🎵',
    gradient: [Colors.primary, Colors.primaryDark] as [string, string],
  },
  {
    id: '2',
    title: 'Thử thách 7 ngày',
    desc: 'Luyện tập liên tục 7 ngày không gián đoạn',
    participants: 342,
    daysLeft: 5,
    icon: '🔥',
    gradient: ['#F4A261', '#E76F51'] as [string, string],
  },
  {
    id: '3',
    title: 'Cao thủ Sáo Trúc',
    desc: 'Hoàn thành 5 bài thực hành Sáo Trúc',
    participants: 67,
    daysLeft: 7,
    icon: '🎶',
    gradient: [Colors.info, '#3A7BD5'] as [string, string],
  },
];

export default function CommunityScreen() {
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const handleSharePost = (postId: string) => {
    setActivePostId(postId);
    setShareModalVisible(true);
  };

  const handleShareTo = (platform: string) => {
    setShareModalVisible(false);
    Alert.alert('Chia sẻ', `Đang mở chia sẻ đến ${platform}...`);
  };

  const handleJoinChallenge = (challengeTitle: string) => {
    Alert.alert('Tham gia thử thách!', `Bạn đã đăng ký tham gia thử thách "${challengeTitle}". Hãy bắt đầu luyện tập ngay!`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
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
            <Text style={styles.statLabel}>THÀNH VIÊN</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.onlineDot} />
            <Text style={styles.statNum}>184</Text>
            <Text style={styles.statLabel}>ONLINE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>6.8K</Text>
            <Text style={styles.statLabel}>BÀI ĐĂNG</Text>
          </View>
        </View>

        {/* ===== Challenges Section ===== */}
        <View style={styles.challengeSection}>
          <View style={styles.challengeSectionHeader}>
            <View style={styles.challengeTitleRow}>
              <Ionicons name="flame" size={20} color="#F4A261" />
              <Text style={styles.challengeSectionTitle}>Thử thách cộng đồng</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.challengeScroll}
          >
            {CHALLENGES.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={styles.challengeCard}
                activeOpacity={0.85}
                onPress={() => handleJoinChallenge(challenge.title)}
              >
                <LinearGradient
                  colors={challenge.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.challengeGradient}
                >
                  <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDesc} numberOfLines={2}>{challenge.desc}</Text>
                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeStat}>
                      <Ionicons name="people" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.challengeStatText}>{challenge.participants}</Text>
                    </View>
                    <View style={styles.challengeBadge}>
                      <Text style={styles.challengeBadgeText}>Còn {challenge.daysLeft} ngày</Text>
                    </View>
                  </View>
                  <View style={styles.joinBtnWrapper}>
                    <Text style={styles.joinBtnText}>Tham gia ngay</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* Create Challenge Card */}
            <TouchableOpacity style={styles.createChallengeCard} activeOpacity={0.8}>
              <View style={styles.createChallengeIcon}>
                <Ionicons name="add-circle" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.createChallengeTitle}>Tạo thử thách</Text>
              <Text style={styles.createChallengeDesc}>Thách đấu bạn bè và cộng đồng!</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ===== Posts Section ===== */}
        <View style={styles.postsSection}>
          <Text style={styles.postsSectionTitle}>Bài viết nổi bật</Text>
          {POSTS.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>
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
                <TouchableOpacity
                  style={styles.sharePostBtn}
                  onPress={() => handleSharePost(post.id)}
                >
                  <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
                  <Text style={styles.sharePostBtnText}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== Share Modal ===== */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.shareOverlay}
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}
        >
          <View style={styles.shareSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.shareHandle} />
            <Text style={styles.shareSheetTitle}>Chia sẻ bài viết</Text>
            <Text style={styles.shareSheetSubtitle}>
              Khoe bài viết này với bạn bè trên mạng xã hội
            </Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareTo('Facebook')}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#EBF2FE' }]}>
                  <FontAwesome name="facebook" size={24} color="#1877F2" />
                </View>
                <Text style={styles.shareOptionLabel}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareTo('Zalo')}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#EBF6F0' }]}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#0068FF" />
                </View>
                <Text style={styles.shareOptionLabel}>Zalo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareTo('Instagram')}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#FEF3E8' }]}>
                  <FontAwesome name="instagram" size={24} color="#E1306C" />
                </View>
                <Text style={styles.shareOptionLabel}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareTo('Copy link')}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#F0EBFA' }]}>
                  <Ionicons name="link" size={24} color={Colors.purple} />
                </View>
                <Text style={styles.shareOptionLabel}>Copy link</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.shareCancelBtn}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.shareCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
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
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.light.textMuted, letterSpacing: 0.8 },
  statDivider: { width: 1, backgroundColor: Colors.light.border, marginVertical: 4 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    position: 'absolute',
    top: 2,
    right: 24,
  },

  // ===== Challenges =====
  challengeSection: {
    marginBottom: 24,
  },
  challengeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  challengeScroll: {
    paddingLeft: 20,
    paddingRight: 6,
    gap: 12,
  },
  challengeCard: {
    width: width * 0.55,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  challengeGradient: {
    padding: 16,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  challengeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 17,
    marginBottom: 10,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  challengeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  challengeBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  joinBtnWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  createChallengeCard: {
    width: width * 0.38,
    borderRadius: 18,
    backgroundColor: '#FFF',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary + '50',
    minHeight: 180,
  },
  createChallengeIcon: {
    marginBottom: 4,
  },
  createChallengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  createChallengeDesc: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },

  // ===== Posts =====
  postsSection: { paddingHorizontal: 20, gap: 14 },
  postsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
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
  postAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark },
  postMeta: { flex: 1 },
  postUser: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  postTime: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  postTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  postTagText: { fontSize: 11, fontWeight: '700' },
  postContent: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20, marginBottom: 14 },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.bgElevated,
    paddingTop: 12,
  },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postActionText: { fontSize: 13, color: Colors.light.textMuted },
  sharePostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sharePostBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ===== Share Modal =====
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 26, 18, 0.5)',
    justifyContent: 'flex-end',
  },
  shareSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  shareHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0EBE4',
    alignSelf: 'center',
    marginBottom: 20,
  },
  shareSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  shareSheetSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  shareCancelBtn: {
    backgroundColor: Colors.light.bgElevated,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
});
