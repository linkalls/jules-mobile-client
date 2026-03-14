import { useCallback } from 'react';
import type { ApiError } from '@/constants/types';
import type { TranslationKey } from '@/constants/i18n';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';

export type TranslatorFn = (key: TranslationKey) => string;

interface UseJulesFetchOptions {
  apiKey: string;
  t?: TranslatorFn;
}

export function useJulesFetch({ apiKey, t }: UseJulesFetchOptions) {
  // Translation helper
  const translate = useCallback((key: TranslationKey, fallback: string) => {
    return t ? t(key) : fallback;
  }, [t]);

  // Generic fetch function
  const julesFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      if (!apiKey) {
        throw new Error(translate('apiKeyNotSet', 'API key not set! Enter it in Settings.'));
      }

      const url = `${BASE_URL}${endpoint}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        ...(options.headers as Record<string, string>),
      };

      const response = await fetch(url, { ...options, headers });

      const parseJsonSafe = async <U>(): Promise<U | null> => {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');

        if (response.status === 204 || contentLength === '0') {
          return null;
        }

        if (!contentType.toLowerCase().includes('application/json')) {
          return null;
        }

        try {
          return (await response.json()) as U;
        } catch {
          return null;
        }
      };

      if (!response.ok) {
        const errorData = await parseJsonSafe<ApiError>();
        throw new Error(errorData?.error?.message || `${translate('apiError', 'API Error')}: ${response.status}`);
      }

      const data = await parseJsonSafe<T>();
      return (data ?? ({} as T));
    },
    [apiKey, translate]
  );

  return { translate, julesFetch };
}
