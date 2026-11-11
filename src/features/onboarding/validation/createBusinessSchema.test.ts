import { describe, expect, it } from 'vitest';

import { createBusinessSchema } from '@/features/onboarding/validation/createBusinessSchema';

const valid = {
  businessName: 'Lumen Studio',
  categoryIds: ['cat-1'],
  city: 'Addis Ababa',
  description: 'Full-day wedding photography across Addis Ababa and beyond.',
  phone: '+251911000000',
  email: '',
};

describe('createBusinessSchema', () => {
  it('accepts a complete draft ready for submission', () => {
    expect(createBusinessSchema.parse(valid).businessName).toBe('Lumen Studio');
  });

  it('requires a category, city, description, and contact', () => {
    const result = createBusinessSchema.safeParse({
      ...valid,
      categoryIds: [],
      city: '',
      description: 'too short',
      phone: '',
      email: '',
    });
    expect(result.success).toBe(false);
  });
});
