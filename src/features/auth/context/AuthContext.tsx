import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import * as authService from '@/features/auth/services/authService';
import { syncCacheOwner } from '@/lib/query/cacheOwner';
import { queryClient } from '@/lib/query/queryClient';
import { supabase } from '@/lib/supabase/client';

const SESSION_RESTORE_TIMEOUT_MS = 4_000;

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until the stored session has been restored (or the restore timed out). */
  isRestoring: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signIn: typeof authService.signIn;
  signUp: typeof authService.signUp;
  signOut: typeof authService.signOut;
  requestPasswordReset: typeof authService.requestPasswordReset;
  updatePassword: typeof authService.updatePassword;
  requestEmailOtp: typeof authService.requestEmailOtp;
  verifyEmailOtp: typeof authService.verifyEmailOtp;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function restoreSessionWithTimeout(): Promise<Session | null> {
  try {
    return await Promise.race([
      authService.getSession(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), SESSION_RESTORE_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const cacheOwnerRef = useRef<string | null>(null);

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), []);

  const applySession = useCallback((next: Session | null) => {
    cacheOwnerRef.current = syncCacheOwner(queryClient, cacheOwnerRef.current, next?.user?.id ?? null);
    setSession(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    void restoreSessionWithTimeout().then((existing) => {
      if (!mounted) return;
      applySession(existing);
      setIsRestoring(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      applySession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false);
      setIsRestoring(false);
    });

    const handleUrl = (url: string) => {
      void authService.handleAuthCallbackUrl(url).then((result) => {
        if (!mounted || !result.ok || !result.data.session) return;
        applySession(result.data.session);
        if (url.includes('type=recovery') || url.includes('reset-password')) {
          setIsPasswordRecovery(true);
        }
      });
    };

    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const linkingSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      linkingSub.remove();
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isRestoring,
      isPasswordRecovery,
      clearPasswordRecovery,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
      requestPasswordReset: authService.requestPasswordReset,
      updatePassword: authService.updatePassword,
      requestEmailOtp: authService.requestEmailOtp,
      verifyEmailOtp: authService.verifyEmailOtp,
    }),
    [session, isRestoring, isPasswordRecovery, clearPasswordRecovery],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
