import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { servicesApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { colors, GUTTER } from '@/shared/theme';
import { EmptyState, ErrorState, FilterChip, Icon, LoadingState, SearchInput, Text } from '@/shared/ui';
import { ServiceCard } from './ServiceCard';

type Filter = 'ACTIVE' | 'DONE';
type Sort = 'newest' | 'oldest';

const isActive = (s: Service) => s.status === 'PROGRAMADO' || s.status === 'EN_ATENCION';

/** GET /services is a plain array, so filtering, searching and sorting are done here. */
export function ServiceList({ role }: { role: Role }) {
  const router = useRouter();
  const query = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true });
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [sort, setSort] = useState<Sort>('newest');
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim().toLowerCase().replace(/^#/, ''), 250);
  // Status changes made from a card show instantly; they are discarded as soon as a fresh list arrives.
  const [local, setLocal] = useState<{ base: Service[] | undefined; changes: Record<number, Service> }>({ base: undefined, changes: {} });

  const changes = local.base === query.data ? local.changes : {};
  const all = (query.data ?? []).map((s) => changes[s.id] ?? s);
  const activeCount = all.filter(isActive).length;
  const doneCount = all.length - activeCount;

  const shown = all
    .filter((s) => (filter === 'ACTIVE' ? isActive(s) : !isActive(s)))
    .filter((s) => !term || String(s.id) === term || String(s.requestId) === term || s.technicianName.toLowerCase().includes(term))
    .sort((a, b) => {
      const order = a.createdAt.localeCompare(b.createdAt) || a.id - b.id;
      return sort === 'oldest' ? order : -order;
    });

  const searching = term.length > 0;
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 24, gap: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={query.loading && !query.initialLoading} onRefresh={query.refetch} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <SearchInput
        label="Buscar servicios"
        value={search}
        onChangeText={setSearch}
        placeholder={role === 'CLIENT' ? 'Técnico o número de servicio' : 'Número de servicio o de solicitud'}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <FilterChip label={`En curso (${activeCount})`} selected={filter === 'ACTIVE'} onPress={() => setFilter('ACTIVE')} />
        <FilterChip label={`Finalizados (${doneCount})`} selected={filter === 'DONE'} onPress={() => setFilter('DONE')} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sort === 'newest' ? 'Ordenar por más antiguos' : 'Ordenar por más recientes'}
        onPress={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
      >
        <Icon name="swap-vertical" size={18} color={colors.textMuted} />
        <Text variant="smallStrong" color={colors.textMuted}>{sort === 'newest' ? 'Más recientes primero' : 'Más antiguos primero'}</Text>
      </Pressable>

      {query.initialLoading ? (
        <LoadingState />
      ) : query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : shown.length === 0 ? (
        searching ? (
          <EmptyState icon="search-outline" title="Ningún servicio coincide" message="Prueba con otro nombre o número." actionLabel="Borrar búsqueda" onAction={() => setSearch('')} />
        ) : filter === 'ACTIVE' ? (
          <EmptyState
            icon="construct-outline"
            title="Sin servicios en curso"
            message={role === 'CLIENT' ? 'Cuando elijas una propuesta, el seguimiento aparecerá aquí.' : 'Cuando un cliente acepte tu propuesta, el servicio aparecerá aquí.'}
            actionLabel={role === 'CLIENT' ? 'Ver mis solicitudes' : 'Buscar casos'}
            onAction={() => router.push(role === 'CLIENT' ? '/requests' : '/cases')}
          />
        ) : (
          <EmptyState icon="checkmark-done-outline" title="Aún no hay servicios finalizados" message="Los servicios completados o cancelados se guardan aquí." actionLabel="Ver los que están en curso" onAction={() => setFilter('ACTIVE')} />
        )
      ) : (
        shown.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            role={role}
            onChanged={(updated) => setLocal({ base: query.data, changes: { ...changes, [updated.id]: updated } })}
          />
        ))
      )}
    </ScrollView>
  );
}
