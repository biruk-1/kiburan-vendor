import { describe, expect, it } from 'vitest';

import {
  firstName,
  formatDay,
  formatMoney,
  formatMoneyCompact,
  formatRelativeTime,
  formatTime,
  greetingForHour,
  initials,
  parseDateOnly,
} from '@/utils/format';

describe('money', () => {
  it('formats whole birr with grouping', () => {
    expect(formatMoney(85000)).toBe('ETB 85,000');
    expect(formatMoney(15000.4, 'USD')).toBe('USD 15,000');
  });

  it('compacts large values', () => {
    expect(formatMoneyCompact(245000)).toBe('ETB 245K');
    expect(formatMoneyCompact(1_500_000)).toBe('ETB 1.5M');
    expect(formatMoneyCompact(9000)).toBe('ETB 9,000');
  });
});

describe('dates', () => {
  it('parses date-only values as local days', () => {
    const date = parseDateOnly('2026-06-15');
    expect(date && formatDay(date)).toBe('Jun 15, 2026');
    expect(parseDateOnly('2026-06-15T10:00:00Z')).toBeNull();
  });

  it('formats 12-hour times', () => {
    expect(formatTime(new Date(2026, 5, 15, 19, 0))).toBe('7:00 PM');
    expect(formatTime(new Date(2026, 5, 15, 0, 5))).toBe('12:05 AM');
  });

  it('formats relative times', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    expect(formatRelativeTime('2026-06-15T11:58:00Z', now)).toBe('2m ago');
    expect(formatRelativeTime('2026-06-15T09:00:00Z', now)).toBe('3h ago');
    expect(formatRelativeTime('2026-06-13T12:00:00Z', now)).toBe('2d ago');
  });
});

describe('names and greeting', () => {
  it('greets by time of day', () => {
    expect(greetingForHour(8)).toBe('Good morning');
    expect(greetingForHour(14)).toBe('Good afternoon');
    expect(greetingForHour(20)).toBe('Good evening');
  });

  it('extracts first names and initials', () => {
    expect(firstName('  Meskel  Tadesse ')).toBe('Meskel');
    expect(firstName('')).toBeNull();
    expect(initials('Tsehay Alemu')).toBe('TA');
    expect(initials('Meskel')).toBe('M');
  });
});
