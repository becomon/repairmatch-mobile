import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { servicesApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, GUTTER } from '@/shared/theme';
import { EmptyState, ErrorState, FilterChip, LoadingState } from '@/shared/ui';
import { ServiceCard } from './ServiceCard';

type Filter = 'ACTIVE' | 'DONE';

/** GET /services is a plain array, so filtering by active/finished is done here. */
export function ServiceList({ role }: { role: Role }) {
  const router = useRouter();
  const query = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true });
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [overrides, setOverrides] = useState<Record<number, Service>>({});

  const items = (query.data ?? []).map((s) => overrides[s.id] ?? s);
  const shown = items.filter((s) => (filter === 'ACTIVE' ? s.status === 'PROGRAMADO' || s.status === 'EN_ATENCION' : s.status === 'COMPLETADO' || s.status === 'CANCELADO'));

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 24, gap: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={query.loading && !query.initialLoading} onRefresh={query.refetch} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <FilterChip label="En curso" selected={filter === 'ACTIVE'} onPress={() => setFilter('ACTIVE')} />
        <FilterChip label="Finalizados" selected={filter === 'DONE'} onPress={() => setFilter('DONE')} />
      </View>
      {query.initialLoading ? (
        <LoadingState />
      ) : query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : shown.length === 0 ? (
        filter === 'ACTIVE' ? (
          <EmptyState
            icon="construct-outline"
            title="Sin servicios en curso"
            message={role === 'CLIENT' ? 'Cuando elijas una propuesta, el seguimiento aparecerá aquí.' : 'Cuando un cliente acepte tu propuesta, el servicio aparecerá aquí.'}
            actionLabel={role === 'CLIENT' ? 'Ver mis solicitudes' : 'Buscar casos'}
            onAction={() => router.push(role === 'CLIENT' ? '/requests' : '/cases')}
          />
        ) : (
          <EmptyState icon="checkmark-done-outline" title="Aún no hay servicios finalizados" message="Los servicios completados o cancelados se guardan aquí." />
        )
      ) : (
        shown.map((s) => (
          <ServiceCard key={s.id} service={s} role={role} onChanged={(updated) => setOverrides((o) => ({ ...o, [updated.id]: updated }))} />
        ))
      )}
    </ScrollView>
  );
}
