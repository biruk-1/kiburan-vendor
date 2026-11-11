import type { AuthError } from '@supabase/supabase-js';

export type AuthUserMessage = {
  code: string;
  message: string;
};

/**
 * Maps Supabase Auth errors to safe, user-facing copy.
 * Never forwards raw internal details or tokens.
 */
export function mapAuthError(error: AuthError | Error | null | undefined): AuthUserMessage {
  if (!error) {
    return { code: 'unknown', message: 'Something went wrong. Please try again.' };
  }

  const status = 'status' in error ? error.status : undefined;
  const code = ('code' in error && typeof error.code === 'string' ? error.code : undefined) ?? 'unknown';
  const raw = error.message?.toLowerCase() ?? '';

  if (code === 'invalid_credentials' || raw.includes('invalid login credentials')) {
    return { code: 'invalid_credentials', message: 'Email or password is incorrect.' };
  }

  if (
    code === 'user_already_exists' ||
    raw.includes('already registered') ||
    raw.includes('user already registered')
  ) {
    return { code: 'user_already_exists', message: 'An account with this email already exists.' };
  }

  if (code === 'email_not_confirmed' || raw.includes('email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message: 'Confirm your email before signing in. Check your inbox for a link.',
    };
  }

  if (code === 'weak_password' || raw.includes('password should be')) {
    return {
      code: 'weak_password',
      message: 'Choose a stronger password (at least 6 characters).',
    };
  }

  if (
    code === 'otp_expired' ||
    code === 'flow_state_expired' ||
    raw.includes('otp has expired') ||
    raw.includes('token has expired')
  ) {
    return {
      code: 'otp_expired',
      message: 'This code or link has expired. Request a new one.',
    };
  }

  if (code === 'otp_disabled' || (raw.includes('otp') && raw.includes('disabled'))) {
    return {
      code: 'otp_disabled',
      message: 'Email verification is temporarily unavailable. Try again later.',
    };
  }

  if (
    code === 'invalid_otp' ||
    raw.includes('token is invalid') ||
    raw.includes('invalid otp') ||
    raw.includes('otp_expired') ||
    (raw.includes('invalid') && raw.includes('token'))
  ) {
    return {
      code: 'invalid_otp',
      message: 'That verification code is incorrect or has expired.',
    };
  }

  if (status === 429 || code === 'over_email_send_rate_limit' || raw.includes('rate limit')) {
    return {
      code: 'rate_limit',
      message: 'Too many attempts. Wait a moment, then try again.',
    };
  }

  if (
    code === 'same_password' ||
    raw.includes('same password') ||
    raw.includes('should be different')
  ) {
    return {
      code: 'same_password',
      message: 'New password must be different from your current password.',
    };
  }

  if (status === 0 || raw.includes('network') || raw.includes('fetch')) {
    return {
      code: 'network',
      message: 'Network error. Check your connection and try again.',
    };
  }

  if (raw.includes('invalid email') || code === 'validation_failed') {
    return { code: 'validation_failed', message: 'Enter a valid email address.' };
  }

  return {
    code: typeof code === 'string' ? code : 'unknown',
    message: 'Something went wrong. Please try again.',
  };
}
