import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { friendlyError } from '@/shared/api/errors';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useDraft } from './draft';
import { publishDraft, type PublishResult } from './publish';

/** Last step of the publish flow: creates the request once, however many times the button is tapped. */
export function usePublishSubmit() {
  const router = useRouter();
  const { draft, reset } = useDraft();
  const { busy, run } = useAsyncAction();
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  // Once the request exists, retrying must only navigate: publishing again would create a duplicate.
  const created = useRef<PublishResult | null>(null);

  function finish(result: PublishResult) {
    reset();
    router.replace({ pathname: '/request/[id]', params: { id: String(result.request.id), photosFailed: String(result.failedPhotos) } });
  }

  const publish = () =>
    run(async () => {
      setError('');
      if (created.current) return finish(created.current);
      try {
        const result = await publishDraft(draft, setProgress);
        created.current = result;
        finish(result);
      } catch (cause) {
        setError(friendlyError(cause));
      } finally {
        setProgress('');
      }
    });

  return { draft, busy, progress, error, publish };
}
