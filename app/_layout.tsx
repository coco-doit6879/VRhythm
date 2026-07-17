import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Bravura: require('../Bravura.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tuner" options={{ presentation: 'card' }} />
      <Stack.Screen name="ai-scoring" options={{ presentation: 'card' }} />
      <Stack.Screen name="learning-detail" options={{ presentation: 'card' }} />
    </Stack>
  );
}
