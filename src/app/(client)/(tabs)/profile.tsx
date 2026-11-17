import { View } from 'react-native';
import { SignOutDialog, useSignOut, useUser } from '@/features/auth';
import { IdentityCard } from '@/features/identity';
import { colors } from '@/shared/theme';
import { Avatar, Button, Card, InfoRow, Screen, ScreenHeader, Text } from '@/shared/ui';

export default function ClientProfileTab() {
  const user = useUser();
  const signOut = useSignOut();

  return (
    <Screen inTabs header={<ScreenHeader title="Perfil" />}>
      <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
        <Avatar name={user.name} size={72} />
        <Text variant="heading">{user.name}</Text>
        <Text variant="small" color={colors.textMuted}>{user.email}</Text>
      </Card>
      <Card style={{ gap: 12 }}>
        <InfoRow label="Cuenta" value="Cliente" />
        <InfoRow label="Correo" value={user.email} />
      </Card>
      <IdentityCard />
      <View style={{ paddingTop: 8 }}>
        <Button label="Cerrar sesión" variant="danger" icon="log-out-outline" onPress={signOut.ask} />
      </View>
      <SignOutDialog state={signOut} />
    </Screen>
  );
}
