import { useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import type { Source } from '@/constants/types';

const CACHE_FILE_URI = `${FileSystem.documentDirectory}jules_sources_cache.json`;

export function useSourcesCache() {
  const saveCachedSources = useCallback(async (sources: Source[]): Promise<void> => {
    try {
      const data = JSON.stringify(sources);
      await FileSystem.writeAsStringAsync(CACHE_FILE_URI, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch {
      // Ignore errors silently
    }
  }, []);

  const getCachedSources = useCallback(async (): Promise<Source[]> => {
    try {
      const info = await FileSystem.getInfoAsync(CACHE_FILE_URI);
      if (!info.exists) {
        return [];
      }
      const data = await FileSystem.readAsStringAsync(CACHE_FILE_URI, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return JSON.parse(data);
    } catch {
      return [];
    }
  }, []);

  return { saveCachedSources, getCachedSources };
}
