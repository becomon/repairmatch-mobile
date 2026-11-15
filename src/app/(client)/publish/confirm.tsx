import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import { useDraft } from '@/features/requests/draft';
import { aiApi, listApplianceTypes } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, radius } from '@/shared/theme';
import { Banner, Button, Card, ErrorState, Icon, InfoRow, LoadingState, Screen, ScreenHeader, StepProgress, Text, TextField } from '@/shared/ui';

/** "Así entendimos tu problema": the local AI pre-fills the fields and the client confirms each one. */
export default function PublishConfirm() {
  const router = useRouter();
  const { draft, update } = useDraft();
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  const [failedFor, setFailedFor] = useState<string | null>(null);

  const description = draft.description.trim();
  const needsAnalysis = description.length > 0 && draft.structuredFor !== description && failedFor !== description;

  useEffect(() => {
    if (!needsAnalysis) return;
    let active = true;
    aiApi
      .structure(description)
      .then((result) => {
        if (!active) return;
        update({
          structuredFor: description,
          applianceTypeId: draft.applianceTypeId ?? result.applianceTypeId ?? null,
          brand: draft.brand || result.brand || '',
          model: draft.model || result.model || '',
          symptomLabel: result.symptom?.confident ? result.symptom.label : null,
        });
      })
      .catch(() => {
        if (active) setFailedFor(description);
      });
    return () => {
      active = false;
    };
    // The analysis depends only on the text; draft fields are read once when the result arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsAnalysis, description]);

  const valid = draft.applianceTypeId !== null && description.length > 0;

  return (
    <Screen
      header={<ScreenHeader title="Revisa tu solicitud" back fallbackHref="/home" />}
      footer={
        <View style={{ gap: 4 }}>
          <Button label="Sí, es correcto" onPress={() => router.push('/publish/photos')} disabled={!valid || needsAnalysis} />
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

      {needsAnalysis ? (
        <LoadingState label="Analizando tu descripción…" />
      ) : (
        <>
          {failedFor === description ? <Banner tone="warning" message="No pudimos analizar el texto. Completa los datos a mano, puedes continuar igual." /> : null}
          {description.length === 0 ? <Banner tone="warning" message="Aún no escribiste la descripción. Vuelve para agregarla." /> : null}

          <View style={{ gap: 8 }}>
            <Text variant="smallStrong" color={colors.textSoft}>Equipo</Text>
            {types.initialLoading ? (
              <LoadingState />
            ) : types.error && !types.data ? (
              <ErrorState error={types.error} onRetry={types.refetch} />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(types.data ?? []).map((t) => {
                  const selected = draft.applianceTypeId === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => update({ applianceTypeId: t.id })}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        minHeight: 48,
                        paddingHorizontal: 12,
                        borderRadius: radius.pill,
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primarySoft : colors.surface,
                      }}
                    >
                      <ApplianceTile name={t.name} size={32} />
                      <Text variant="bodyStrong" color={selected ? colors.primary : colors.text}>{t.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
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
