import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  parseListSearch,
  type ListSearch,
  type Page,
  type PageRequest,
} from '../search';

export const PAGE_SIZE = 20;
const TYPING_PAUSE_MS = 300;

type Loaded<T> = { items: T[]; total: number };

/** Reads one page of the rows matching the search; `typed` is the raw text. */
export type PagedLoad<T> = (
  search: ListSearch,
  page: PageRequest,
  typed: string,
) => Promise<Page<T>>;

/**
 * A long list read a page at a time, filtered by what is typed in its search box.
 * It refreshes the rows already shown each time the screen gains focus.
 */
export function usePagedSearch<T>(load: PagedLoad<T>) {
  const [typed, setTyped] = useState('');
  const [settled, setSettled] = useState('');
  const [loaded, setLoaded] = useState<Loaded<T>>();
  const [loadingMore, setLoadingMore] = useState(false);
  // Answers to an older search or an older refresh are dropped.
  const generation = useRef(0);
  const shown = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(typed), TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  const search = useMemo(() => parseListSearch(settled), [settled]);

  const refresh = useCallback(
    async (limit: number) => {
      const current = ++generation.current;
      const page = await load(search, { offset: 0, limit }, settled);
      if (current === generation.current) {
        shown.current = page.items.length;
        setLoaded(page);
      }
    },
    [load, search, settled],
  );

  useEffect(() => {
    shown.current = 0;
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      refresh(Math.max(PAGE_SIZE, shown.current));
    }, [refresh]),
  );

  const loadMore = useCallback(async () => {
    if (!loaded || loadingMore || loaded.items.length >= loaded.total) {
      return;
    }
    const current = generation.current;
    setLoadingMore(true);
    try {
      const page = await load(
        search,
        { offset: loaded.items.length, limit: PAGE_SIZE },
        settled,
      );
      if (current === generation.current) {
        const items = [...loaded.items, ...page.items];
        shown.current = items.length;
        setLoaded({ items, total: page.total });
      }
    } finally {
      setLoadingMore(false);
    }
  }, [load, loaded, loadingMore, search, settled]);

  const reload = useCallback(
    () => refresh(Math.max(PAGE_SIZE, shown.current)),
    [refresh],
  );

  return {
    typed,
    setTyped,
    searching: settled.trim() !== '',
    items: loaded?.items,
    total: loaded?.total ?? 0,
    loadingMore,
    loadMore,
    reload,
  };
}
