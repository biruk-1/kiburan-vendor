import { z } from 'zod';

const MAX_PRICE = 999_999_999_999.99;

export const sendQuoteSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Enter a quote amount.')
    .transform((value) => value.replace(/,/g, ''))
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Enter an amount in ETB, e.g. 45000.')
    .refine((value) => Number(value) <= MAX_PRICE, 'That amount is too large.'),
  packageId: z.string(),
  description: z.string().trim().max(1000, 'Keep the description under 1,000 characters.'),
  validUntil: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use YYYY-MM-DD for the valid-until date.'),
});

export type SendQuoteInput = z.input<typeof sendQuoteSchema>;
export type SendQuoteValues = z.output<typeof sendQuoteSchema>;
