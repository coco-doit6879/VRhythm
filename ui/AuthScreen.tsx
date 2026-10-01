import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { api } from '../services/api';
import { Text, TextInput } from './Typography';

export function AuthScreen({ register = false }: { register?: boolean }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitting = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const revealSubmitOnKeyboard = useRef(false);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (revealSubmitOnKeyboard.current) scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => subscription.remove();
  }, []);

  function revealSubmit() {
    revealSubmitOnKeyboard.current = true;
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  async function submit() {
    if (submitting.current) return;
    if (!email.trim() || !password || (register && (!fullName.trim() || !confirmation))) {
      setError('Vui lòng điền đầy đủ thông tin.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Email chưa đúng định dạng. Ví dụ: ban@example.com.'); return; }
    if (register && password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; }
    if (register && password !== confirmation) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (register && !agreed) { setError('Vui lòng đồng ý với điều khoản sử dụng.'); return; }
    submitting.current = true; setLoading(true); setError('');
    try {
      const response = register
        ? await api.register({ fullName: fullName.trim(), email: email.trim(), password, confirmPassword: confirmation })
        : await api.login({ email: email.trim(), password });
      if (response.success) router.replace('/(tabs)');
      else setError(response.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ. Vui lòng thử lại.'); }
    finally { submitting.current = false; setLoading(false); }
  }

  return <LinearGradient colors={Theme.pageGradient} style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}
          onLayout={() => { if (revealSubmitOnKeyboard.current) scrollRef.current?.scrollToEnd({ animated: true }); }}>
          <View style={styles.brand}>
            <Image source={require('../web/public/images/generated/vrhythm-logo-mark.png')} style={styles.logo} accessibilityLabel="VRhythm" />
            <View style={{ flex: 1 }}><Text style={styles.brandName}>VRhythm</Text><Text style={styles.tagline}>Dòng chảy âm nhạc dân tộc</Text></View>
          </View>
          <Text accessibilityRole="header" style={styles.title}>{register ? 'Tạo tài khoản' : 'Chào mừng trở lại!'}</Text>
          <Text style={styles.subtitle}>{register ? 'Bắt đầu hành trình âm nhạc của riêng bạn ngay hôm nay.' : 'Đăng nhập để tiếp tục hành trình âm nhạc của bạn.'}</Text>
          <View style={styles.form}>
            {register && <View style={styles.field}><Text style={styles.label}>Họ và tên</Text>
              <TextInput accessibilityLabel="Họ và tên" autoComplete="name" maxLength={200} value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Họ và tên của bạn" editable={!loading} />
            </View>}
            <View style={styles.field}><Text style={styles.label}>Email</Text>
              <TextInput accessibilityLabel="Email" autoComplete="email" maxLength={320} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} style={styles.input} placeholder="Email của bạn" editable={!loading} />
            </View>
            <View style={styles.field}><Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.passwordRow}>
              <TextInput accessibilityLabel="Mật khẩu" autoComplete={register ? 'new-password' : 'current-password'} maxLength={register ? 200 : undefined} value={password} onChangeText={setPassword} onFocus={revealSubmit} onBlur={() => { revealSubmitOnKeyboard.current = false; }} secureTextEntry={!showPassword} style={styles.passwordInput} placeholder={register ? '8 ký tự trở lên' : 'Mật khẩu'} editable={!loading} onSubmitEditing={register ? undefined : submit} />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            {register && <View style={styles.field}><Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput accessibilityLabel="Xác nhận mật khẩu" autoComplete="new-password" secureTextEntry={!showPassword} maxLength={200} value={confirmation} onChangeText={setConfirmation} onFocus={revealSubmit} onBlur={() => { revealSubmitOnKeyboard.current = false; }} style={styles.input} placeholder="Nhập lại mật khẩu" editable={!loading} />
            </View>}
            {register && <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={styles.terms}>
              <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={Colors.primary} />
              <Text style={{ flex: 1, lineHeight: 22 }}>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật.</Text>
            </TouchableOpacity>}
            {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={submit} style={[Theme.button, loading && { opacity: 0.65 }]}>
              {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={Theme.buttonText}>{register ? 'Tạo tài khoản' : 'Đăng nhập'}</Text>}
            </TouchableOpacity>
            <View style={styles.footer}><Text style={Theme.body}>{register ? 'Đã có tài khoản?' : 'Bạn chưa có tài khoản?'}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => register ? router.dismissTo('/(auth)/login') : router.push('/(auth)/register')} style={styles.link}>
                <Text style={styles.linkText}>{register ? 'Đăng nhập' : 'Đăng ký ngay'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </LinearGradient>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, width: '100%', maxWidth: 540, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 36 },
  logo: { width: 56, height: 56, resizeMode: 'contain' }, brandName: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  tagline: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
  title: { fontSize: 29, lineHeight: 40, fontWeight: '700', marginBottom: 12 },
  subtitle: { ...Theme.body, marginBottom: 28 },
  form: { ...Theme.panel, padding: 20 }, field: { gap: 8, marginBottom: 18 }, label: { fontSize: 14, fontWeight: '600' },
  input: { minHeight: 52, paddingVertical: 14, paddingHorizontal: 14, backgroundColor: Colors.input, borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 8 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, backgroundColor: Colors.input, borderColor: Colors.inputBorder, borderWidth: 1, borderRadius: 8 },
  passwordInput: { flex: 1, minWidth: 0, paddingVertical: 14, paddingLeft: 14 }, eye: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  terms: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 48, marginBottom: 18 },
  error: { color: Colors.danger, backgroundColor: Colors.dangerBg, padding: 12, borderRadius: 8, marginBottom: 16, lineHeight: 22 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  link: { paddingHorizontal: 8, minHeight: 48, justifyContent: 'center' }, linkText: { color: Colors.primary, fontWeight: '700' },
});
