import { describe, expect, it } from 'vitest';

import { sendQuoteSchema } from '@/features/inquiries/validation/quoteSchema';

describe('sendQuoteSchema', () => {
  it('accepts a valid quote', () => {
    const parsed = sendQuoteSchema.parse({
      amount: '45,000',
      packageId: '',
      description: 'Full day coverage',
      validUntil: '2026-12-01',
    });
    expect(parsed.amount).toBe('45000');
  });

  it('rejects bad dates and amounts', () => {
    expect(sendQuoteSchema.safeParse({ amount: '', packageId: '', description: '', validUntil: '' }).success).toBe(
      false,
    );
    expect(
      sendQuoteSchema.safeParse({ amount: '100', packageId: '', description: '', validUntil: '01-12-2026' }).success,
    ).toBe(false);
  });
});
