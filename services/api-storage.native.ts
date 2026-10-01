import * as SecureStore from 'expo-secure-store';

// Small session/preferences only. No biometric prompt or plaintext fallback.
// Keep synchronous reads for existing render-time consumers; deletion is awaited.
export const storage = {
  getItem: (key: string): string | null => SecureStore.getItem(key),
  setItem: (key: string, value: string): void => SecureStore.setItem(key, value),
  removeItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
