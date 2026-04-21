import { useState, useCallback } from 'react';
import { useJulesFetch, type TranslatorFn } from '@/hooks/use-jules-fetch';
import { useJulesSources } from '@/hooks/use-jules-sources';
import { useJulesSessions } from '@/hooks/use-jules-sessions';

interface UseJulesApiOptions {
  apiKey: string;
  t?: TranslatorFn;
}

/**
 * Jules API Hook
 */
export function useJulesApi({ apiKey, t }: UseJulesApiOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract generic fetch and translation logic
  const { julesFetch, translate } = useJulesFetch({ apiKey, t });

  // Extract sources functionality
  const sourcesApi = useJulesSources({
    julesFetch,
    translate,
    setIsLoading,
    setError,
  });

  // Extract sessions and generic session-based APIs
  const sessionsApi = useJulesSessions({
    julesFetch,
    translate,
    setIsLoading,
    setError,
  });

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    // Sources with lazy loading
    ...sourcesApi,
    // Sessions with lazy loading
    ...sessionsApi,
  };
}
