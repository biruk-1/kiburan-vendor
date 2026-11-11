import { useLocalSearchParams } from 'expo-router';

import { PackagesScreen } from '@/features/services/screens/PackagesScreen';

export default function PackagesRoute() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  return <PackagesScreen serviceId={serviceId} />;
}
