import { describe, expect, it } from 'vitest';

import { otpSchema, registerSchema, resetPasswordSchema, signInSchema } from '@/features/auth/validation/authSchemas';

describe('authSchemas', () => {
  it('accepts a normal sign-in', () => {
    expect(signInSchema.parse({ email: 'a@b.com', password: 'x' })).toEqual({ email: 'a@b.com', password: 'x' });
  });

  it('requires matching passwords on register', () => {
    const result = registerSchema.safeParse({
      fullName: 'Meskel',
      email: 'a@b.com',
      password: 'longenough',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('requires a 6-digit OTP', () => {
    expect(otpSchema.safeParse({ email: 'a@b.com', token: '12345' }).success).toBe(false);
    expect(otpSchema.parse({ email: 'a@b.com', token: '123456' }).token).toBe('123456');
  });

  it('requires matching passwords on reset', () => {
    expect(resetPasswordSchema.safeParse({ password: 'longenough', confirmPassword: 'longenough' }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ password: 'longenough', confirmPassword: 'nope' }).success).toBe(false);
  });
});
