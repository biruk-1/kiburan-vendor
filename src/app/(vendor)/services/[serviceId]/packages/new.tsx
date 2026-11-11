import { useLocalSearchParams } from 'expo-router';

import { AddPackageScreen } from '@/features/services/screens/PackageFormScreen';

export default function NewPackageRoute() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  return <AddPackageScreen serviceId={serviceId} />;
}
