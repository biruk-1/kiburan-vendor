import { useLocalSearchParams } from 'expo-router';

import { EditServiceScreen } from '@/features/services/screens/ServiceFormScreen';

export default function EditServiceRoute() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  return <EditServiceScreen serviceId={serviceId} />;
}
