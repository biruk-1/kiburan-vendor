import { describe, expect, it } from 'vitest';

import { countByFilter, displayBookingStatus, parseBookingStatus } from '@/features/bookings/utils/bookingStatus';

describe('displayBookingStatus', () => {
  const now = new Date('2026-06-15T15:00:00Z');

  it('maps database statuses to vendor-facing ones', () => {
    expect(displayBookingStatus({ status: 'pending', startAt: null, endAt: null }, now)).toBe('pending');
    expect(displayBookingStatus({ status: 'fulfilled', startAt: null, endAt: null }, now)).toBe('completed');
    expect(displayBookingStatus({ status: 'cancelled', startAt: null, endAt: null }, now)).toBe('cancelled');
  });

  it('derives in-progress only for a confirmed booking happening now', () => {
    const during = { status: 'confirmed' as const, startAt: '2026-06-15T14:00:00Z', endAt: '2026-06-15T18:00:00Z' };
    expect(displayBookingStatus(during, now)).toBe('in_progress');
    expect(displayBookingStatus({ ...during, startAt: '2026-06-16T14:00:00Z', endAt: '2026-06-16T18:00:00Z' }, now)).toBe('confirmed');
    expect(displayBookingStatus({ status: 'confirmed', startAt: null, endAt: null }, now)).toBe('confirmed');
  });
});

describe('booking helpers', () => {
  it('parses unknown statuses as pending', () => {
    expect(parseBookingStatus('weird')).toBe('pending');
  });

  it('counts per filter', () => {
    expect(countByFilter(['pending', 'confirmed', 'confirmed', 'fulfilled', 'cancelled'])).toEqual({
      all: 5,
      pending: 1,
      confirmed: 2,
      completed: 1,
      cancelled: 1,
    });
  });
});
