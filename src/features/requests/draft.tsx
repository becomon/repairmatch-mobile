import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { PickedLocation } from '@/shared/location';

/** Everything the publish flow collects before the request exists on the server. */
export interface PublishDraft {
  applianceTypeId: number | null;
  description: string;
  brand: string;
  model: string;
  /** Local photos, uploaded after the request is created (evidences need a request id). */
  photos: ImagePickerAsset[];
  location: PickedLocation | null;
  /** Description that was already analysed, so going back does not repeat the AI call. */
  structuredFor: string | null;
  symptomLabel: string | null;
}

const EMPTY: PublishDraft = {
  applianceTypeId: null,
  description: '',
  brand: '',
  model: '',
  photos: [],
  location: null,
  structuredFor: null,
  symptomLabel: null,
};

/** A patch, or a function of the latest draft (use it after an `await`, when a captured draft is stale). */
type DraftPatch = Partial<PublishDraft> | ((draft: PublishDraft) => Partial<PublishDraft>);

interface DraftContextValue {
  draft: PublishDraft;
  update: (patch: DraftPatch) => void;
  reset: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<PublishDraft>(EMPTY);
  const update = useCallback(
    (patch: DraftPatch) => setDraft((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) })),
    [],
  );
  const reset = useCallback(() => setDraft(EMPTY), []);
  const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used inside DraftProvider');
  return ctx;
}
