import { focusManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

/**
 * React Native has no window focus events; map foreground/background so stale queries
 * refresh when the user returns to the app. Returns an unsubscribe function.
 */
export function subscribeAppFocus(): () => void {
  if (Platform.OS === 'web') return () => {};
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}
