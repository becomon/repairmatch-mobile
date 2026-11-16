import { Stack } from 'expo-router';
import { RoleGate } from '@/features/auth/RoleGate';
import { DraftProvider } from '@/features/requests/draft';
import { colors } from '@/shared/theme';

export default function ClientLayout() {
  return (
    <RoleGate role="CLIENT">
      <DraftProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </DraftProvider>
    </RoleGate>
  );
}
