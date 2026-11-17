import { StatusBar } from 'expo-status-bar';
import { Button, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { useAction } from './src/hooks/useAction';
import { Feedback } from './src/components/Feedback';
import { useState } from 'react';
import { TechnicianScreen } from './src/screens/TechnicianScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';

export default function App() {
  return <AuthProvider><Main /><StatusBar style="dark" /></AuthProvider>;
}

function Main() {
  const { user, logout } = useAuth();
  const action = useAction();
  const [section, setSection] = useState<'requests' | 'services'>('requests');
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff7ed' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#c2410c' }}>RepairMatch</Text>
      {user ? <>
        <Text>Hola, {user.name}</Text>
        <Button title="Cerrar sesión" disabled={action.busy} onPress={() => void action.run(async () => { setSection('requests'); await logout(); })} />
        <Button title={user.role === 'CLIENT' ? 'Mis solicitudes' : 'Perfil y propuestas'} onPress={() => setSection('requests')} />
        <Button title="Mis servicios" onPress={() => setSection('services')} />
        {section === 'services' ? <ServicesScreen /> : user.role === 'CLIENT' ? <RequestsScreen /> : <TechnicianScreen />}
      </> : <LoginScreen />}
      <Feedback {...action} />
    </ScrollView>
  </KeyboardAvoidingView>;
}
