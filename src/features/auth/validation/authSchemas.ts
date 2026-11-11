import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email.').pipe(z.email('Enter a valid email address.'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your name.').max(80, 'Keep the name under 80 characters.'),
    email,
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Keep the password under 72 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const emailOnlySchema = z.object({ email });
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>;

export const otpSchema = z.object({
  email,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your email.'),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Keep the password under 72 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
