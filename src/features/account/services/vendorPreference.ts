import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'kiburan-vendor:active-vendor:';

export function vendorPreferenceKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

/** Called on sign-out so a shared device doesn't keep which business the last person used. */
export async function clearVendorPreferences(): Promise<void> {
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(PREFIX));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}
