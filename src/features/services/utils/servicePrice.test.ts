import { describe, expect, it } from 'vitest';

import { formatServicePrice } from '@/features/services/utils/servicePrice';

describe('formatServicePrice', () => {
  it('shows a starting price for packages', () => {
    expect(formatServicePrice({ basePrice: 15000, currencyCode: 'ETB', priceUnit: 'package' })).toBe('ETB 15,000+');
  });

  it('shows the unit for unit prices', () => {
    expect(formatServicePrice({ basePrice: 450, currencyCode: 'ETB', priceUnit: 'person' })).toBe('ETB 450 / person');
  });

  it('never invents a price', () => {
    expect(formatServicePrice({ basePrice: null, currencyCode: 'ETB', priceUnit: 'package' })).toBe('Price on request');
  });
});
