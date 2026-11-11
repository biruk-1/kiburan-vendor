import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const memory = new Map<string, string>();

function canUseDomStorage(): boolean {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

async function safeGet(key: string): Promise<string | null> {
  if (!canUseDomStorage()) return null;
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  if (!canUseDomStorage()) return;
  memory.set(key, value);
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Memory fallback keeps the session for this JS runtime.
  }
}

async function safeRemove(key: string): Promise<void> {
  if (!canUseDomStorage()) return;
  memory.delete(key);
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Ignore native storage failures after memory clear.
  }
}

/**
 * Supabase auth storage that tolerates static web rendering and missing native AsyncStorage.
 */
export const authStorage: SupportedStorage = {
  getItem: (key) => safeGet(key),
  setItem: (key, value) => safeSet(key, value),
  removeItem: (key) => safeRemove(key),
};
