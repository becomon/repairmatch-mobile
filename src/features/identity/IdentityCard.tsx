import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { friendlyError } from '@/shared/api/errors';
import { identityApi } from '@/shared/api/endpoints';
import type { IdentityStatus } from '@/shared/api/types';
import { formatDay } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpUrl } from '@/shared/safeUrl';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, ErrorState, IdentityPill, Icon, LoadingState, Text, type IconName } from '@/shared/ui';

interface Copy {
  title: string;
  text: string;
  icon: IconName;
  fg: string;
  bg: string;
  action?: string;
}

const COPY: Record<IdentityStatus, Copy> = {
  NOT_STARTED: {
    title: 'Aún no verificas tu identidad',
    text: 'Es opcional y toma pocos minutos. La insignia de identidad verificada le dice a los demás que eres una persona real.',
    icon: 'shield-outline',
    fg: colors.textSoft,
    bg: colors.surface2,
    action: 'Verificar mi identidad',
  },
  PENDING: {
    title: 'Verificación en revisión',
    text: 'Estamos revisando tu verificación. Puede tardar unos minutos; mientras tanto puedes seguir usando RepairMatch.',
    icon: 'time-outline',
    fg: colors.warning,
    bg: colors.warningSoft,
    action: 'Continuar verificación',
  },
  VERIFIED: {
    title: 'Identidad verificada',
    text: 'Listo: tu perfil muestra la insignia de identidad verificada.',
    icon: 'shield-checkmark',
    fg: colors.freshStrong,
    bg: colors.freshSoft,
  },
  REJECTED: {
    title: 'No pudimos verificar tu identidad',
    text: 'La verificación no fue aprobada. Puedes intentarlo de nuevo con un documento vigente y buena luz.',
    icon: 'alert-circle-outline',
    fg: colors.danger,
    bg: colors.dangerSoft,
    action: 'Intentar de nuevo',
  },
};

/**
 * "Verificación de identidad" for any account: a soft trust layer that never blocks the app.
 * The button creates a Didit session on the server and opens the hosted page in the in-app browser
 * (`openBrowserAsync`: Didit returns to the web callback URL, not to an app scheme, so an auth
 * session cannot capture the redirect). The status is refetched when the browser closes, when the
 * app returns to the foreground and when the screen regains focus.
 */
export function IdentityCard() {
  const state = useApiQuery((signal) => identityApi.state({ signal }), [], { refetchOnFocus: true });
  const [busy, setBusy] = useState(false);
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

  async function start() {
    setBusy(true);
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
    } finally {
      setBusy(false);
    }
  }

  const current = state.data;
  const copy = current ? COPY[current.status] : undefined;

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text variant="heading" accessibilityRole="header">Verificación de identidad</Text>
        {current?.status === 'VERIFIED' ? <IdentityPill /> : null}
      </View>

      {state.initialLoading ? (
        <LoadingState />
      ) : !current || !copy ? (
        <ErrorState error={state.error} onRetry={state.refetch} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: copy.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={copy.icon} size={22} color={copy.fg} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{copy.title}</Text>
              <Text variant="small" color={colors.textMuted}>{copy.text}</Text>
              {current.status === 'VERIFIED' && current.verifiedAt ? (
                <Text variant="small" color={colors.textMuted}>Verificada el {formatDay(current.verifiedAt)}</Text>
              ) : null}
            </View>
          </View>
          {error ? <Banner tone="danger" message={error} /> : null}
          {copy.action ? <Button label={copy.action} icon="shield-checkmark-outline" loading={busy} onPress={() => void start()} /> : null}
          {current.status === 'PENDING' ? <Button label="Actualizar estado" variant="secondary" icon="refresh-outline" onPress={state.refetch} /> : null}
          <Text variant="small" color={colors.textMuted}>
            No guardamos fotos de tu documento ni datos biométricos: solo si quedaste verificado o no.
          </Text>
        </>
      )}
    </Card>
  );
}
