import { View } from 'react-native';
import { MAX_DESCRIPTION_CHARS } from '@/shared/constants';
import { colors, radius } from '@/shared/theme';
import { AiSearchBox, Button, Card, Icon, Text } from '@/shared/ui';

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  canAnalyse: boolean;
  canSearch: boolean;
  onAnalyse: () => void;
  onSearch: () => void;
}

/** "Cuéntanos la falla": free text that the local AI turns into a request, or searches among the client's own. */
export function HomeIntentCard({ text, onChangeText, canAnalyse, canSearch, onAnalyse, onSearch }: Props) {
  return (
    <Card glow style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={20} color={colors.primary} />
        <Text variant="bodyStrong" style={{ flex: 1 }}>Cuéntanos la falla</Text>
        <View style={{ backgroundColor: colors.freshSoft, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text variant="caption" color={colors.freshStrong}>IA</Text>
        </View>
      </View>
      <AiSearchBox
        label="Descripción"
        value={text}
        onChangeText={onChangeText}
        placeholder="ej. 'Mi lavadora hace ruido y no bota agua'"
        multiline
        maxLength={MAX_DESCRIPTION_CHARS}
      />
      <Button label="Entender mi problema" icon="sparkles" sweep onPress={onAnalyse} disabled={!canAnalyse} accessibilityHint="Prepara tu solicitud con la descripción" />
      <Button label="Buscar en mis solicitudes" icon="search" variant="ghost" onPress={onSearch} disabled={!canSearch} />
    </Card>
  );
}
