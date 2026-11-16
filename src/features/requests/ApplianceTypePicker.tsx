import { Pressable, View } from 'react-native';
import { ApplianceTile, applianceLabel, useApplianceTypes } from '@/features/catalog';
import { colors, radius } from '@/shared/theme';
import { ErrorState, Icon, LoadingState, Text } from '@/shared/ui';

interface Props {
  value: number | null;
  onChange: (id: number) => void;
  /** `list`: one row per type with a radio. `chips`: compact pills. */
  layout: 'list' | 'chips';
}

/** Picks the appliance type of a request from the catalog. */
export function ApplianceTypePicker({ value, onChange, layout }: Props) {
  const types = useApplianceTypes();
  if (types.initialLoading) return <LoadingState />;
  if (types.error && !types.data) return <ErrorState error={types.error} onRetry={types.refetch} />;

  const items = types.data ?? [];
  if (layout === 'chips') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((t) => {
          const selected = value === t.id;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(t.id)}
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
              <Text variant="bodyStrong" color={selected ? colors.primary : colors.text}>{applianceLabel(t.name)}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }} accessibilityRole="radiogroup">
      {items.map((t) => {
        const selected = value === t.id;
        return (
          <Pressable
            key={t.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(t.id)}
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
              <Text variant="bodyStrong">{applianceLabel(t.name)}</Text>
            </View>
            <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}
