import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Role } from '@/shared/api/types';
import { colors, GUTTER } from '@/shared/theme';
import { EmptyState, ErrorState, FilterChip, Icon, LoadingState, SearchInput, Text } from '@/shared/ui';
import { ServiceCard } from './ServiceCard';
import { useServiceList } from './useServiceList';

export function ServiceList({ role }: { role: Role }) {
  const router = useRouter();
  const list = useServiceList();
  const { query, shown, filter } = list;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 24, gap: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={query.loading && !query.initialLoading} onRefresh={query.refetch} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <SearchInput
        label="Buscar servicios"
        value={list.search}
        onChangeText={list.setSearch}
        placeholder={role === 'CLIENT' ? 'Técnico o número de servicio' : 'Número de servicio o de solicitud'}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <FilterChip label={`En curso (${list.activeCount})`} selected={filter === 'ACTIVE'} onPress={() => list.setFilter('ACTIVE')} />
        <FilterChip label={`Finalizados (${list.doneCount})`} selected={filter === 'DONE'} onPress={() => list.setFilter('DONE')} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={list.sort === 'newest' ? 'Ordenar por más antiguos' : 'Ordenar por más recientes'}
        onPress={list.toggleSort}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
      >
        <Icon name="swap-vertical" size={18} color={colors.textMuted} />
        <Text variant="smallStrong" color={colors.textMuted}>{list.sort === 'newest' ? 'Más recientes primero' : 'Más antiguos primero'}</Text>
      </Pressable>

      {query.initialLoading ? (
        <LoadingState />
      ) : query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : shown.length === 0 ? (
        list.searching ? (
          <EmptyState icon="search-outline" title="Ningún servicio coincide" message="Prueba con otro nombre o número." actionLabel="Borrar búsqueda" onAction={() => list.setSearch('')} />
        ) : filter === 'ACTIVE' ? (
          <EmptyState
            icon="construct-outline"
            title="Sin servicios en curso"
            message={role === 'CLIENT' ? 'Cuando elijas una propuesta, el seguimiento aparecerá aquí.' : 'Cuando un cliente acepte tu propuesta, el servicio aparecerá aquí.'}
            actionLabel={role === 'CLIENT' ? 'Ver mis solicitudes' : 'Buscar casos'}
            onAction={() => router.push(role === 'CLIENT' ? '/requests' : '/cases')}
          />
        ) : (
          <EmptyState icon="checkmark-done-outline" title="Aún no hay servicios finalizados" message="Los servicios completados o cancelados se guardan aquí." actionLabel="Ver los que están en curso" onAction={() => list.setFilter('ACTIVE')} />
        )
      ) : (
        shown.map((s) => <ServiceCard key={s.id} service={s} role={role} onChanged={list.applyChange} onFailed={query.refetch} />)
      )}
    </ScrollView>
  );
}
