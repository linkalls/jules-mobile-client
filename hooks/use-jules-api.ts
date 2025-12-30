import { useState, useCallback } from 'react';
import type {
  Session,
  Source,
  Activity,
  ListSessionsResponse,
  ListSourcesResponse,
  ListActivitiesResponse,
  ApiError,
} from '@/constants/types';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';

interface UseJulesApiOptions {
  apiKey: string;
}

/**
 * Jules API通信フック
 */
export function useJulesApi({ apiKey }: UseJulesApiOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 汎用fetch関数
  const julesFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      if (!apiKey) {
        throw new Error('APIキーが設定されていないよ！設定画面で入力してね。');
      }

      const url = `${BASE_URL}${endpoint}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        ...options.headers,
      };

      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error?.message || `APIエラー: ${response.status}`);
      }

      return (await response.json()) as T;
    },
    [apiKey]
  );

  // ソース一覧の取得
  const fetchSources = useCallback(async (silent: boolean = false): Promise<Source[]> => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await julesFetch<ListSourcesResponse>('/sources');
      return data.sources || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ソースの取得に失敗したよ';
      setError(message);
      return [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [julesFetch]);

  // セッション一覧の取得
  const fetchSessions = useCallback(async (silent: boolean = false): Promise<Session[]> => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await julesFetch<ListSessionsResponse>('/sessions?pageSize=20');
      return data.sessions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'セッションの取得に失敗したよ';
      setError(message);
      return [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [julesFetch]);

  // アクティビティ（チャット履歴）の取得
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
        const message = err instanceof Error ? err.message : 'チャット履歴が見れなかったよ...';
        setError(message);
        return [];
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [julesFetch]
  );

  // プラン承認
  const approvePlan = useCallback(
    async (planId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await julesFetch(`/${planId}:approve`, {
          method: 'POST',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'プランの承認に失敗したよ';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch]
  );

  // 新規セッション作成
  const createSession = useCallback(
    async (sourceName: string, prompt: string): Promise<Session | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const body = {
          prompt,
          sourceContext: {
            source: sourceName,
          },
          title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        };

        const session = await julesFetch<Session>('/sessions', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        return session;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'セッションが作れなかったよ';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [julesFetch]
  );

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    fetchSources,
    fetchSessions,
    fetchActivities,
    createSession,
    approvePlan,
  };
}
