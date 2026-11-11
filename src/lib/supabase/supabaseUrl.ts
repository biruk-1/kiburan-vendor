import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Expo Go on a physical device cannot reach `127.0.0.1` on your PC.
 * When the env URL uses localhost, rewrite the host to the Metro debugger LAN IP.
 */
export function resolveSupabaseUrl(configuredUrl: string): string {
  if (Platform.OS === 'web') {
    return configuredUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(configuredUrl);
  } catch {
    return configuredUrl;
  }

  const isLoopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  if (!isLoopback) {
    return configuredUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.experienceUrl ??
    Constants.linkingUri ??
    '';

  const lanMatch = hostUri.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  if (!lanMatch) {
    return configuredUrl;
  }

  parsed.hostname = lanMatch[1];
  return parsed.toString().replace(/\/$/, '');
}
