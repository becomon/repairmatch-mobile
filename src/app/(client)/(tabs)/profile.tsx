import { useState } from 'react';
import { View } from 'react-native';
import { useAuth, useUser } from '@/features/auth/AuthProvider';
import { IdentityCard } from '@/features/identity/IdentityCard';
import { colors } from '@/shared/theme';
import { Avatar, Button, Card, ConfirmDialog, InfoRow, Screen, ScreenHeader, Text } from '@/shared/ui';

export default function ClientProfileTab() {
  const user = useUser();
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await logout();
  }

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
        <Button label="Cerrar sesión" variant="danger" icon="log-out-outline" onPress={() => setConfirming(true)} />
      </View>
      <ConfirmDialog
        visible={confirming}
        title="¿Cerrar sesión?"
        message="Tendrás que ingresar tu correo y contraseña la próxima vez."
        confirmLabel="Cerrar sesión"
        destructive
        loading={busy}
        onConfirm={() => void signOut()}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
