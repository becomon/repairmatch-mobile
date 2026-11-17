import { useEffect, useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAction } from '../hooks/useAction';
import { useLocation } from '../hooks/useLocation';
import { createRequestsApi, type ServiceRequest, type ApplianceType } from '../services/requests';
import { Feedback } from '../components/Feedback';
import { LocationFields } from '../components/LocationFields';
import { RequestDetailScreen } from './RequestDetailScreen';

export function RequestsScreen() {
  const { session } = useAuth();
  const api = useMemo(() => createRequestsApi(session!.api), [session]);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [creating, setCreating] = useState(false);
  const [types, setTypes] = useState<ApplianceType[]>([]);
  const [typeId, setTypeId] = useState(0);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const location = useLocation();
  const action = useAction();
  async function load(target = page) { const data = await api.list(target); setItems(data.content); setLast(data.last); setPage(target); }
  // One initial load per mounted authenticated screen.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void action.run(() => load(0)); }, [api]);
  if (selected) return <RequestDetailScreen requestId={selected.id} onBack={() => { setSelected(null); void action.run(() => load()); }} />;
  return <View style={{ gap: 14 }}>
    <Text style={{ fontSize: 22 }}>Mis solicitudes</Text>
    {!creating ? <>
      <Button title="Crear solicitud" disabled={action.busy} onPress={() => void action.run(async () => { setTypes(await api.types()); setCreating(true); })} />
      <Button title="Actualizar / reintentar" disabled={action.busy} onPress={() => void action.run(() => load())} />
      {!action.busy && items.length === 0 && <Text>No hay solicitudes. Crea la primera para solicitar una reparación.</Text>}
      {items.map(item => <Button key={item.id} title={`#${item.id} · ${item.status} · ${item.originalDescription.slice(0, 60)}`} disabled={action.busy} onPress={() => setSelected(item)} />)}
      <Button title="Página anterior" disabled={action.busy || page === 0} onPress={() => void action.run(() => load(page - 1))} />
      <Text>Página {page + 1}</Text>
      <Button title="Página siguiente" disabled={action.busy || last} onPress={() => void action.run(() => load(page + 1))} />
    </> : <>
      <Text>Selecciona el tipo de electrodoméstico:</Text>
      {types.length === 0 && <Text>No hay tipos disponibles. Contacta al administrador.</Text>}
      {types.map(type => <Button key={type.id} title={`${type.id === typeId ? '✓ ' : ''}${type.name}`} disabled={action.busy} onPress={() => setTypeId(type.id)} />)}
      <Text>Describe el problema</Text><TextInput accessibilityLabel="Descripción del problema" multiline maxLength={5000} value={description} onChangeText={setDescription} editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
      <Text>Marca (opcional)</Text><TextInput accessibilityLabel="Marca" maxLength={100} value={brand} onChangeText={setBrand} editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
      <Text>Modelo (opcional)</Text><TextInput accessibilityLabel="Modelo" maxLength={100} value={model} onChangeText={setModel} editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
      <LocationFields location={location} busy={action.busy} onLocate={() => void action.run(async () => { await location.locate(); action.setMessage('Ubicación obtenida. Se guardará al publicar la solicitud.'); })} />
      <Button title="Publicar solicitud" disabled={action.busy} onPress={() => void action.run(async () => {
        if (!typeId || !description.trim()) throw new Error('Selecciona el electrodoméstico y describe el problema.');
        const created = await api.create({ applianceTypeId: typeId, originalDescription: description.trim(), brand: brand.trim(), model: model.trim(), ...location.coordinates() });
        setDescription(''); setBrand(''); setModel(''); setTypeId(0); location.setLatitude(''); location.setLongitude(''); setCreating(false); setSelected(created);
      })} />
      <Text>Si se interrumpe la publicación, actualiza la lista antes de reintentar para evitar duplicados.</Text>
      <Button title="Volver a mis solicitudes" disabled={action.busy} onPress={() => setCreating(false)} />
    </>}
    <Feedback {...action} />
  </View>;
}
