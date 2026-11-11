import { useLocalSearchParams } from 'expo-router';

import { SendQuoteScreen } from '@/features/inquiries/screens/SendQuoteScreen';

export default function SendQuoteRoute() {
  const { inquiryId } = useLocalSearchParams<{ inquiryId: string }>();
  return <SendQuoteScreen inquiryId={inquiryId} />;
}
