import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { isAxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAction } from '../hooks/useAction';
import { Feedback } from '../components/Feedback';
import { createWorkflowApi, type Service, type Review } from '../services/workflow';
export function ServicesScreen() {
  const { session, user } = useAuth();
  const api = useMemo(() => createWorkflowApi(session!.api), [session]);
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const action = useAction();
  async function load() { setServices(await api.services()); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void action.run(load); }, [api]);
  async function open(service: Service) {
    setReview(null); setSelected(null); setRating('5'); setComment('');
    if (service.status === 'COMPLETADO') {
      try { setReview(await api.review(service.id)); }
      catch (error) { if (!isAxiosError(error) || error.response?.status !== 404) throw error; }
    }
    setSelected(service);
  }
  function change(status: 'EN_ATENCION' | 'COMPLETADO' | 'CANCELADO') {
    Alert.alert('Cambiar estado', `¿Confirmas cambiar el servicio a ${status}?`, [{ text: 'Volver', style: 'cancel' }, { text: 'Confirmar', onPress: () => void action.run(async () => { setSelected(await api.status(selected!.id, status)); action.setMessage('Estado actualizado.'); }) }]);
  }
  return <View style={{ gap: 14 }}>
    <Text style={{ fontSize: 22 }}>Mis servicios</Text>
    {!selected ? <>
      <Button title="Actualizar / reintentar" disabled={action.busy} onPress={() => void action.run(load)} />
      {!action.busy && services.length === 0 && <Text>No hay servicios. Se crea uno cuando el cliente acepta una propuesta.</Text>}
      {services.map(service => <Button key={service.id} title={`Servicio #${service.id} · ${service.status}`} disabled={action.busy} onPress={() => void action.run(() => open(service))} />)}
    </> : <>
      <Text>Servicio #{selected.id} · Solicitud #{selected.requestId}</Text><Text>{selected.technicianName} · {selected.status}</Text>
      {user?.role === 'TECHNICIAN' && selected.status === 'PROGRAMADO' && <Button title="Iniciar atención" disabled={action.busy} onPress={() => change('EN_ATENCION')} />}
      {user?.role === 'TECHNICIAN' && selected.status === 'EN_ATENCION' && <Button title="Completar servicio" disabled={action.busy} onPress={() => change('COMPLETADO')} />}
      {selected.status === 'PROGRAMADO' && <Button title="Cancelar servicio" disabled={action.busy} onPress={() => change('CANCELADO')} />}
      {selected.status === 'COMPLETADO' && (review ? <Text>Reseña: {review.rating}/5 · {review.comment}</Text> : user?.role === 'CLIENT' ? <>
        <Text>Calificación (1 a 5)</Text><TextInput accessibilityLabel="Calificación" value={rating} onChangeText={setRating} keyboardType="number-pad" editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
        <Text>Comentario</Text><TextInput accessibilityLabel="Comentario de reseña" value={comment} onChangeText={setComment} maxLength={2000} multiline editable={!action.busy} style={{ borderWidth: 1, padding: 12 }} />
        <Button title="Publicar reseña" disabled={action.busy} onPress={() => void action.run(async () => {
          const value = Number(rating);
          if (!Number.isInteger(value) || value < 1 || value > 5 || !comment.trim()) throw new Error('Ingresa una calificación de 1 a 5 y un comentario.');
          setReview(await api.saveReview(selected.id, { rating: value, comment: comment.trim() })); action.setMessage('Reseña publicada.');
        })} />
      </> : <Text>El cliente aún no publicó una reseña.</Text>)}
      <Button title="Volver a servicios" disabled={action.busy} onPress={() => { setSelected(null); void action.run(load); }} />
    </>}
    <Feedback {...action} />
  </View>;
}
