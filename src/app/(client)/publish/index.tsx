import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import { useDraft } from '@/features/requests/draft';
import { listApplianceTypes } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, radius } from '@/shared/theme';
import { Button, ErrorState, Icon, LoadingState, Screen, ScreenHeader, StepProgress, Text, TextField } from '@/shared/ui';

const MIN_CHARS = 10;

export default function PublishDescribe() {
  const router = useRouter();
  const { draft, update } = useDraft();
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  const valid = draft.applianceTypeId !== null && draft.description.trim().length >= MIN_CHARS;

  return (
    <Screen
      header={<ScreenHeader title="Nueva solicitud" back fallbackHref="/home" />}
      footer={<Button label="Continuar" onPress={() => router.push('/publish/confirm')} disabled={!valid} />}
    >
      <StepProgress step={1} total={4} />
      <View style={{ gap: 4 }}>
        <Text variant="title">¿Qué se malogró?</Text>
        <Text variant="body" color={colors.textMuted}>Elige tu equipo y cuéntanos qué pasa con tus palabras.</Text>
      </View>

      {types.initialLoading ? (
        <LoadingState />
      ) : types.error && !types.data ? (
        <ErrorState error={types.error} onRetry={types.refetch} />
      ) : (
        <View style={{ gap: 8 }} accessibilityRole="radiogroup">
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
                  gap: 12,
                  padding: 12,
                  minHeight: 64,
                  borderRadius: radius.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                }}
              >
                <ApplianceTile name={t.name} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t.name}</Text>
                  {t.description ? <Text variant="small" color={colors.textMuted} numberOfLines={1}>{t.description}</Text> : null}
                </View>
                <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      )}

      <TextField
        label="Describe la falla"
        value={draft.description}
        onChangeText={(description) => update({ description })}
        placeholder="Ej. Mi lavadora LG no centrifuga y deja la ropa empapada."
        multiline
        maxLength={5000}
        hint={draft.description.trim().length < MIN_CHARS ? `Escribe al menos ${MIN_CHARS} caracteres.` : undefined}
      />
    </Screen>
  );
}
