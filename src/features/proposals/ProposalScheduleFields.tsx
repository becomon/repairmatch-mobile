import { ScrollView, View } from 'react-native';
import { colors, GUTTER } from '@/shared/theme';
import { FilterChip, Text } from '@/shared/ui';
import { isPastHour, PROPOSAL_HOURS, type ScheduleDay } from './proposalForm';

interface Props {
  days: ScheduleDay[];
  dayOffset: number;
  hour: number;
  onDayChange: (offset: number) => void;
  onHourChange: (hour: number) => void;
  error?: string | undefined;
}

const rowStyle = { marginHorizontal: -GUTTER, flexGrow: 0 } as const;
const rowContent = { gap: 8, paddingHorizontal: GUTTER } as const;

/** "Puedo ir": the day and the hour the technician offers to show up. */
export function ProposalScheduleFields({ days, dayOffset, hour, onDayChange, onHourChange, error }: Props) {
  const now = new Date();
  const day = days[dayOffset]!;
  return (
    <View style={{ gap: 8 }}>
      <Text variant="smallStrong" color={colors.textSoft}>Puedo ir</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rowContent} style={rowStyle}>
        {days.map((d) => (
          <FilterChip key={d.offset} label={d.label} selected={dayOffset === d.offset} onPress={() => onDayChange(d.offset)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rowContent} style={rowStyle}>
        {PROPOSAL_HOURS.map((h) => (
          <FilterChip key={h} label={`${h}:00`} selected={hour === h} disabled={isPastHour(day, h, now)} onPress={() => onHourChange(h)} />
        ))}
      </ScrollView>
      {error ? <Text variant="small" color={colors.danger}>{error}</Text> : null}
    </View>
  );
}
