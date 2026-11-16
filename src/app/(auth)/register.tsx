import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { validateEmail, validateName, validatePassword } from '@/features/auth/validation';
import { friendlyError } from '@/shared/api/errors';
import type { Role } from '@/shared/api/types';
import { colors, radius } from '@/shared/theme';
import { Banner, Button, Icon, Screen, ScreenHeader, Text, TextField, type IconName } from '@/shared/ui';

const ROLES: { value: Role; title: string; text: string; icon: IconName }[] = [
  { value: 'CLIENT', title: 'Necesito un técnico', text: 'Publica tu falla y compara propuestas.', icon: 'home-outline' },
  { value: 'TECHNICIAN', title: 'Soy técnico', text: 'Recibe casos cerca de ti y envía propuestas.', icon: 'construct-outline' },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = { name: validateName(name), email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    setFormError('');
    if (next.name || next.email || next.password) return;
    setBusy(true);
    try {
      await register({ name, email, password, role });
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen band="sand"
      header={<ScreenHeader title="Crea tu cuenta" back fallbackHref="/login" />}
      footer={
        <View style={{ gap: 8 }}>
          <Button label="Crear cuenta" onPress={() => void submit()} loading={busy} />
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link" style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="bodyStrong" color={colors.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>¿Cómo vas a usar RepairMatch?</Text>
        {ROLES.map((r) => {
          const selected = r.value === role;
          return (
            <Pressable
              key={r.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setRole(r.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                minHeight: 64,
                borderRadius: radius.lg,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primarySoft : colors.surface,
              }}
            >
              <Icon name={r.icon} size={26} color={selected ? colors.primary : colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{r.title}</Text>
                <Text variant="small" color={colors.textMuted}>{r.text}</Text>
              </View>
              <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
            </Pressable>
          );
        })}
      </View>
      {formError ? <Banner tone="danger" message={formError} /> : null}
      <TextField label="Nombre completo" value={name} onChangeText={setName} error={errors.name} autoComplete="name" textContentType="name" maxLength={100} />
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        hint="8 o más caracteres con mayúscula, minúscula, número y símbolo."
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
    </Screen>
  );
}
