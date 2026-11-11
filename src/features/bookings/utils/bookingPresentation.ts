import type { PillTone } from '@/components/ui/StatusPill';
import type { BookingDisplayStatus } from '@/features/bookings/utils/bookingStatus';
import { formatDay, formatTime, parseDateOnly } from '@/utils/format';

export const BOOKING_PILL: Record<BookingDisplayStatus, { label: string; tone: PillTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  in_progress: { label: 'In Progress', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

/** "Jun 15, 2026 • 7:00 PM" — falls back to whichever part exists. */
export function bookingWhen(booking: { bookingDate: string | null; startAt: string | null }): string | null {
  const start = booking.startAt ? new Date(booking.startAt) : null;
  const day = booking.bookingDate ? parseDateOnly(booking.bookingDate) : start;
  if (!day) return null;
  return start ? `${formatDay(day)} • ${formatTime(start)}` : formatDay(day);
}

export function bookingTimeRange(booking: { startAt: string | null; endAt: string | null }): string | null {
  if (!booking.startAt) return null;
  const start = formatTime(new Date(booking.startAt));
  return booking.endAt ? `${start} – ${formatTime(new Date(booking.endAt))}` : start;
}
