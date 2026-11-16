import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PagedList } from '../hooks/usePagedList';
import { colors, GUTTER } from '../theme';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { Text } from './Text';
import { Reveal } from './Reveal';

interface Props<T> {
  list: PagedList<T>;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  empty: { title: string; message: string; actionLabel?: string; onAction?: () => void; icon?: React.ComponentProps<typeof EmptyState>['icon'] };
  header?: React.ReactElement;
  inTabs?: boolean;
}

/** FlatList with the four states every list needs: loading, error with retry, empty and "load more". */
export function PagedListView<T>({ list, renderItem, keyExtractor, empty, header, inTabs = true }: Props<T>) {
  const insets = useSafeAreaInsets();
  const showError = !!list.error && list.items.length === 0;
  return (
    <FlatList
      data={list.items}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (index < 6 ? <Reveal index={index}>{renderItem(item)}</Reveal> : renderItem(item))}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={[styles.content, { paddingBottom: (inTabs ? 0 : insets.bottom) + 24 }]}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      onEndReached={list.loadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        list.initialLoading ? (
          <LoadingState />
        ) : showError ? (
          <ErrorState error={list.error} onRetry={list.refresh} />
        ) : (
          <EmptyState {...empty} />
        )
      }
      ListFooterComponent={
        list.loadingMore ? (
          <View style={styles.footer}><ActivityIndicator color={colors.primary} /></View>
        ) : list.loadMoreError ? (
          <View style={styles.footer}>
            <Text variant="small" color={colors.textMuted}>No pudimos cargar más resultados.</Text>
            <Button label="Reintentar" variant="secondary" compact onPress={list.loadMore} />
          </View>
        ) : list.items.length > 0 && list.total > 0 ? (
          <View style={styles.footer}>
            <Text variant="small" color={colors.textMuted}>
              {`Mostrando ${list.items.length} de ${list.total}${list.hasMore ? ' · desliza para ver más' : ''}`}
            </Text>
          </View>
        ) : undefined
      }
    />
  );
}

function Separator() {
  return <View style={{ height: 12 }} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 8, flexGrow: 1 },
  footer: { alignItems: 'center', gap: 8, paddingVertical: 16 },
});
