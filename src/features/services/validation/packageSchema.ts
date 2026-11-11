import { z } from 'zod';

import type { PackageInput } from '@/features/services/services/packageCatalog';

const MAX_PRICE = 999_999_999_999.99;

export const packageFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter a package name.').max(120, 'Keep the name under 120 characters.'),
  description: z.string().trim().max(1000, 'Keep the description under 1,000 characters.'),
  inclusionsText: z.string().trim().max(2000, 'Keep inclusions under 2,000 characters.'),
  price: z
    .string()
    .trim()
    .transform((value) => value.replace(/,/g, ''))
    .refine((value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value), 'Enter a price in ETB, e.g. 15000.')
    .refine((value) => value === '' || Number(value) <= MAX_PRICE, 'That price is too large.'),
  isActive: z.boolean(),
});

export type PackageFormInput = z.input<typeof packageFormSchema>;
export type PackageFormValues = z.output<typeof packageFormSchema>;

export function toPackageInput(values: PackageFormValues): PackageInput {
  return {
    name: values.name,
    description: values.description ? values.description : null,
    inclusions: values.inclusionsText
      .split(/\n|,/)
      .map((line) => line.trim())
      .filter(Boolean),
    price: values.price ? Number(values.price) : null,
    isActive: values.isActive,
  };
}
