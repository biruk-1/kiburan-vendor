import { useLocalSearchParams } from 'expo-router';

import { BookingDetailScreen } from '@/features/bookings/screens/BookingDetailScreen';

export default function BookingDetailRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <BookingDetailScreen bookingId={bookingId} />;
}
