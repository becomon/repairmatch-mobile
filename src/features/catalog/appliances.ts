import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';

export type ApplianceIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ApplianceVisual {
  /** Catalog key, stable across languages. */
  kind: ApplianceKind;
  /** Spanish label shown to the user. */
  label: string;
  icon: ApplianceIconName;
  fg: string;
  bg: string;
}

export type ApplianceKind =
  | 'air-conditioner'
  | 'microwave'
  | 'oven'
  | 'washer'
  | 'fridge'
  | 'dishwasher'
  | 'dryer'
  | 'other';

interface Rule {
  kind: ApplianceKind;
  /** Matches the folded catalog name (lowercase, no accents), in English or Spanish. */
  test: RegExp;
  label: string;
  icon: ApplianceIconName;
  fg: string;
  bg: string;
}

// Same names the web app uses (src/features/requests/applianceLabel.ts), so both clients agree.
// The backend still sends the catalog in English until the 2-type Spanish catalog lands.
const RULES: Rule[] = [
  { kind: 'air-conditioner', test: /air.?condition|aire|clima/, label: 'Aire acondicionado', icon: 'air-conditioner', fg: colors.teal, bg: '#dff3f1' },
  { kind: 'microwave', test: /micro/, label: 'Microondas', icon: 'microwave', fg: colors.accentDark, bg: colors.accentSoft },
  { kind: 'dishwasher', test: /dishwasher|lavavaj/, label: 'Lavavajillas', icon: 'dishwasher', fg: colors.primary, bg: colors.primarySoft },
  { kind: 'washer', test: /washing|washer|lavad/, label: 'Lavadora', icon: 'washing-machine', fg: colors.primary, bg: colors.primarySoft },
  { kind: 'dryer', test: /dryer|secad/, label: 'Secadora', icon: 'tumble-dryer', fg: colors.warning, bg: colors.warningSoft },
  { kind: 'fridge', test: /refri|fridge|nevera|frigor/, label: 'Refrigeradora', icon: 'fridge', fg: '#c24a0c', bg: colors.accentSoft },
  { kind: 'oven', test: /oven|horno|stove|cocina/, label: 'Horno', icon: 'stove', fg: colors.danger, bg: colors.dangerSoft },
];

const FALLBACK: Omit<ApplianceVisual, 'label'> = {
  kind: 'other',
  icon: 'wrench',
  fg: colors.textSoft,
  bg: colors.neutralSoft,
};

function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Icon, colours and Spanish label for a catalog name. Unknown names keep their raw text. */
export function applianceVisual(name: string): ApplianceVisual {
  const key = fold(name);
  const rule = RULES.find((r) => r.test.test(key));
  if (rule) return { kind: rule.kind, label: rule.label, icon: rule.icon, fg: rule.fg, bg: rule.bg };
  return { ...FALLBACK, label: name.trim() || 'Equipo' };
}

/** Spanish display name for a catalog type; falls back to the raw name. */
export function applianceLabel(name: string): string {
  return applianceVisual(name).label;
}

/** "Lavadora Samsung" style title for a request or opportunity. */
export function applianceTitle(name: string, brand?: string | null): string {
  const label = applianceLabel(name);
  return brand ? `${label} ${brand}` : label;
}
