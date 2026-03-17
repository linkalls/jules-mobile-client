import { useState, useCallback, useRef } from 'react';
import type { Source, ListSourcesResponse } from '@/constants/types';
import type { TranslatorFn } from '@/hooks/use-jules-fetch';

interface UseJulesSourcesProps {
  julesFetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  translate: (key: Parameters<TranslatorFn>[0], fallback: string) => string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useJulesSources({ julesFetch, translate, setIsLoading, setError }: UseJulesSourcesProps) {
  // Sources pagination state
  const [sources, setSources] = useState<Source[]>([]);
  const [hasMoreSources, setHasMoreSources] = useState(true);
  const [isLoadingMoreSources, setIsLoadingMoreSources] = useState(false);
  const sourcesPageTokenRef = useRef<string | undefined>(undefined);

  // Fetch sources (initial load or reset)
  const fetchSources = useCallback(async (silent: boolean = false): Promise<Source[]> => {
    if (!silent) setIsLoading(true);
    setError(null);
    sourcesPageTokenRef.current = undefined;

    try {
      const data: ListSourcesResponse = await julesFetch<ListSourcesResponse>('/sources?pageSize=20');
      const fetchedSources = data.sources || [];
      setSources(fetchedSources);
      sourcesPageTokenRef.current = data.nextPageToken;
      setHasMoreSources(!!data.nextPageToken);
      return fetchedSources;
    } catch (err) {
      const message = err instanceof Error ? err.message : translate('fetchSourcesFailed', 'Failed to fetch sources');
      setError(message);
      return [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [julesFetch, translate, setIsLoading, setError]);

  // Fetch more sources (pagination on scroll)
  const fetchMoreSources = useCallback(async (): Promise<Source[]> => {
    if (!hasMoreSources || isLoadingMoreSources || !sourcesPageTokenRef.current) {
      return sources;
    }

    setIsLoadingMoreSources(true);
    try {
      const endpoint = `/sources?pageSize=20&pageToken=${sourcesPageTokenRef.current}`;
      const data: ListSourcesResponse = await julesFetch<ListSourcesResponse>(endpoint);
      const newSources = data.sources || [];

      // Update local state by merging without duplicates
      const currentNames = new Set<string>();
      for (const s of sources) {
        currentNames.add(s.name);
      }
      const deduplicatedNewSources = newSources.filter(s => !currentNames.has(s.name));
      const allSources = [...sources, ...deduplicatedNewSources];

      setSources(allSources);
      sourcesPageTokenRef.current = data.nextPageToken;
      setHasMoreSources(!!data.nextPageToken);
      return allSources;
    } catch (err) {
      const message = err instanceof Error ? err.message : translate('fetchSourcesFailed', 'Failed to fetch sources');
      setError(message);
      return sources;
    } finally {
      setIsLoadingMoreSources(false);
    }
  }, [julesFetch, sources, hasMoreSources, isLoadingMoreSources, translate, setError]);

  // Fetch single source
  const fetchSource = useCallback(
    async (sourceName: string, silent: boolean = false): Promise<Source | null> => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const source = await julesFetch<Source>(`/${sourceName}`);
        return source;
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('fetchSourceFailed', 'Failed to fetch source');
        setError(message);
        return null;
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [julesFetch, translate, setIsLoading, setError]
  );

  // Fetch all sources in background (sync with cache)
  const syncAllSources = useCallback(async (): Promise<Source[]> => {
    setIsLoadingMoreSources(true);
    let allFetchedSources: Source[] = [];
    let pageToken: string | undefined = undefined;

    try {
      do {
        const endpoint = `/sources?pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const data: ListSourcesResponse = await julesFetch<ListSourcesResponse>(endpoint);
        allFetchedSources = [...allFetchedSources, ...(data.sources || [])];
        pageToken = data.nextPageToken;
      } while (pageToken);

      // Successfully synced all sources, update state to fully reflect server truth
      setSources(allFetchedSources);
      sourcesPageTokenRef.current = undefined;
      setHasMoreSources(false);

      return allFetchedSources;
    } catch (err) {
      // In case of error, just fallback to what we currently have
      const message = err instanceof Error ? err.message : translate('fetchSourcesFailed', 'Failed to sync sources');
      setError(message);
      return sources;
    } finally {
      setIsLoadingMoreSources(false);
    }
  }, [julesFetch, translate, sources, setError]);

  return {
    sources,
    setSources,
    hasMoreSources,
    isLoadingMoreSources,
    fetchSources,
    fetchMoreSources,
    fetchSource,
    syncAllSources,
  };
}
