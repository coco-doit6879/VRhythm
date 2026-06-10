import { Stack } from 'expo-router';

export default function RootLayout() {
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
