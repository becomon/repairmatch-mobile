import { Redirect } from 'expo-router';
import { View } from 'react-native';
import type { Role } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { LoadingState } from '@/shared/ui';
import { useAuth } from './AuthProvider';

export const HOME_BY_ROLE: Record<Role, string> = {
  CLIENT: '/home',
  TECHNICIAN: '/cases',
};

/** Route guard: sends signed-out users to login and wrong-role users to their own home. */
export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { status, user } = useAuth();
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <LoadingState />
      </View>
    );
  }
  if (status === 'signedOut' || !user) return <Redirect href="/login" />;
  if (user.role !== role) return <Redirect href={HOME_BY_ROLE[user.role] as never} />;
  return <>{children}</>;
}
