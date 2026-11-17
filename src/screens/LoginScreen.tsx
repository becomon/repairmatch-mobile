import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAction } from '../hooks/useAction';
import { Feedback } from '../components/Feedback';
export function LoginScreen() {
  const [url, setUrl] = useState(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { connect } = useAuth();
  const action = useAction();
  return <View style={{ gap: 14 }}>
    <Text>Ingresa con tu cuenta de RepairMatch. La sesión se guarda de forma segura en este dispositivo.</Text>
    <Text>Dirección del backend (incluye /api)</Text>
    <TextInput accessibilityLabel="Dirección del backend" value={url} onChangeText={setUrl} autoCapitalize="none" editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
    <Text>Correo electrónico</Text>
    <TextInput accessibilityLabel="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
    <Text>Contraseña</Text>
    <TextInput accessibilityLabel="Contraseña" value={password} onChangeText={setPassword} secureTextEntry editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
    <Button title="Iniciar sesión" disabled={action.busy} onPress={() => void action.run(async () => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) throw new Error('Ingresa un correo válido y tu contraseña.');
      await connect(url, email, password); setPassword('');
    })} />
    <Button title="Recuperar sesión guardada" disabled={action.busy} onPress={() => void action.run(async () => { if (!await connect(url)) action.setMessage('No hay una sesión guardada para este servidor. Inicia sesión.'); })} />
    <Feedback {...action} />
  </View>;
}
