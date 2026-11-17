import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Image, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createRequestsApi, type ServiceRequest } from '../services/requests';
import { createEvidenceApi, type Evidence } from '../features/evidences/api';
import { AddPhoto } from '../features/evidences/AddPhoto';
import { useAction } from '../hooks/useAction';
import { useLocation } from '../hooks/useLocation';
import { Feedback } from '../components/Feedback';
import { LocationFields } from '../components/LocationFields';
import { createWorkflowApi, type Proposal } from '../services/workflow';
export function RequestDetailScreen({ requestId, onBack }: { requestId: number; onBack: () => void }) {
  const { session } = useAuth();
  const api = useMemo(() => createRequestsApi(session!.api), [session]);
  const evidenceApi = useMemo(() => createEvidenceApi(session!.api), [session]);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const workflow = useMemo(() => createWorkflowApi(session!.api), [session]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const action = useAction();
  const location = useLocation();
  async function load() {
    const [detail, photos, offers] = await Promise.all([api.get(requestId), evidenceApi.list(requestId), workflow.proposals(requestId)]);
    setRequest(detail); setEvidences(photos); setProposals(offers);
    location.setLatitude(detail.latitude == null ? '' : String(detail.latitude)); location.setLongitude(detail.longitude == null ? '' : String(detail.longitude));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void action.run(load); }, [requestId, api]);
  return <View style={{ gap: 14 }}>
    <Text style={{ fontSize: 22 }}>Solicitud #{requestId}</Text>
    <Button title="Actualizar / reintentar" disabled={action.busy} onPress={() => void action.run(load)} />
    {request && <>
      <Text>{request.applianceTypeName} · {request.status}</Text><Text>{request.originalDescription}</Text>
      <Text>Ubicación guardada: {request.latitude ?? 'Sin ubicación'}, {request.longitude ?? 'Sin ubicación'}</Text>
      {request.status === 'PUBLICADA' && <>
        <LocationFields location={location} busy={action.busy} onLocate={() => void action.run(async () => { await location.locate(); action.setMessage('Ubicación obtenida. Pulsa Guardar ubicación para confirmarla.'); })} />
        <Button title="Guardar ubicación" disabled={action.busy} onPress={() => void action.run(async () => { const coords = location.coordinates(true); setRequest(await api.location(requestId, coords as { latitude: number; longitude: number })); action.setMessage('Ubicación guardada.'); })} />
      </>}
      <AddPhoto requestId={requestId} evidenceApi={evidenceApi} onAdded={photo => setEvidences(previous => [...previous, photo])} />
      {evidences.length === 0 && <Text>No hay fotos guardadas.</Text>}
      {evidences.map(photo => <Image key={photo.evidenceNumber} source={{ uri: photo.mediaUrl }} accessibilityLabel={`Foto ${photo.evidenceNumber}`} style={{ height: 220, width: '100%', resizeMode: 'contain' }} />)}
      <Text style={{ fontSize: 20 }}>Propuestas recibidas</Text>
      {proposals.length === 0 && <Text>Aún no hay propuestas.</Text>}
      {proposals.map(proposal => <View key={proposal.id} style={{ gap: 10, padding: 10, backgroundColor: 'white' }}>
        <Text>{proposal.technicianName} · S/ {proposal.diagnosticCost}</Text>
        <Text>{proposal.availableAt} · {proposal.conditions} · {proposal.status}</Text>
        {proposal.status === 'PENDING' && ['PUBLICADA', 'CON_PROPUESTAS'].includes(request.status) && <Button title="Aceptar propuesta" disabled={action.busy} onPress={() => Alert.alert('Aceptar propuesta', 'Se creará el servicio y se cerrará esta solicitud. ¿Confirmas?', [{ text: 'Volver', style: 'cancel' }, { text: 'Aceptar', onPress: () => void action.run(async () => { const service = await workflow.accept(proposal.id); await load(); action.setMessage(`Servicio #${service.id} creado. Puedes consultarlo en Mis servicios.`); }) }])} />}
      </View>)}
      {['PUBLICADA', 'CON_PROPUESTAS'].includes(request.status) && <Button title="Cancelar solicitud" disabled={action.busy} onPress={() => Alert.alert('Cancelar solicitud', '¿Confirmas que deseas cancelar esta solicitud?', [{ text: 'Volver', style: 'cancel' }, { text: 'Sí, cancelar', style: 'destructive', onPress: () => void action.run(async () => { setRequest(await api.cancel(requestId)); action.setMessage('Solicitud cancelada.'); }) }])} />}
    </>}
    <Feedback {...action} />
    <Button title="Volver a mis solicitudes" disabled={action.busy} onPress={onBack} />
  </View>;
}
