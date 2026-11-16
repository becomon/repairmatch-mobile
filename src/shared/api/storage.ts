import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation, so the browser preview falls back to localStorage.
const isWeb = Platform.OS === 'web';

function webStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export async function getSecret(key: string): Promise<string | null> {
  try {
    if (isWeb) return webStorage()?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecret(key: string, value: string): Promise<void> {
  try {
    if (isWeb) webStorage()?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Storage failures must never block the session; the user just logs in again next time.
  }
}

export async function deleteSecret(key: string): Promise<void> {
  try {
    if (isWeb) webStorage()?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch {
    // Nothing else to do.
  }
}
