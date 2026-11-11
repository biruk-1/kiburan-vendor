export type BookingStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

/** What the vendor sees. "In progress" is derived; it is not a database status. */
export type BookingDisplayStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const BOOKING_FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const FILTER_STATUS: Record<Exclude<BookingFilter, 'all'>, BookingStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'fulfilled',
  cancelled: 'cancelled',
};

export function parseBookingStatus(value: string): BookingStatus {
  return value === 'confirmed' || value === 'fulfilled' || value === 'cancelled' ? value : 'pending';
}

export function displayBookingStatus(
  booking: { status: BookingStatus; startAt: string | null; endAt: string | null },
  now: Date = new Date(),
): BookingDisplayStatus {
  switch (booking.status) {
    case 'pending':
      return 'pending';
    case 'fulfilled':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'confirmed': {
      if (booking.startAt && booking.endAt) {
        const t = now.getTime();
        if (new Date(booking.startAt).getTime() <= t && t <= new Date(booking.endAt).getTime()) {
          return 'in_progress';
        }
      }
      return 'confirmed';
    }
  }
}

export function countByFilter(statuses: BookingStatus[]): Record<BookingFilter, number> {
  const counts: Record<BookingFilter, number> = { all: statuses.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  for (const status of statuses) {
    if (status === 'pending') counts.pending += 1;
    else if (status === 'confirmed') counts.confirmed += 1;
    else if (status === 'fulfilled') counts.completed += 1;
    else counts.cancelled += 1;
  }
  return counts;
}
