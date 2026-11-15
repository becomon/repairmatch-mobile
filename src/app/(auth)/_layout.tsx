import { Redirect, Stack } from 'expo-router';
import { HOME_BY_ROLE } from '@/features/auth/RoleGate';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/shared/theme';

export default function AuthLayout() {
  const { status, user } = useAuth();
  if (status === 'signedIn' && user) return <Redirect href={HOME_BY_ROLE[user.role] as never} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
