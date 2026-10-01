import React, { useState } from 'react';
import { Redirect } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { api } from '../services/api';
import { Text } from '../ui/Typography';
import { Theme } from '../constants/Theme';

export default function Index() {
  const [, retry] = useState(0);
  try {
    return <Redirect href={api.getToken() ? '/(tabs)' : '/(auth)/login'} />;
  } catch {
    return <View style={[Theme.screen, { padding: 24, justifyContent: 'center', gap: 16 }]}>
      <Text accessibilityRole="alert">Chưa đọc được phiên đăng nhập. Hãy mở khóa thiết bị rồi thử lại.</Text>
      <TouchableOpacity accessibilityRole="button" style={Theme.button} onPress={() => retry(n => n + 1)}><Text style={Theme.buttonText}>Thử lại</Text></TouchableOpacity>
    </View>;
  }
}
