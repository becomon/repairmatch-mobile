import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTypePicker, useDraft } from '@/features/requests';
import { MAX_DESCRIPTION_CHARS, MIN_DESCRIPTION_CHARS } from '@/shared/constants';
import { colors } from '@/shared/theme';
import { Button, Screen, ScreenHeader, StepProgress, Text, TextField } from '@/shared/ui';

export default function PublishDescribe() {
  const router = useRouter();
  const { draft, update } = useDraft();
  const valid = draft.applianceTypeId !== null && draft.description.trim().length >= MIN_DESCRIPTION_CHARS;

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

      <ApplianceTypePicker layout="list" value={draft.applianceTypeId} onChange={(applianceTypeId) => update({ applianceTypeId })} />

      <TextField
        label="Describe la falla"
        value={draft.description}
        onChangeText={(description) => update({ description })}
        placeholder="Ej. Mi lavadora LG no centrifuga y deja la ropa empapada."
        multiline
        maxLength={MAX_DESCRIPTION_CHARS}
        hint={draft.description.trim().length < MIN_DESCRIPTION_CHARS ? `Escribe al menos ${MIN_DESCRIPTION_CHARS} caracteres.` : undefined}
      />
    </Screen>
  );
}
