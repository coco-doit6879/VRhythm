import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0D1F17', '#0A1812', '#13241A']} style={styles.gradient}>
      <View style={styles.blobRight} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="star" size={18} color={Colors.accent} />
              </TouchableOpacity>
              <View style={styles.logoSmall}>
                <Text style={styles.logoSmallText}>V</Text>
              </View>
            </View>

            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu hành trình âm nhạc của riêng bạn{'\n'}ngay hôm nay.</Text>

            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Ionicons name="book-outline" size={17} color={Colors.dark.textMuted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={17} color={Colors.dark.textMuted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={17} color={Colors.dark.textMuted} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mật khẩu"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'play' : 'play'} size={14} color={Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={17} color={Colors.dark.textMuted} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name="play" size={14} color={Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
                <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                  {agreed && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
                <Text style={styles.termsText}>
                  Tôi đồng ý với{' '}
                  <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
                  {' '}và{' '}
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                  {' '}của VRhythm.
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#2D6A4F', '#40916C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerBtnGradient}
                >
                  <Text style={styles.registerBtnText}>Đăng ký ngay</Text>
                  <Ionicons name="home" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Features */}
            <Text style={styles.exploreLabel}>KHÁM PHÁ THÊM</Text>
            <View style={styles.featuresRow}>
              <View style={styles.featureCard}>
                <Ionicons name="megaphone-outline" size={20} color={Colors.primaryLight} />
                <Text style={styles.featureText}>Nhạc chất lượng cao</Text>
              </View>
              <View style={[styles.featureCard, { backgroundColor: 'rgba(244,162,97,0.15)' }]}>
                <Ionicons name="diamond-outline" size={20} color="#F4A261" />
                <Text style={styles.featureText}>Không quảng cáo</Text>
              </View>
            </View>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  blobRight: {
    position: 'absolute',
    bottom: 80,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(123,94,167,0.12)',
  },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSmallText: { color: '#FFF', fontWeight: '800', fontSize: 18 },

  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 10 },
  subtitle: { fontSize: 14, color: Colors.dark.textSecondary, lineHeight: 20, marginBottom: 28 },

  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    height: 52,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { flex: 1, color: Colors.dark.textSecondary, fontSize: 13, lineHeight: 18 },
  termsLink: { color: Colors.accent },

  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  registerBtnGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  registerBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  exploreLabel: { color: Colors.dark.textMuted, fontSize: 11, letterSpacing: 1.5, textAlign: 'center', marginTop: 28, marginBottom: 14 },
  featuresRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(82,183,136,0.12)',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(82,183,136,0.2)',
  },
  featureText: { color: Colors.dark.textSecondary, fontSize: 13, fontWeight: '500' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: Colors.dark.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});
