import { describe, expect, it } from 'vitest';

import {
  availabilityFormSchema,
  combineLocalDateTime,
  toAvailabilityInput,
} from '@/features/availability/validation/availabilitySchema';

describe('availabilityFormSchema', () => {
  it('rejects end before start', () => {
    const result = availabilityFormSchema.safeParse({
      serviceId: '',
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '10:00',
      status: 'unavailable',
      notes: '',
    });
    expect(result.success).toBe(false);
  });

  it('builds ISO timestamps from local date and time', () => {
    const values = availabilityFormSchema.parse({
      serviceId: '',
      date: '2026-11-20',
      startTime: '09:00',
      endTime: '17:00',
      status: 'available',
      notes: 'Open for ceremonies',
    });
    const input = toAvailabilityInput(values);
    expect(new Date(input.startsAt).getHours()).toBe(9);
    expect(new Date(input.endsAt).getHours()).toBe(17);
    expect(input.status).toBe('available');
  });
});

describe('combineLocalDateTime', () => {
  it('returns null for malformed values', () => {
    expect(combineLocalDateTime('20-11-2026', '09:00')).toBeNull();
    expect(combineLocalDateTime('2026-11-20', '9am')).toBeNull();
  });
});
