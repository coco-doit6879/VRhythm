import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { Text } from './Typography';

export function ScreenHeader({ title, subtitle, back = false }: { title: string; subtitle?: string; back?: boolean }) {
  return <View style={styles.header}>
    {back && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()} style={Theme.iconButton}>
      <Ionicons name="chevron-back" size={22} color={Colors.primary} />
    </TouchableOpacity>}
    <View style={styles.copy}><Text accessibilityRole="header" style={Theme.heading}>{title}</Text>
      {subtitle && <Text style={Theme.body}>{subtitle}</Text>}
    </View>
  </View>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 20 }, copy: { flex: 1, gap: 6 } });
