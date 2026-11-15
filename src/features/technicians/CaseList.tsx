import { useRouter } from 'expo-router';
import { ApiError } from '@/shared/api/errors';
import type { PagedList } from '@/shared/hooks/usePagedList';
import { EmptyState, PagedListView } from '@/shared/ui';

interface Props<T> {
  list: PagedList<T>;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  header?: React.ReactElement;
}

/**
 * Opportunity lists answer 400/404/409 until the technician has a profile and a service area,
 * so those errors become a guided empty state instead of a generic failure.
 */
export function CaseList<T>({ list, renderItem, keyExtractor, header }: Props<T>) {
  const router = useRouter();
  const needsSetup = list.error instanceof ApiError && [400, 404, 409].includes(list.error.status) && list.items.length === 0;
  if (needsSetup) {
    return (
      <>
        {header}
        <EmptyState
          icon="person-circle-outline"
          title="Completa tu perfil para recibir casos"
          message="Indica los equipos que reparas y tu zona de atención. Con eso te mostramos los casos que puedes tomar."
          actionLabel="Ir a mi perfil"
          onAction={() => router.push('/account')}
        />
      </>
    );
  }
  return (
    <PagedListView
      list={list}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      header={header}
      empty={{
        icon: 'search-outline',
        title: 'No hay casos por ahora',
        message: 'Cuando un cliente publique una falla dentro de tu radio, aparecerá aquí. Ampliar tu radio de atención te muestra más casos.',
        actionLabel: 'Ajustar mi radio',
        onAction: () => router.push('/account'),
      }}
    />
  );
}
