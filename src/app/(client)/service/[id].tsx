import { useLocalSearchParams } from 'expo-router';
import { ServiceDetail } from '@/features/services';

export default function ClientServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ServiceDetail id={Number(id)} role="CLIENT" />;
}
