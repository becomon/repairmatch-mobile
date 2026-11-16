import { Pressable, View } from 'react-native';
import type { Role } from '@/shared/api/types';
import { colors, radius } from '@/shared/theme';
import { Icon, Text, type IconName } from '@/shared/ui';

const ROLES: { value: Role; title: string; text: string; icon: IconName }[] = [
  { value: 'CLIENT', title: 'Necesito un técnico', text: 'Publica tu falla y compara propuestas.', icon: 'home-outline' },
  { value: 'TECHNICIAN', title: 'Soy técnico', text: 'Recibe casos cerca de ti y envía propuestas.', icon: 'construct-outline' },
];

/** "¿Cómo vas a usar RepairMatch?": the account type chosen at sign-up. */
export function RolePicker({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="smallStrong" color={colors.textSoft}>¿Cómo vas a usar RepairMatch?</Text>
      {ROLES.map((r) => {
        const selected = r.value === value;
        return (
          <Pressable
            key={r.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(r.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              minHeight: 64,
              borderRadius: radius.lg,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? colors.primarySoft : colors.surface,
            }}
          >
            <Icon name={r.icon} size={26} color={selected ? colors.primary : colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{r.title}</Text>
              <Text variant="small" color={colors.textMuted}>{r.text}</Text>
            </View>
            <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}
