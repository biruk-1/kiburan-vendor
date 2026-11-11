import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Stack used inside every tab; screens draw their own headers. */
export function TabStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
