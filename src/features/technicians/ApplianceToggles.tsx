import { Pressable, View } from 'react-native';
import { ApplianceTile, applianceLabel } from '@/features/catalog';
import type { ApplianceType } from '@/shared/api/types';
import { colors, radius } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';

interface Props {
  types: ApplianceType[];
  selected: number[];
  onToggle: (id: number) => void;
}

/** "Qué reparas": the appliance types the technician serves, as checkable pills. */
export function ApplianceToggles({ types, selected, onToggle }: Props) {
  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityLabel="Equipos que reparas">
        {types.map((t) => {
          const on = selected.includes(t.id);
          return (
            <Pressable
              key={t.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={applianceLabel(t.name)}
              onPress={() => onToggle(t.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                minHeight: 48,
                paddingLeft: 8,
                paddingRight: 14,
                borderRadius: radius.pill,
                borderWidth: on ? 2 : 1,
                borderColor: on ? colors.primary : colors.border,
                backgroundColor: on ? colors.primarySoft : colors.surface,
              }}
            >
              <ApplianceTile name={t.name} size={32} />
              <Text variant="smallStrong" color={on ? colors.primary : colors.text}>{applianceLabel(t.name)}</Text>
              {on ? <Icon name="checkmark-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
      {selected.length === 0 ? <Text variant="small" color={colors.textMuted}>Marca al menos un equipo para que te lleguen casos.</Text> : null}
    </>
  );
}
