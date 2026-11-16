import type { RecommendedProposal } from '@/shared/api/types';

export type ProposalSort = 'recommended' | 'cost' | 'rating' | 'soonest';

export const PROPOSAL_SORTS: { value: ProposalSort; label: string }[] = [
  { value: 'recommended', label: 'Recomendado' },
  { value: 'cost', label: 'Menor costo' },
  { value: 'rating', label: 'Mejor calificado' },
  { value: 'soonest', label: 'Más pronto' },
];

/** The API already sends the best score first, so "recommended" keeps its order. */
export function sortProposals(items: RecommendedProposal[], sort: ProposalSort): RecommendedProposal[] {
  const copy = [...items];
  switch (sort) {
    case 'cost':
      return copy.sort((a, b) => a.proposal.diagnosticCost - b.proposal.diagnosticCost);
    case 'rating':
      return copy.sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
    case 'soonest':
      return copy.sort((a, b) => a.proposal.availableAt.localeCompare(b.proposal.availableAt));
    default:
      return copy;
  }
}
