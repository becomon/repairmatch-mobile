import { useEffect, useRef, useState } from 'react';
import { Button, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AddPhoto } from '../features/evidences/AddPhoto';
import { createEvidenceApi, type Evidence } from '../features/evidences/api';
import { createPhotoTestSession, type RequestSummary } from './photoTestSession';

type Session = ReturnType<typeof createPhotoTestSession>;
export function PhotoTestScreen() {
  const [baseUrl, setBaseUrl] = useState(process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.10:8080/api');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [selected, setSelected] = useState<RequestSummary | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo completar la operación."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function signIn() {
    if (!email.trim() || !password) throw new Error("Ingresa el correo y la contraseña de tu cuenta cliente.");
    const candidate = createPhotoTestSession(baseUrl);
    try {
      await candidate.login(email, password);
      const list = await candidate.requests();
      setSession(candidate); setRequests(list); setPassword('');
    } catch (cause) { candidate.clear(); throw cause; }
  }
  async function openRequest(request: RequestSummary) {
    if (!session) return;
    const list = await createEvidenceApi(session.client).list(request.id);
    generation.current++; setSelected(request); setEvidences(list);
  }
  async function refresh() {
    if (!session || !selected) return;
    const version = generation.current;
    const list = await createEvidenceApi(session.client).list(selected.id);
    if (generation.current === version) setEvidences(list);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>RepairMatch · Prueba de fotos</Text>
        <Text>Pantalla de prueba de fotos con solicitudes reales. La sesión temporal se conserva en memoria; inicia sesión nuevamente si vence.</Text>
        {!session ? <View style={styles.card}>
          <Text nativeID="api-label">Dirección del backend (incluye /api)</Text>
          <TextInput accessibilityLabel="Dirección del backend" style={styles.input} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" autoCorrect={false} editable={!busy} />
          <Text>Correo electrónico</Text>
          <TextInput accessibilityLabel="Correo del cliente" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" editable={!busy} />
          <Text>Contraseña</Text>
          <TextInput accessibilityLabel="Contraseña" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry editable={!busy} />
          <Button title={busy ? "Conectando…" : "Ingresar como cliente"} disabled={busy} onPress={() => void run(signIn)} />
        </View> : <>
          <Button title="Cerrar sesión de prueba" disabled={busy} onPress={() => { generation.current++; session.clear(); setSession(null); setSelected(null); setEvidences([]); setRequests([]); setError(''); }} />
          {!selected ? <View style={styles.card}>
            <Text style={styles.heading}>Elige tu solicitud</Text>
            <Text>Se muestran hasta 100 solicitudes propias. Si la lista está vacía, crea una solicitud desde la web.</Text>
            <Button title="Actualizar solicitudes" disabled={busy} onPress={() => void run(async () => setRequests(await session.requests()))} />
            {requests.map(request => <Button key={request.id} title={`#${request.id} · ${request.originalDescription.slice(0, 70)}`} disabled={busy} onPress={() => void run(() => openRequest(request))} />)}
          </View> : <View style={styles.card}>
            <Text style={styles.heading}>Solicitud #{selected.id}</Text>
            <Text>{selected.originalDescription}</Text>
            <AddPhoto requestId={selected.id} evidenceApi={createEvidenceApi(session.client)} onAdded={evidence => setEvidences(previous => [...previous, evidence])} />
            <Button title="Actualizar fotos guardadas" disabled={busy} onPress={() => void run(refresh)} />
            {evidences.length === 0 && <Text>No hay fotos guardadas.</Text>}
            {evidences.map(evidence => <View key={evidence.evidenceNumber}>
              <Text>Evidencia #{evidence.evidenceNumber}</Text>
              <Image source={{ uri: evidence.mediaUrl }} style={styles.photo} accessibilityLabel={`Evidencia guardada ${evidence.evidenceNumber}`} />
            </View>)}
            <Button title="Elegir otra solicitud" disabled={busy} onPress={() => { generation.current++; setSelected(null); setEvidences([]); }} />
          </View>}
        </>}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff7ed' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 },
  title: { fontSize: 27, fontWeight: 'bold', color: '#c2410c' },
  heading: { fontSize: 20, fontWeight: 'bold' },
  card: { padding: 16, backgroundColor: 'white', borderRadius: 12, gap: 12 },
  input: { borderWidth: 1, borderColor: '#6b7280', borderRadius: 8, padding: 12, color: '#111827' },
  photo: { width: '100%', height: 220, resizeMode: 'contain' },
  error: { color: '#b91c1c' },
});
