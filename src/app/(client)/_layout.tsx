import { Stack } from 'expo-router';
import { RoleGate } from '@/features/auth';
import { DraftProvider } from '@/features/requests';
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
