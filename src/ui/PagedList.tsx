import {
  useEffect,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { usePagedSearch, type PagedLoad } from './usePagedSearch';

type Props<T> = {
  load: PagedLoad<T>;
  keyOf: (item: T) => string;
  renderItem: (item: T, place: { first: boolean; last: boolean }) => ReactElement;
  /** Says what can be typed, as "Buscar por valor ou data". */
  placeholder: string;
  /** "25 pagamentos", for the rows found. */
  countLabel: (total: number) => string;
  /** Shown when nothing was ever recorded. */
  emptyLabel: string;
  /** Replaces `emptyLabel` with a fuller view, such as an illustrated empty state. */
  emptyView?: ReactElement;
  /** Beside the search box, such as the list's one action. */
  action?: ReactNode;
  /** Space between rows: none for rows of one card, a gap for separate cards. */
  gap?: number;
  /** Filled with the list's refresh, for a screen that changes rows in place. */
  reloadRef?: MutableRefObject<(() => Promise<void>) | null>;
};

/** A long list with a search box, loaded a page at a time as it scrolls. */
export function PagedList<T>({
  load,
  keyOf,
  renderItem,
  placeholder,
  countLabel,
  emptyLabel,
  emptyView,
  action,
  gap = 0,
  reloadRef,
}: Props<T>) {
  const list = usePagedSearch(load);
  useEffect(() => {
    if (reloadRef) {
      reloadRef.current = list.reload;
    }
  }, [list.reload, reloadRef]);
  const items = list.items ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel={placeholder}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={list.typed}
          onChangeText={list.setTyped}
          autoCorrect={false}
          returnKeyType="search"
          style={styles.search}
        />
        {action}
      </View>
      <FlatList
        data={items}
        keyExtractor={keyOf}
        renderItem={({ item, index }) =>
          renderItem(item, {
            first: index === 0,
            last: index === items.length - 1,
          })
        }
        contentContainerStyle={[
          styles.list,
          { gap },
          items.length === 0 && styles.grow,
        ]}
        keyboardShouldPersistTaps="handled"
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          list.items && (list.total > 0 || list.searching) ? (
            <Text style={styles.count}>{countLabel(list.total)}</Text>
          ) : undefined
        }
        ListEmptyComponent={
          !list.items ? undefined : list.searching ? (
            <Text style={styles.empty}>
              Nada encontrado para “{list.typed.trim()}”.
            </Text>
          ) : (
            emptyView ?? <Text style={styles.empty}>{emptyLabel}</Text>
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator color={colors.accent} style={styles.more} />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  search: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
  grow: { flexGrow: 1 },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  more: { padding: spacing.md },
});
