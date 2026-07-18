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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.login({
        email: email.trim(),
        password: password,
      });

      if (response.success) {
        router.replace('/(tabs)');
      } else {
        setErrorMessage(response.message || 'Đăng nhập không thành công.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A1A12', '#0D2318', '#1A3020']}
      style={styles.gradient}
    >
      {/* Decorative blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoBox}>
                <Text style={styles.logoLetter}>V</Text>
              </View>
              <Text style={styles.appName}>
                <Text style={styles.appNameWhite}>V</Text>
                <Text style={styles.appNameGreen}>Rhythm</Text>
              </Text>
              <Text style={styles.tagline}>Dòng chảy âm nhạc dân tộc</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
              <Text style={styles.welcomeSubtitle}>
                Đăng nhập để tiếp tục hành trình âm nhạc của bạn.
              </Text>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.dark.textMuted} style={styles.inputIcon} />
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

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.dark.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mật khẩu"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={Colors.dark.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#2D6A4F', '#40916C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtnGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginBtnText}>Đăng nhập</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>HOẶC TIẾP TỤC VỚI</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                  <FontAwesome name="google" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                  <FontAwesome name="apple" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                  <FontAwesome name="facebook" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.registerLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
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
  keyboardView: { flex: 1 },
  blobTop: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(64,145,108,0.15)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: 100,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(123,94,167,0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: height - 60,
  },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoLetter: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  appName: { fontSize: 30, fontWeight: '800', marginBottom: 6 },
  appNameWhite: { color: '#FFFFFF' },
  appNameGreen: { color: Colors.primarySoft },
  tagline: { color: Colors.dark.textMuted, fontSize: 13 },

  formCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 14, color: Colors.dark.textSecondary, lineHeight: 20, marginBottom: 24 },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  eyeBtn: { padding: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: Colors.accent, fontSize: 13 },

  loginBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 24 },
  loginBtnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: Colors.dark.textMuted, fontSize: 11, marginHorizontal: 12, letterSpacing: 1 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 24 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { color: Colors.dark.textSecondary, fontSize: 14 },
  registerLink: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});
