import { z } from 'zod';

export const createBusinessSchema = z
  .object({
    businessName: z.string().trim().min(2, 'Enter your business name.').max(120, 'Keep the name under 120 characters.'),
    categoryIds: z.array(z.string().min(1)).min(1, 'Choose at least one category.'),
    city: z.string().trim().min(2, 'Enter your city.'),
    description: z
      .string()
      .trim()
      .min(20, 'Write at least 20 characters so reviewers understand your business.')
      .max(1000, 'Keep the description under 1,000 characters.'),
    phone: z.string().trim().max(40, 'Keep the phone under 40 characters.'),
    email: z.string().trim(),
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
  });

export type CreateBusinessInput = z.input<typeof createBusinessSchema>;
export type CreateBusinessValues = z.output<typeof createBusinessSchema>;
