import { describe, expect, it } from 'vitest';

import { packageFormSchema, toPackageInput } from '@/features/services/validation/packageSchema';

describe('packageFormSchema', () => {
  it('parses inclusions from commas or newlines', () => {
    const parsed = packageFormSchema.parse({
      name: 'Full Day',
      description: '',
      inclusionsText: 'Two shooters\nAlbum, Prints',
      price: '25000',
      isActive: true,
    });
    expect(toPackageInput(parsed).inclusions).toEqual(['Two shooters', 'Album', 'Prints']);
    expect(toPackageInput(parsed).price).toBe(25000);
  });

  it('allows blank price', () => {
    const parsed = packageFormSchema.parse({
      name: 'Custom',
      description: '',
      inclusionsText: '',
      price: '',
      isActive: false,
    });
    expect(toPackageInput(parsed).price).toBeNull();
  });
});
