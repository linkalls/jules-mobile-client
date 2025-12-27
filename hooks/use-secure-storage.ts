import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'jules_api_key';
const THEME_STORAGE_KEY = 'jules_theme';
const LANGUAGE_STORAGE_KEY = 'jules_language';

/**
 * SecureStoreを使用したセキュアストレージフック
 */
export function useSecureStorage() {
  const [isLoading, setIsLoading] = useState(false);

  // APIキーの保存
  const saveApiKey = useCallback(async (key: string): Promise<void> => {
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // APIキーの取得
  const getApiKey = useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  // APIキーの削除
  const deleteApiKey = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    } catch {
      // 無視
    }
  }, []);

  // テーマの保存 (非機密情報なのでSecureStoreでもOK)
  const saveTheme = useCallback(async (theme: 'light' | 'dark'): Promise<void> => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
    } catch {
      // 無視
    }
  }, []);

  // テーマの取得
  const getTheme = useCallback(async (): Promise<'light' | 'dark' | null> => {
    try {
      const theme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      return theme as 'light' | 'dark' | null;
    } catch {
      return null;
    }
  }, []);

  // 言語の保存
  const saveLanguage = useCallback(async (lang: 'ja' | 'en'): Promise<void> => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // 無視
    }
  }, []);

  // 言語の取得
  const getLanguage = useCallback(async (): Promise<'ja' | 'en' | null> => {
    try {
      const lang = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
      return lang as 'ja' | 'en' | null;
    } catch {
      return null;
    }
  }, []);

  return {
    isLoading,
    saveApiKey,
    getApiKey,
    deleteApiKey,
    saveTheme,
    getTheme,
    saveLanguage,
    getLanguage,
  };
}
