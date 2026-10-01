import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const destinations = [
    { name: 'index', title: 'Trang chủ', icon: 'home-outline' },
    { name: 'library', title: 'Thư viện', icon: 'book-outline' },
    { name: 'learning', title: 'Học tập', icon: 'school-outline' },
    { name: 'community', title: 'Cộng đồng', icon: 'people-outline' },
    { name: 'profile', title: 'Cá nhân', icon: 'person-outline' },
  ] as const;
  return <Tabs screenOptions={{
    headerShown: false, tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.light.textSecondary,
    tabBarLabelStyle: { fontFamily: 'BeVietnamPro_500Medium', fontSize: 10 },
    tabBarStyle: { backgroundColor: '#EDF2E8', borderTopColor: Colors.light.border,
      height: 64 + insets.bottom + Math.max(0, fontScale - 1) * 16,
      paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8) },
    tabBarItemStyle: { minHeight: 48 },
  }}>
    {destinations.map(({ name, title, icon }) => <Tabs.Screen key={name} name={name} options={{
      title, tabBarAccessibilityLabel: title,
      tabBarIcon: ({ color }) => <Ionicons name={icon} size={23} color={color} />,
    }} />)}
  </Tabs>;
}
