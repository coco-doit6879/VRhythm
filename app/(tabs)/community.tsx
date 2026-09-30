import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Text } from '../../ui/Typography';
import { ScreenHeader } from '../../ui/ScreenHeader';

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


export default function CommunityScreen() {
  return <SafeAreaView style={Theme.screen} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Cộng đồng" subtitle="Cùng chia sẻ niềm yêu âm nhạc dân tộc." />
      <View style={styles.body}>
        <View style={Theme.panel}>
          <Text style={styles.noticeTitle}>Không gian chia sẻ đang được xây dựng</Text>
          <Text style={Theme.body}>Các bài viết bên dưới là nội dung minh họa. Đăng bài, bình luận và thử thách sẽ được mở khi cộng đồng sẵn sàng.</Text>
          <TouchableOpacity accessibilityRole="button" style={[Theme.button, { marginTop: 20 }]} onPress={() => router.push('/(tabs)/learning')}><Text style={Theme.buttonText}>Tiếp tục luyện tập</Text></TouchableOpacity>
        </View>
        <Text accessibilityRole="header" style={styles.heading}>Câu chuyện âm nhạc</Text>
        {POSTS.map(post => <View key={post.id} style={styles.post}>
          <View style={styles.author}><View style={styles.avatar}><Ionicons name="person-outline" size={22} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.name}>{post.user}</Text><Text style={styles.meta}>Bài viết minh họa</Text></View></View>
          <Text style={styles.copy}>{post.content}</Text>
          <Text style={styles.tag}>{post.tag}</Text>
        </View>)}
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 32 },
  body: { paddingHorizontal: 20 }, noticeTitle: { fontSize: 18, fontWeight: '700', lineHeight: 28, marginBottom: 10 },
  heading: { fontSize: 23, fontWeight: '700', lineHeight: 34, marginTop: 32, marginBottom: 8 },
  post: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  author: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.selected, alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '700', fontSize: 15 }, meta: { color: Colors.light.textSecondary, fontSize: 12, marginTop: 4 },
  copy: { ...Theme.body, color: Colors.light.text }, tag: { color: Colors.accent, fontSize: 13, fontWeight: '600', marginTop: 16 },
});
