import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold } from '@expo-google-fonts/be-vietnam-pro';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Bravura: require('../Bravura.otf'),
    BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.light.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tuner" options={{ presentation: 'card' }} />
      <Stack.Screen name="ai-scoring" options={{ presentation: 'card' }} />
      <Stack.Screen name="learning-detail" options={{ presentation: 'card' }} />
    </Stack>
    </>
  );
}
