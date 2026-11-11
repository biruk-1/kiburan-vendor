import { z } from 'zod';

import type { ServiceInput } from '@/features/services/services/serviceCatalog';

/** `vendor_services.base_price` is numeric(14,2) with `>= 0`. Length limits are app-side only. */
const MAX_PRICE = 999_999_999_999.99;

export const serviceFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter a service name.').max(120, 'Keep the name under 120 characters.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  description: z.string().trim().max(1000, 'Keep the description under 1,000 characters.'),
  basePrice: z
    .string()
    .trim()
    .min(1, 'Enter a starting price.')
    .transform((value) => value.replace(/,/g, ''))
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Enter a price in ETB, e.g. 15000.')
    .refine((value) => Number(value) <= MAX_PRICE, 'That price is too large.'),
});

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormValues = z.output<typeof serviceFormSchema>;

export function toServiceInput(values: ServiceFormValues): ServiceInput {
  return {
    title: values.title,
    categoryId: values.categoryId,
    description: values.description ? values.description : null,
    basePrice: Number(values.basePrice),
  };
}
