import { useState } from 'react';
import { useRouter } from 'expo-router';
import { aiApi } from '@/shared/api/endpoints';
import { AI_SEARCH_DEBOUNCE_MS, AI_SEARCH_PAGE_SIZE, MIN_DESCRIPTION_CHARS, MIN_SEARCH_CHARS } from '@/shared/constants';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDraft } from './draft';

/** Natural-language search over the client's own requests, with the chips the local model understood. */
export function useRequestSearch(initialText: string) {
  const router = useRouter();
  const { reset, update } = useDraft();
  const [text, setText] = useState(initialText);
  const query = useDebounce(text.trim(), AI_SEARCH_DEBOUNCE_MS);
  const enabled = query.length >= MIN_SEARCH_CHARS;
  const search = useApiQuery((signal) => aiApi.search(query, 0, AI_SEARCH_PAGE_SIZE, { signal }), [query], { enabled });

  return {
    text,
    setText,
    enabled,
    search,
    results: search.data?.results.content ?? [],
    canPublish: text.trim().length >= MIN_DESCRIPTION_CHARS,
    /** Starts a new request with what was typed already analysed in the next step. */
    publishNew: () => {
      reset();
      update({ description: text.trim() });
      router.push('/publish/confirm');
    },
  };
}
