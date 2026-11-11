import { z } from 'zod';

export const businessProfileSchema = z
  .object({
    businessName: z.string().trim().min(2, 'Enter your business name.').max(120, 'Keep the name under 120 characters.'),
    categoryIds: z.array(z.string().min(1)).min(1, 'Choose at least one category.'),
    city: z.string().trim().min(2, 'Enter your city.'),
    description: z
      .string()
      .trim()
      .min(20, 'Write at least 20 characters so couples understand your business.')
      .max(1000, 'Keep the description under 1,000 characters.'),
    phone: z.string().trim().max(40, 'Keep the phone under 40 characters.'),
    email: z.string().trim(),
    address: z.string().trim().max(200, 'Keep the address under 200 characters.'),
    websiteUrl: z.string().trim().max(200, 'Keep the website under 200 characters.'),
    instagramUrl: z.string().trim().max(200, 'Keep the Instagram link under 200 characters.'),
  })
  .superRefine((value, ctx) => {
    if (!value.phone && !value.email) {
      ctx.addIssue({ code: 'custom', message: 'Add a phone number or an email.', path: ['phone'] });
    }
    if (value.email) {
      const parsed = z.email().safeParse(value.email);
      if (!parsed.success) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid email address.', path: ['email'] });
      }
    }
    for (const [field, label] of [
      ['websiteUrl', 'website'],
      ['instagramUrl', 'Instagram'],
    ] as const) {
      const raw = value[field];
      if (!raw) continue;
      const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      if (!URL.canParse(withScheme)) {
        ctx.addIssue({ code: 'custom', message: `Enter a valid ${label} URL.`, path: [field] });
      }
    }
  });

export type BusinessProfileInput = z.input<typeof businessProfileSchema>;
export type BusinessProfileValues = z.output<typeof businessProfileSchema>;

export function normalizeOptionalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
