import { useEffect, useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAction } from '../hooks/useAction';
import { useLocation } from '../hooks/useLocation';
import { Feedback } from '../components/Feedback';
import { LocationFields } from '../components/LocationFields';
import { createWorkflowApi, type Match, type Proposal } from '../services/workflow';
import { createRequestsApi, type ApplianceType } from '../services/requests';
export function TechnicianScreen() {
  const { session } = useAuth();
  const api = useMemo(() => createWorkflowApi(session!.api), [session]);
  const requestsApi = useMemo(() => createRequestsApi(session!.api), [session]);
  const action = useAction();
  const location = useLocation();
  const [tab, setTab] = useState<'profile' | 'matches' | 'proposals'>('profile');
  const [types, setTypes] = useState<ApplianceType[]>([]);
  const [typeIds, setTypeIds] = useState<number[]>([]);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [years, setYears] = useState('0');
  const [radius, setRadius] = useState('10');
  const [matches, setMatches] = useState<Match[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [selected, setSelected] = useState<Match | null>(null);
  const [cost, setCost] = useState('');
  const [available, setAvailable] = useState('');
  const [conditions, setConditions] = useState('');
  async function loadProfile() {
    const [profile, appliances] = await Promise.all([api.profile(), requestsApi.types()]);
    setTypes(appliances); setTypeIds(appliances.filter(type => profile.applianceTypes.includes(type.name)).map(type => type.id));
    setBio(profile.bio ?? ''); setPhone(profile.phone ?? ''); setYears(String(profile.experienceYears ?? 0)); setRadius(String(profile.maxRadiusKm ?? 10));
    location.setLatitude(profile.latitude == null ? '' : String(profile.latitude)); location.setLongitude(profile.longitude == null ? '' : String(profile.longitude));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void action.run(loadProfile); }, [api]);
  async function load(next: 'matches' | 'proposals', target: number) {
    if (next === 'matches') { const data = await api.matches(target); setMatches(data.content); setLast(data.last); }
    else { const data = await api.ownProposals(target); setProposals(data.content); setLast(data.last); }
    setPage(target); setTab(next); setSelected(null);
  }
  return <View style={{ gap: 14 }}>
    <Button title="Mi perfil y zona" disabled={action.busy} onPress={() => void action.run(async () => { await loadProfile(); setTab('profile'); })} />
    <Button title="Solicitudes compatibles" disabled={action.busy} onPress={() => void action.run(() => load('matches', 0))} />
    <Button title="Mis propuestas" disabled={action.busy} onPress={() => void action.run(() => load('proposals', 0))} />
    {tab === 'profile' ? <>
      <Text>Experiencia (años, 0 a 70)</Text><TextInput accessibilityLabel="Años de experiencia" value={years} onChangeText={setYears} keyboardType="number-pad" editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Presentación</Text><TextInput accessibilityLabel="Presentación del técnico" value={bio} onChangeText={setBio} maxLength={1000} multiline editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Teléfono</Text><TextInput accessibilityLabel="Teléfono" value={phone} onChangeText={setPhone} maxLength={20} keyboardType="phone-pad" editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Electrodomésticos que atiendes:</Text>
      {types.map(type => <Button key={type.id} title={`${typeIds.includes(type.id) ? '✓ ' : ''}${type.name}`} disabled={action.busy} onPress={() => setTypeIds(previous => previous.includes(type.id) ? previous.filter(id => id !== type.id) : [...previous, type.id])} />)}
      <Button title="Guardar perfil" disabled={action.busy} onPress={() => void action.run(async () => {
        const experienceYears = Number(years);
        if (!years.trim() || !Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 70 || !typeIds.length) throw new Error('Indica entre 0 y 70 años y selecciona al menos un electrodoméstico.');
        await api.saveProfile({ bio: bio.trim(), phone: phone.trim(), experienceYears, applianceTypeIds: typeIds }); action.setMessage('Perfil guardado.');
      })} />
      <LocationFields location={location} busy={action.busy} onLocate={() => void action.run(async () => { await location.locate(); action.setMessage('Ubicación obtenida. Guarda la zona para confirmarla.'); })} />
      <Text>Radio de atención (km, 1 a 300)</Text><TextInput accessibilityLabel="Radio de atención" value={radius} onChangeText={setRadius} keyboardType="numeric" editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
      <Button title="Guardar zona" disabled={action.busy} onPress={() => void action.run(async () => {
        const maxRadiusKm = Number(radius), coords = location.coordinates(true);
        if (!Number.isFinite(maxRadiusKm) || maxRadiusKm < 1 || maxRadiusKm > 300) throw new Error('El radio debe estar entre 1 y 300 km.');
        await api.area({ ...coords as { latitude: number; longitude: number }, maxRadiusKm }); action.setMessage('Zona de servicio guardada.');
      })} />
    </> : <>
      <Button title="Actualizar / reintentar" disabled={action.busy} onPress={() => void action.run(() => load(tab, page))} />
      {tab === 'matches' && !selected && <>
        {matches.length === 0 && <Text>No hay solicitudes compatibles. Revisa tu perfil y zona o vuelve más tarde.</Text>}
        {matches.map(match => <Button key={match.requestId} title={`#${match.requestId} · ${match.applianceTypeName} · ${match.distanceKm.toFixed(1)} km`} disabled={action.busy} onPress={() => { setSelected(match); setCost(''); setAvailable(''); setConditions(''); }} />)}
      </>}
      {tab === 'matches' && selected && <>
        <Text>{selected.description}</Text><Text>Costo de diagnóstico</Text><TextInput accessibilityLabel="Costo de diagnóstico" value={cost} onChangeText={setCost} keyboardType="decimal-pad" editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
        <Text>Fecha local disponible (AAAA-MM-DDTHH:mm)</Text><TextInput accessibilityLabel="Fecha disponible" value={available} onChangeText={setAvailable} autoCapitalize="none" editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
        <Text>Condiciones</Text><TextInput accessibilityLabel="Condiciones" value={conditions} onChangeText={setConditions} multiline maxLength={1000} editable={!action.busy} style={{ borderWidth: 1, padding: 10 }} />
        <Button title="Enviar propuesta" disabled={action.busy} onPress={() => void action.run(async () => {
          const diagnosticCost = Number(cost);
          if (!/^\d{1,10}(\.\d{1,2})?$/.test(cost) || !Number.isFinite(diagnosticCost) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(available) || !Number.isFinite(new Date(available).getTime()) || new Date(available).getTime() <= Date.now() || !conditions.trim()) throw new Error('Indica un costo válido, una fecha futura y las condiciones.');
          await api.propose(selected.requestId, { diagnosticCost, availableAt: available, conditions: conditions.trim() }); setSelected(null); action.setMessage('Propuesta enviada. Puedes consultarla en Mis propuestas.');
        })} />
        <Text>Si la conexión se interrumpe, consulta Mis propuestas antes de reenviar.</Text>
      </>}
      {tab === 'proposals' && <>
        {proposals.length === 0 && <Text>No has enviado propuestas.</Text>}
        {proposals.map(proposal => <Text key={proposal.id}>#{proposal.id} · Solicitud #{proposal.requestId} · S/ {proposal.diagnosticCost} · {proposal.status}</Text>)}
      </>}
      <Button title="Página anterior" disabled={action.busy || page === 0} onPress={() => void action.run(() => load(tab, page - 1))} />
      <Text>Página {page + 1}</Text>
      <Button title="Página siguiente" disabled={action.busy || last} onPress={() => void action.run(() => load(tab, page + 1))} />
    </>}
    <Feedback {...action} />
  </View>;
}
