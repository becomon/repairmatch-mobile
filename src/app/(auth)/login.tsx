import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { BrandMark } from '@/features/auth/BrandMark';
import { validateEmail } from '@/features/auth/validation';
import { friendlyError, ApiError } from '@/shared/api/errors';
import { colors } from '@/shared/theme';
import { Banner, Button, Screen, Text, TextField } from '@/shared/ui';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const eErr = validateEmail(email);
    const pErr = password ? undefined : 'Escribe tu contraseña.';
    setEmailError(eErr);
    setPasswordError(pErr);
    setFormError('');
    if (eErr || pErr) return;
    setBusy(true);
    try {
      await login(email, password);
    } catch (error) {
      setFormError(error instanceof ApiError && error.status === 401 ? 'Correo o contraseña incorrectos.' : friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      contentStyle={{ gap: 20, paddingTop: 32 }}
      footer={
        <View style={{ gap: 8 }}>
          <Button label="Iniciar sesión" onPress={() => void submit()} loading={busy} />
          <Link href="/register" asChild>
            <Pressable accessibilityRole="link" style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="bodyStrong" color={colors.primary}>¿No tienes cuenta? Crear cuenta</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <BrandMark />
      <View style={{ gap: 4 }}>
        <Text variant="display">Hola de nuevo</Text>
        <Text variant="body" color={colors.textMuted}>Inicia sesión para seguir con tus reparaciones.</Text>
      </View>
      {formError ? <Banner tone="danger" message={formError} /> : null}
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="tu@correo.com"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={() => void submit()}
        returnKeyType="go"
      />
    </Screen>
  );
}
