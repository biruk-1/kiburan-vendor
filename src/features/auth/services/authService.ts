import type { AuthError, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { clearVendorPreferences } from '@/features/account/services/vendorPreference';
import { mapAuthError, type AuthUserMessage } from '@/features/auth/services/authErrors';
import { supabase } from '@/lib/supabase/client';

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthUserMessage };

function fail(error: AuthError | Error | null | undefined): AuthResult<never> {
  return { ok: false, error: mapAuthError(error) };
}

/** Deep links must be in the Supabase auth redirect allow list (`kiburan-vendor://**`). */
export function passwordResetRedirectTo(): string {
  return Linking.createURL('reset-password');
}

export function emailConfirmRedirectTo(): string {
  return Linking.createURL('sign-in');
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResult<{ user: User | null; session: Session | null; needsEmailConfirmation: boolean }>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { display_name: input.fullName.trim() },
      emailRedirectTo: emailConfirmRedirectTo(),
    },
  });
  if (error) return fail(error);
  return {
    ok: true,
    data: {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: Boolean(data.user) && !data.session,
    },
  };
}

export async function signIn(input: { email: string; password: string }): Promise<AuthResult<{ session: Session }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) return fail(error);
  if (!data.session) return fail(new Error('No session returned'));
  return { ok: true, data: { session: data.session } };
}

/**
 * Passwordless sign-in with a 6-digit email code. Only existing Kiburan accounts:
 * new vendors register explicitly so a typo cannot silently create an account.
 */
export async function requestEmailOtp(email: string): Promise<AuthResult<{ sent: true }>> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: false },
  });
  if (error) {
    // Unknown emails fail with "Signups not allowed for otp" (code otp_disabled); report
    // success anyway so the screen cannot be used to probe which emails have accounts.
    if (error.message?.toLowerCase().includes('signups not allowed')) {
      return { ok: true, data: { sent: true } };
    }
    const mapped = mapAuthError(error);
    if (mapped.code === 'network' || mapped.code === 'rate_limit' || mapped.code === 'otp_disabled') {
      return { ok: false, error: mapped };
    }
  }
  return { ok: true, data: { sent: true } };
}

export async function verifyEmailOtp(input: { email: string; token: string }): Promise<AuthResult<{ session: Session }>> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: input.email.trim(),
    token: input.token.trim(),
    type: 'email',
  });
  if (error) return fail(error);
  if (!data.session) return fail(new Error('No session returned'));
  return { ok: true, data: { session: data.session } };
}

export async function signOut(): Promise<AuthResult<{ signedOut: true }>> {
  const { error } = await supabase.auth.signOut();
  if (error) return fail(error);
  await clearVendorPreferences().catch(() => undefined);
  return { ok: true, data: { signedOut: true } };
}

/** Always reports success for unknown accounts so callers cannot probe account existence. */
export async function requestPasswordReset(email: string): Promise<AuthResult<{ sent: true }>> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: passwordResetRedirectTo(),
  });
  if (error) {
    const mapped = mapAuthError(error);
    if (mapped.code === 'network' || mapped.code === 'validation_failed' || mapped.code === 'rate_limit') {
      return { ok: false, error: mapped };
    }
  }
  return { ok: true, data: { sent: true } };
}

export async function updatePassword(password: string): Promise<AuthResult<{ updated: true }>> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(error);
  return { ok: true, data: { updated: true } };
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  } catch {
    return null;
  }
}

/** Consumes recovery / confirmation deep links (PKCE `code` or implicit tokens). */
export async function handleAuthCallbackUrl(url: string): Promise<AuthResult<{ session: Session | null }>> {
  try {
    const parsed = Linking.parse(url);
    const query = parsed.queryParams ?? {};

    const code = typeof query.code === 'string' ? query.code : undefined;
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return fail(error);
      return { ok: true, data: { session: data.session } };
    }

    const hash = url.includes('#') ? url.split('#')[1] : '';
    if (hash) {
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) return fail(error);
        return { ok: true, data: { session: data.session } };
      }
    }

    return { ok: true, data: { session: null } };
  } catch (error) {
    return fail(error instanceof Error ? error : new Error('Invalid auth link'));
  }
}
