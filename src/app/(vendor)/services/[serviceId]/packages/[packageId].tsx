import { useLocalSearchParams } from 'expo-router';

import { EditPackageScreen } from '@/features/services/screens/PackageFormScreen';

export default function EditPackageRoute() {
  const { serviceId, packageId } = useLocalSearchParams<{ serviceId: string; packageId: string }>();
  return <EditPackageScreen serviceId={serviceId} packageId={packageId} />;
}
