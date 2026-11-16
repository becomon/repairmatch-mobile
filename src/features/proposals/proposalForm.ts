import type { CreateProposalBody } from '@/shared/api/types';
import { toLocalDateTime, WEEKDAYS } from '@/shared/format';

/** Hours of the day a technician can offer to show up. */
export const PROPOSAL_HOURS = [8, 10, 12, 14, 16, 18];
/** How many days ahead (today included) a visit can be scheduled. */
const SCHEDULE_DAYS = 7;
export const MAX_DIAGNOSTIC_COST = 99_999_999;
export const MAX_CONDITIONS_CHARS = 1000;

export interface ScheduleDay {
  offset: number;
  date: Date;
  label: string;
}

function dayLabel(offset: number, date: Date): string {
  if (offset === 0) return 'Hoy';
  if (offset === 1) return 'Mañana';
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

export function scheduleDays(base: Date): ScheduleDay[] {
  return Array.from({ length: SCHEDULE_DAYS }, (_, offset) => {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    return { offset, date, label: dayLabel(offset, date) };
  });
}

/** "30" and "30,5" both work; anything else is NaN. */
export function parseCost(text: string): number {
  const normalized = text.trim().replace(',', '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

/** Moment of the visit: the chosen day at the chosen hour. */
export function scheduledAt(day: ScheduleDay, hour: number): Date {
  return new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), hour, 0, 0);
}

/** An hour that already passed today cannot be offered. */
export function isPastHour(day: ScheduleDay, hour: number, now: Date): boolean {
  return day.offset === 0 && hour <= now.getHours();
}

export interface ProposalErrors {
  cost?: string;
  when?: string;
  conditions?: string;
}

export interface ProposalInput {
  cost: string;
  day: ScheduleDay;
  hour: number;
  conditions: string;
}

/** Validates the form like the API will (cost >= 0, future date, conditions required). */
export function validateProposal(input: ProposalInput, now: Date = new Date()): { errors: ProposalErrors; body: CreateProposalBody | null } {
  const amount = parseCost(input.cost);
  const at = scheduledAt(input.day, input.hour);
  const errors: ProposalErrors = {};
  if (!Number.isFinite(amount) || amount < 0) errors.cost = 'Escribe un costo válido, por ejemplo 30.';
  else if (amount > MAX_DIAGNOSTIC_COST) errors.cost = 'El costo es demasiado alto.';
  if (at.getTime() <= now.getTime()) errors.when = 'Elige un horario que aún no pasó.';
  const conditions = input.conditions.trim();
  if (conditions === '') errors.conditions = 'Cuéntale al cliente qué incluye tu visita.';
  if (Object.keys(errors).length > 0) return { errors, body: null };
  return {
    errors,
    body: { diagnosticCost: Math.round(amount * 100) / 100, availableAt: toLocalDateTime(at), conditions },
  };
}
