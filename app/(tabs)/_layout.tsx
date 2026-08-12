import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Platform, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type TabIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused: boolean;
  label?: string;
};

function TabIcon({ name, color, focused, label }: TabIconProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? color + '20' : 'transparent',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
    }}>
      <Ionicons name={name} size={22} color={color} />
      {focused && label && (
        <Text style={{ color: color, marginLeft: 6, fontSize: 13, fontWeight: '700' }}>
          {label}
        </Text>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CB8A8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0EBE4',
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} label="Trang chủ" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Thư viện',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} color={color} focused={focused} label="Thư viện" />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Học tập',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 12 : 24,
              borderWidth: 4,
              borderColor: '#FFF',
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}>
              <Ionicons name="school" size={26} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Cộng đồng',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} label="Cộng đồng" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} label="Cá nhân" />
          ),
        }}
      />
    </Tabs>

    </>
  );
}

