import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTypePicker, usePublishAnalysis } from '@/features/requests';
import { colors, radius } from '@/shared/theme';
import { Banner, Button, Card, Icon, InfoRow, LoadingState, Screen, ScreenHeader, StepProgress, Text, TextField } from '@/shared/ui';

/** "Así entendimos tu problema": the local AI pre-fills the fields and the client confirms each one. */
export default function PublishConfirm() {
  const router = useRouter();
  const { draft, update, description, analysing, failed } = usePublishAnalysis();
  const valid = draft.applianceTypeId !== null && description.length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Revisa tu solicitud" back fallbackHref="/home" />}
      footer={
        <View style={{ gap: 4 }}>
          <Button label="Sí, es correcto" onPress={() => router.push('/publish/photos')} disabled={!valid || analysing} />
          <Button label="Volver a escribir la descripción" variant="ghost" onPress={() => router.push('/publish')} />
        </View>
      }
    >
      <StepProgress step={2} total={4} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill }}>
          <Icon name="sparkles" size={14} color={colors.primary} />
          <Text variant="caption" color={colors.primary}>Ordenado con IA</Text>
        </View>
        <Text variant="title">Así entendimos tu problema</Text>
        <Text variant="body" color={colors.textMuted}>
          Revisa y corrige si algo no va. No es un diagnóstico: solo ayuda a que te lleguen técnicos que reparan tu equipo.
        </Text>
      </View>

      {analysing ? (
        <LoadingState label="Analizando tu descripción…" />
      ) : (
        <>
          {failed ? <Banner tone="warning" message="No pudimos analizar el texto. Completa los datos a mano, puedes continuar igual." /> : null}
          {description.length === 0 ? <Banner tone="warning" message="Aún no escribiste la descripción. Vuelve para agregarla." /> : null}

          <View style={{ gap: 8 }}>
            <Text variant="smallStrong" color={colors.textSoft}>Equipo</Text>
            <ApplianceTypePicker layout="chips" value={draft.applianceTypeId} onChange={(applianceTypeId) => update({ applianceTypeId })} />
          </View>

          <TextField label="Marca" value={draft.brand} onChangeText={(brand) => update({ brand })} placeholder="Ej. Samsung" maxLength={100} />
          <TextField label="Modelo" value={draft.model} onChangeText={(model) => update({ model })} placeholder="Opcional" maxLength={100} />

          <Card style={{ gap: 12 }}>
            <InfoRow label="Síntoma" value={draft.symptomLabel ?? 'No identificado'} />
            <View style={{ gap: 4 }}>
              <Text variant="small" color={colors.textMuted}>Lo que escribiste (se guarda tal cual)</Text>
              <Text variant="body" color={colors.textSoft}>«{description}»</Text>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}
