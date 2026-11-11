import { describe, expect, it } from 'vitest';

import { serviceFormSchema, toServiceInput } from '@/features/services/validation/serviceSchema';

const valid = { title: ' Wedding Decoration ', categoryId: 'cat-1', description: '', basePrice: '15,000' };

describe('serviceFormSchema', () => {
  it('trims, strips thousands separators and maps to the insert shape', () => {
    const parsed = serviceFormSchema.parse(valid);
    expect(toServiceInput(parsed)).toEqual({
      title: 'Wedding Decoration',
      categoryId: 'cat-1',
      description: null,
      basePrice: 15000,
    });
  });

  it.each(['', 'abc', '-5', '12.345'])('rejects price %j', (basePrice) => {
    expect(serviceFormSchema.safeParse({ ...valid, basePrice }).success).toBe(false);
  });

  it('requires a name and a category', () => {
    const result = serviceFormSchema.safeParse({ ...valid, title: ' ', categoryId: '' });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['title', 'categoryId']));
  });
});
