import { Stack } from 'expo-router';
import { RoleGate } from '@/features/auth';
import { colors } from '@/shared/theme';

export default function TechnicianLayout() {
  return (
    <RoleGate role="TECHNICIAN">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </RoleGate>
  );
}
