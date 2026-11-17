import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { REQUEST_STATUS_LABEL, RequestCard } from '@/features/requests';
import { requestsApi } from '@/shared/api/endpoints';
import type { RequestStatus } from '@/shared/api/types';
import { LIST_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/shared/constants';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { colors, GUTTER, TOUCH } from '@/shared/theme';
import { FilterChip, Icon, PagedListView, Screen, ScreenHeader, SearchInput, Text } from '@/shared/ui';

const FILTERS: { label: string; value: RequestStatus | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: REQUEST_STATUS_LABEL.CON_PROPUESTAS, value: 'CON_PROPUESTAS' },
  { label: REQUEST_STATUS_LABEL.PUBLICADA, value: 'PUBLICADA' },
  { label: REQUEST_STATUS_LABEL.CERRADA, value: 'CERRADA' },
  { label: REQUEST_STATUS_LABEL.CANCELADA, value: 'CANCELADA' },
];

export default function RequestsTab() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RequestStatus | undefined>(undefined);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const query = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);

  const list = usePagedList(
    (page, signal) => requestsApi.list({ page, size: LIST_PAGE_SIZE, status, search: query || undefined, sort }, { signal }),
    [status, query, sort],
    { refetchOnFocus: true },
  );

  const filtered = !!status || !!query;
  return (
    <Screen
      scroll={false}
      inTabs
      header={
        <ScreenHeader
          title="Mis solicitudes"
          subtitle={list.total > 0 || filtered ? `${list.total} en total` : undefined}
          right={
            <Pressable accessibilityRole="button" accessibilityLabel="Nueva solicitud" onPress={() => router.push('/publish')} style={{ width: TOUCH, height: TOUCH, marginLeft: 8, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="add" size={26} color={colors.white} />
            </Pressable>
          }
        />
      }
    >
      <PagedListView
        list={list}
        keyExtractor={(r) => String(r.id)}
        renderItem={(r) => <RequestCard request={r} />}
        header={
          <View style={{ gap: 12, paddingBottom: 12 }}>
            <SearchInput label="Buscar solicitudes" value={search} onChangeText={setSearch} placeholder="Marca, modelo o falla" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: GUTTER }}>
              {FILTERS.map((f) => (
                <FilterChip key={f.label} label={f.label} selected={status === f.value} onPress={() => setStatus(f.value)} />
              ))}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={sort === 'newest' ? 'Ordenar por más antiguas' : 'Ordenar por más recientes'}
              onPress={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
            >
              <Icon name="swap-vertical" size={18} color={colors.textMuted} />
              <Text variant="smallStrong" color={colors.textMuted}>{sort === 'newest' ? 'Más recientes primero' : 'Más antiguas primero'}</Text>
            </Pressable>
          </View>
        }
        empty={
          filtered
            ? { icon: 'search-outline', title: 'Sin resultados', message: 'Ninguna solicitud coincide con tu búsqueda o filtro.', actionLabel: 'Ver todas', onAction: () => { setSearch(''); setStatus(undefined); } }
            : { icon: 'construct-outline', title: 'Aún no tienes solicitudes', message: 'Cuéntanos qué se malogró y recibe propuestas de técnicos cercanos.', actionLabel: 'Publicar solicitud', onAction: () => router.push('/publish') }
        }
      />
    </Screen>
  );
}
