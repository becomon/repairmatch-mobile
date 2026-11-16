import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { HOME_BY_ROLE, useAuth } from '@/features/auth';
import { colors } from '@/shared/theme';
import { LoadingState } from '@/shared/ui';

/** Entry point: decides where to go from the session state and the user's role. */
export default function Index() {
  const { status, user } = useAuth();
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <LoadingState label="Abriendo RepairMatch…" />
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={HOME_BY_ROLE[user.role] as never} />;
}
