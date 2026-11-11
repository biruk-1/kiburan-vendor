import { describe, expect, it } from 'vitest';

import {
  businessProfileSchema,
  normalizeOptionalUrl,
} from '@/features/business-profile/validation/businessProfileSchema';

describe('businessProfileSchema', () => {
  const base = {
    businessName: 'Golden Lens Studio',
    categoryIds: ['cat-1'],
    city: 'Addis Ababa',
    description: 'Wedding photography for couples across Ethiopia.',
    phone: '+251911000000',
    email: '',
    address: '',
    websiteUrl: '',
    instagramUrl: '',
  };

  it('accepts a complete profile', () => {
    expect(businessProfileSchema.safeParse(base).success).toBe(true);
  });

  it('requires phone or email', () => {
    const result = businessProfileSchema.safeParse({ ...base, phone: '', email: '' });
    expect(result.success).toBe(false);
  });

  it('validates optional urls when present', () => {
    const bad = businessProfileSchema.safeParse({ ...base, websiteUrl: 'not a url' });
    expect(bad.success).toBe(false);
    const good = businessProfileSchema.safeParse({ ...base, websiteUrl: 'kiburan.et', instagramUrl: 'https://instagram.com/x' });
    expect(good.success).toBe(true);
  });
});

describe('normalizeOptionalUrl', () => {
  it('returns null for blank and prefixes https when missing', () => {
    expect(normalizeOptionalUrl('')).toBeNull();
    expect(normalizeOptionalUrl('example.com')).toBe('https://example.com');
    expect(normalizeOptionalUrl('https://example.com')).toBe('https://example.com');
  });
});
