import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { friendlyError } from '@/shared/api/errors';
import { identityApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { httpUrl } from '@/shared/safeUrl';

/**
 * Identity status plus the action that starts a Didit session in the in-app browser
 * (`openBrowserAsync`: Didit returns to a web callback URL, not to an app scheme, so an auth
 * session cannot capture the redirect). The status is refetched when the browser closes, when the
 * app returns to the foreground and when the screen regains focus.
 */
export function useIdentityVerification() {
  const state = useApiQuery((signal) => identityApi.state({ signal }), [], { refetchOnFocus: true });
  const { busy, run } = useAsyncAction();
  const [error, setError] = useState('');
  const refetch = useRef(state.refetch);
  useEffect(() => {
    refetch.current = state.refetch;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') refetch.current();
    });
    return () => subscription.remove();
  }, []);

  const start = () =>
    run(async () => {
      setError('');
      try {
        const session = await identityApi.start();
        const url = httpUrl(session.url);
        if (!url) {
          setError('No pudimos abrir la verificación. Inténtalo de nuevo en unos minutos.');
          return;
        }
        await WebBrowser.openBrowserAsync(url);
        refetch.current();
      } catch (cause) {
        setError(friendlyError(cause));
      }
    });

  return { state, busy, error, start };
}
