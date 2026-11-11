import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingView } from '@/components/feedback/StatusView';
import { AccountProvider, useAccount } from '@/features/account/context/AccountContext';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { subscribeAppFocus } from '@/lib/query/appFocus';
import { queryClient } from '@/lib/query/queryClient';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { state } = useAccount();
  const { isPasswordRecovery } = useAuth();
  const ready = fontsReady && state.kind !== 'restoring';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  // Mounting the guards before the businesses load would redirect deep links (e.g. /bookings) to "/".
  if (state.kind === 'loading_businesses' && !isPasswordRecovery) {
    return <LoadingView message="Loading your business…" />;
  }

  const onboarding = !isPasswordRecovery && (state.kind === 'no_business' || state.kind === 'choose_business');
  const workspace = !isPasswordRecovery && state.kind === 'workspace';
  // Recovery deep links create a session; keep the auth stack mounted so /reset-password stays reachable.
  const auth = state.kind === 'signed_out' || isPasswordRecovery;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={auth} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarding} redirectTo="/">
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={workspace} redirectTo="/">
        <Stack.Screen name="(vendor)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => subscribeAppFocus(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AccountProvider>
              <StatusBar style="dark" />
              {/* A font failure falls back to system fonts rather than blocking the app. */}
              <RootNavigator fontsReady={fontsLoaded || Boolean(fontError)} />
            </AccountProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
