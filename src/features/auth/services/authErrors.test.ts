import { describe, expect, it } from 'vitest';

import { mapAuthError } from './authErrors';

describe('mapAuthError', () => {
  it('maps invalid credentials', () => {
    const result = mapAuthError({
      name: 'AuthApiError',
      message: 'Invalid login credentials',
      status: 400,
      code: 'invalid_credentials',
    } as never);
    expect(result.message).toMatch(/incorrect/i);
  });

  it('maps existing account', () => {
    const result = mapAuthError({
      name: 'AuthApiError',
      message: 'User already registered',
      status: 422,
    } as never);
    expect(result.message).toMatch(/already exists/i);
  });

  it('maps email confirmation requirement', () => {
    const result = mapAuthError({
      name: 'AuthApiError',
      message: 'Email not confirmed',
      status: 400,
      code: 'email_not_confirmed',
    } as never);
    expect(result.message).toMatch(/confirm your email/i);
  });

  it('maps expired reset links', () => {
    const result = mapAuthError({
      name: 'AuthApiError',
      message: 'Email link is invalid or has expired',
      status: 403,
      code: 'otp_expired',
    } as never);
    expect(result.message).toMatch(/expired/i);
  });

  it('maps network failures', () => {
    const result = mapAuthError(new Error('Network request failed'));
    expect(result.code).toBe('network');
  });

  it('hides unknown internal messages', () => {
    const result = mapAuthError({
      name: 'AuthApiError',
      message: 'unexpected jwt signing key rotation detail',
      status: 500,
    } as never);
    expect(result.message).toMatch(/try again/i);
    expect(result.message).not.toMatch(/jwt/i);
  });
});
