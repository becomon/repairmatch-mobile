import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { RolePicker, useAuth, validateEmail, validateName, validatePassword } from '@/features/auth';
import { friendlyError } from '@/shared/api/errors';
import type { Role } from '@/shared/api/types';
import { MAX_NAME_CHARS } from '@/shared/constants';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { colors } from '@/shared/theme';
import { Banner, Button, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const { busy, run } = useAsyncAction();

  const submit = () =>
    run(async () => {
      const next = { name: validateName(name), email: validateEmail(email), password: validatePassword(password) };
      setErrors(next);
      setFormError('');
      if (next.name || next.email || next.password) return;
      try {
        await register({ name, email, password, role });
      } catch (error) {
        setFormError(friendlyError(error));
      }
    });

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
      <RolePicker value={role} onChange={setRole} />
      {formError ? <Banner tone="danger" message={formError} /> : null}
      <TextField label="Nombre completo" value={name} onChangeText={setName} error={errors.name} autoComplete="name" textContentType="name" maxLength={MAX_NAME_CHARS} />
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
