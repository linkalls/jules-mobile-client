import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translations, type Language } from './i18n';

type TranslationKey = keyof typeof translations.ja;

const LANGUAGE_STORAGE_KEY = 'jules_language';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // 起動時に保存された言語設定を読み込む
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        if (savedLang === 'ja' || savedLang === 'en') {
          setLanguageState(savedLang);
        }
      } catch {
        // 無視
      }
      setIsLoaded(true);
    };
    loadLanguage();
  }, []);

  // 言語変更時に永続化
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // 無視
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  // 言語設定が読み込まれるまで待つ
  if (!isLoaded) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
