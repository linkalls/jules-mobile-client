import { useState, useCallback, useRef } from 'react';
import type { Session, Activity, ListSessionsResponse, ListActivitiesResponse } from '@/constants/types';
import type { TranslatorFn } from '@/hooks/use-jules-fetch';

interface UseJulesSessionsProps {
  julesFetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  translate: (key: Parameters<TranslatorFn>[0], fallback: string) => string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useJulesSessions({ julesFetch, translate, setIsLoading, setError }: UseJulesSessionsProps) {
  // Sessions pagination state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);
  const sessionsPageTokenRef = useRef<string | undefined>(undefined);

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
  }, [julesFetch, translate, setIsLoading, setError]);

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
  }, [julesFetch, sessions, hasMoreSessions, isLoadingMoreSessions, translate, setError]);

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
  }, [julesFetch, translate, setIsLoading, setError]);

  // Delete session
  const deleteSession = useCallback(
    async (sessionName: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await julesFetch(`/${sessionName}`, {
          method: 'DELETE',
        });

        // Remove from local state
        setSessions((prev) => prev.filter((s) => s.name !== sessionName));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('deleteSessionFailed', 'Failed to delete session');
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch, translate, setIsLoading, setError, setSessions]
  );

  // Fetch single activity
  const fetchActivity = useCallback(
    async (activityName: string, silent: boolean = false): Promise<Activity | null> => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const activity = await julesFetch<Activity>(`/${activityName}`);
        return activity;
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('fetchActivityFailed', 'Failed to fetch activity');
        setError(message);
        return null;
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [julesFetch, translate, setIsLoading, setError]
  );

  // Fetch activities with full pagination
  const fetchActivities = useCallback(
    async (sessionName: string, silent: boolean = false): Promise<Activity[]> => {
      if (!silent) setIsLoading(true);
      setError(null);
      let allActivities: Activity[] = [];
      let pageToken: string | undefined = undefined;

      try {
        do {
          const endpoint = `/${sessionName}/activities?pageSize=50${pageToken ? `&pageToken=${pageToken}` : ''}`;
          const data = await julesFetch<ListActivitiesResponse>(endpoint);
          allActivities = [...allActivities, ...(data.activities || [])];
          pageToken = data.nextPageToken;
        } while (pageToken);

        const sorted = allActivities.sort(
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
    [julesFetch, translate, setIsLoading, setError]
  );

  // Fetch activities since a specific time for diff polling
  const fetchActivitiesSince = useCallback(
    async (sessionName: string, sinceTime: string, silent: boolean = true): Promise<Activity[]> => {
      if (!silent) setIsLoading(true);
      setError(null);
      let allActivities: Activity[] = [];
      let pageToken: string | undefined = undefined;

      try {
        do {
          const filter = encodeURIComponent(`create_time > "${sinceTime}"`);
          const endpoint = `/${sessionName}/activities?pageSize=50&filter=${filter}${pageToken ? `&pageToken=${pageToken}` : ''}`;
          const data = await julesFetch<ListActivitiesResponse>(endpoint);
          allActivities = [...allActivities, ...(data.activities || [])];
          pageToken = data.nextPageToken;
        } while (pageToken);

        const sorted = allActivities.sort(
          (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        );
        return sorted;
      } catch (err) {
        // Fallback silently on polling errors
        const message = err instanceof Error ? err.message : translate('fetchActivitiesFailed', 'Failed to fetch chat history...');
        if (!silent) setError(message);
        return [];
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [julesFetch, translate, setIsLoading, setError]
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
    [julesFetch, translate, setIsLoading, setError]
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
          automationMode?: string;
        } = {
          prompt: prompt.trim(),
          sourceContext: {
            source: sourceName,
          },
          title: prompt.trim().slice(0, 30) + (prompt.trim().length > 30 ? '...' : ''),
          automationMode: 'AUTO_CREATE_PR',
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
    [julesFetch, translate, setIsLoading, setError]
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
    [julesFetch, translate, setIsLoading, setError]
  );

  return {
    sessions,
    hasMoreSessions,
    isLoadingMoreSessions,
    fetchSessions,
    fetchMoreSessions,
    fetchSession,
    fetchActivity,
    fetchActivities,
    fetchActivitiesSince,
    createSession,
    approvePlan,
    sendMessage,
    deleteSession,
  };
}
