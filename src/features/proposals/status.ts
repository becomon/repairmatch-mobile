import { tones, type Tone } from '@/shared/ui';
import type { ProposalStatus } from '@/shared/api/types';

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'No elegida',
};

export const PROPOSAL_STATUS_TONE: Record<ProposalStatus, Tone> = {
  PENDING: tones.primarySoft,
  ACCEPTED: tones.fresh,
  REJECTED: tones.neutral,
};
