import { useState, useCallback, useRef } from 'react';
import type {
  Session,
  Source,
  Activity,
  ListSessionsResponse,
  ListSourcesResponse,
  ListActivitiesResponse,
  ApiError,
} from '@/constants/types';
import type { TranslationKey } from '@/constants/i18n';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';

 
type TranslatorFn = (key: TranslationKey) => string;

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
  
  // Sources pagination state
  const [sources, setSources] = useState<Source[]>([]);
  const [hasMoreSources, setHasMoreSources] = useState(true);
  const [isLoadingMoreSources, setIsLoadingMoreSources] = useState(false);
  const sourcesPageTokenRef = useRef<string | undefined>(undefined);

  // Sessions pagination state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);
  const sessionsPageTokenRef = useRef<string | undefined>(undefined);

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

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        // Only log errors in development mode
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('API Error Response:', errorData);
        }
        throw new Error(errorData.error?.message || `${translate('apiError', 'API Error')}: ${response.status}`);
      }

      return (await response.json()) as T;
    },
    [apiKey, translate]
  );

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
  }, [julesFetch, translate]);

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
      const allSources = [...sources, ...newSources];
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
  }, [julesFetch, sources, hasMoreSources, isLoadingMoreSources, translate]);

  // Fetch sessions (initial load or reset)
  const fetchSessions = useCallback(async (silent: boolean = false): Promise<Session[]> => {
    if (!silent) setIsLoading(true);
    setError(null);
    sessionsPageTokenRef.current = undefined;
    
    try {
      const data = await julesFetch<ListSessionsResponse>('/sessions?pageSize=20');
      const fetchedSessions = data.sessions || [];
      setSessions(fetchedSessions);
      sessionsPageTokenRef.current = data.nextPageToken;
      setHasMoreSessions(!!data.nextPageToken);
      return fetchedSessions;
    } catch (err) {
      const message = err instanceof Error ? err.message : translate('fetchSessionsFailed', 'Failed to fetch sessions');
      setError(message);
      return [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [julesFetch, translate]);

  // Fetch more sessions (pagination on scroll)
  const fetchMoreSessions = useCallback(async (): Promise<Session[]> => {
    if (!hasMoreSessions || isLoadingMoreSessions || !sessionsPageTokenRef.current) {
      return sessions;
    }
    
    setIsLoadingMoreSessions(true);
    try {
      const endpoint = `/sessions?pageSize=20&pageToken=${sessionsPageTokenRef.current}`;
      const data: ListSessionsResponse = await julesFetch<ListSessionsResponse>(endpoint);
      const newSessions = data.sessions || [];
      const allSessions = [...sessions, ...newSessions];
      setSessions(allSessions);
      sessionsPageTokenRef.current = data.nextPageToken;
      setHasMoreSessions(!!data.nextPageToken);
      return allSessions;
    } catch (err) {
      const message = err instanceof Error ? err.message : translate('fetchSessionsFailed', 'Failed to fetch sessions');
      setError(message);
      return sessions;
    } finally {
      setIsLoadingMoreSessions(false);
    }
  }, [julesFetch, sessions, hasMoreSessions, isLoadingMoreSessions, translate]);

  // Fetch single session
  const fetchSession = useCallback(async (sessionName: string, silent: boolean = false): Promise<Session | null> => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const session = await julesFetch<Session>(`/${sessionName}`);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : translate('fetchSessionFailed', 'Failed to fetch session');
      setError(message);
      return null;
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [julesFetch, translate]);

  // Fetch activities
  const fetchActivities = useCallback(
    async (sessionName: string, silent: boolean = false): Promise<Activity[]> => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const data = await julesFetch<ListActivitiesResponse>(
          `/${sessionName}/activities?pageSize=50`
        );
        const sorted = (data.activities || []).sort(
          (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        );
        return sorted;
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('fetchActivitiesFailed', 'Failed to fetch chat history...');
        setError(message);
        return [];
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [julesFetch, translate]
  );

  // Approve plan
  const approvePlan = useCallback(
    async (sessionName: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await julesFetch(`/${sessionName}:approvePlan`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('approvePlanFailed', 'Failed to approve plan');
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch, translate]
  );

  // Create session
  const createSession = useCallback(
    async (
      sourceName: string,
      prompt: string,
      defaultBranch?: string,
      images?: { mimeType: string; data: string }[],
      requirePlanApproval?: boolean
    ): Promise<Session | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const body: {
          prompt: string;
          sourceContext: {
            source: string;
            githubRepoContext?: {
              startingBranch: string;
            };
          };
          title: string;
          images?: { mimeType: string; data: string }[];
          requirePlanApproval?: boolean;
        } = {
          prompt: prompt.trim(),
          sourceContext: {
            source: sourceName,
          },
          title: prompt.trim().slice(0, 30) + (prompt.trim().length > 30 ? '...' : ''),
        };

        // Add githubRepoContext if defaultBranch is provided
        if (defaultBranch) {
          body.sourceContext.githubRepoContext = {
            startingBranch: defaultBranch,
          };
        }

        // Add requirePlanApproval if provided
        if (requirePlanApproval !== undefined) {
          body.requirePlanApproval = requirePlanApproval;
        }

        // Add images if provided
        // NOTE: Temporarily disabled as the API (v1alpha) does not currently support images in the payload,
        // causing an "Invalid JSON payload" error.
        /*
        if (images && images.length > 0) {
          body.images = images;
        }
        */

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('Creating session with body:', body);
        }

        const session = await julesFetch<Session>('/sessions', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        return session;
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('createSessionFailed', 'Failed to create session');
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch, translate]
  );

  // Send message (create user activity)
  const sendMessage = useCallback(
    async (sessionName: string, message: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const body = {
          prompt: message,
        };

        await julesFetch(`/${sessionName}:sendMessage`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : translate('sendMessageFailed', 'Failed to send message');
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch, translate]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    // Sources with lazy loading
    sources,
    hasMoreSources,
    isLoadingMoreSources,
    fetchSources,
    fetchMoreSources,
    // Sessions with lazy loading
    sessions,
    hasMoreSessions,
    isLoadingMoreSessions,
    fetchSessions,
    fetchMoreSessions,
    // Other APIs
    fetchSession,
    fetchActivities,
    createSession,
    approvePlan,
    sendMessage,
  };
}
