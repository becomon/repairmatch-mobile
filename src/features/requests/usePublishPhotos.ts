import { useState } from 'react';
import { pickPhoto, type PhotoSource } from '@/features/evidences';
import { friendlyError } from '@/shared/api/errors';
import { MAX_PHOTOS } from '@/shared/constants';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useDraft } from './draft';

/** Photo step of the publish flow: add from camera or gallery, remove, up to `MAX_PHOTOS`. */
export function usePublishPhotos() {
  const { draft, update } = useDraft();
  const { busy, run } = useAsyncAction();
  const [error, setError] = useState('');
  const full = draft.photos.length >= MAX_PHOTOS;

  const add = (source: PhotoSource) =>
    run(async () => {
      setError('');
      try {
        const photo = await pickPhoto(source);
        if (photo) update((d) => ({ photos: d.photos.length < MAX_PHOTOS ? [...d.photos, photo] : d.photos }));
      } catch (cause) {
        setError(friendlyError(cause));
      }
    });

  const remove = (index: number) => update((d) => ({ photos: d.photos.filter((_, i) => i !== index) }));

  return { photos: draft.photos, full, busy, error, add, remove };
}
