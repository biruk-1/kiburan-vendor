import { useLocalSearchParams } from 'expo-router';

import { InquiryDetailScreen } from '@/features/inquiries/screens/InquiryDetailScreen';

export default function InquiryDetailRoute() {
  const { inquiryId } = useLocalSearchParams<{ inquiryId: string }>();
  return <InquiryDetailScreen inquiryId={inquiryId} />;
}
