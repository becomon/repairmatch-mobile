import { useEffect, useState } from 'react';
import { aiApi } from '@/shared/api/endpoints';
import { useDraft } from './draft';

/**
 * "Así entendimos tu problema": asks the local AI once per description and pre-fills the draft.
 * The client confirms every field afterwards, so a failed analysis never blocks the flow.
 */
export function usePublishAnalysis() {
  const { draft, update } = useDraft();
  const [failedFor, setFailedFor] = useState<string | null>(null);

  const description = draft.description.trim();
  const analysing = description.length > 0 && draft.structuredFor !== description && failedFor !== description;

  useEffect(() => {
    if (!analysing) return;
    let active = true;
    aiApi
      .structure(description)
      .then((result) => {
        if (!active) return;
        // Functional update: whatever the client typed in the meantime wins over the AI guess.
        update((d) => ({
          structuredFor: description,
          applianceTypeId: d.applianceTypeId ?? result.applianceTypeId ?? null,
          brand: d.brand || result.brand || '',
          model: d.model || result.model || '',
          symptomLabel: result.symptom?.confident ? result.symptom.label : null,
        }));
      })
      .catch(() => {
        if (active) setFailedFor(description);
      });
    return () => {
      active = false;
    };
  }, [analysing, description, update]);

  return { draft, update, description, analysing, failed: failedFor === description };
}
