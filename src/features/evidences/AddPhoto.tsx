import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { CreateEvidence, Evidence, EvidenceApi } from './api';
import { pickPhoto } from './pickPhoto';
import { uploadPhoto } from './cloudinary';

interface Props {
  requestId: number;
  evidenceApi: EvidenceApi;
  onAdded: (evidence: Evidence) => void;
}

// Reset pending photos when the request changes; old operations cannot notify the new screen.
export function AddPhoto(props: Props) {
  const [expanded, setExpanded] = useState(false);
  return expanded ? <PhotoForm key={props.requestId} {...props} /> : (
    <View style={styles.collapsed}><Button label="Agregar foto" icon="camera" variant="secondary" onPress={() => setExpanded(true)} /></View>
  );
}

function PhotoForm({ requestId, evidenceApi, onAdded }: Props) {
  const [photo, setPhoto] = useState<ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const uploaded = useRef<CreateEvidence | null>(null);
  const locked = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  async function choose(source: 'camera' | 'gallery') {
    if (locked.current) return;
    locked.current = true;
    setBusy(true); setError(''); setMessage('');
    try {
      const selected = await pickPhoto(source);
      if (selected && alive.current) {
        setPhoto(selected);
        uploaded.current = null;
      }
    } catch {
      if (alive.current) setError("No se pudo abrir el selector de fotos. Intenta elegir desde la galería.");
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }

  async function save() {
    if (locked.current || !photo) return;
    locked.current = true;
    setBusy(true); setError(''); setMessage("Subiendo foto…");
    try {
      // Preserve the URL after upload so a backend error does not re-upload the file.
      const metadata = uploaded.current ?? await uploadPhoto(photo);
      uploaded.current = metadata;
      if (!alive.current) return;
      setMessage("Guardando evidencia…");
      const evidence = await evidenceApi.add(requestId, metadata);
      if (!alive.current) return;
      uploaded.current = null;
      setPhoto(null);
      setMessage("Foto agregada a la solicitud.");
      onAdded(evidence);
    } catch (cause) {
      if (alive.current) {
        setMessage('');
        setError(uploaded.current
          ? "La foto se subió, pero no se confirmó el registro. Actualiza las fotos antes de reintentar para evitar duplicados."
          : cause instanceof Error ? cause.message : "No se pudo subir la foto.");
      }
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="heading">Agregar foto</Text>
      {busy && <ActivityIndicator accessibilityLabel="Procesando foto" color={colors.primary} />}
      <Text variant="small" color={colors.textMuted}>Fotografía el electrodoméstico o selecciona una imagen. Sube solo las fotos que quieras compartir en esta solicitud.</Text>
      {Platform.OS !== 'web' ? <Button label="Tomar foto" icon="camera" disabled={busy} onPress={() => void choose('camera')} /> : null}
      <Button label={Platform.OS === 'web' ? 'Elegir foto' : 'Elegir de la galería'} icon="images" variant="secondary" disabled={busy} onPress={() => void choose('gallery')} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.preview} accessibilityLabel="Vista previa del electrodoméstico" />}
      {photo && <Button label="Subir y guardar foto" loading={busy} onPress={() => void save()} />}
      {!!message && <Text variant="small" accessibilityLiveRegion="polite">{message}</Text>}
      {!!error && <Text variant="small" accessibilityRole="alert" color={colors.danger}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  collapsed: { padding: 12 },
  preview: { width: '100%', height: 220, resizeMode: 'contain' },
});
