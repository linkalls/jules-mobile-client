/**
 * 多言語対応 (i18n) - 日本語 / 英語
 */

type TranslationKey = keyof typeof translations.ja;

const translations = {
  ja: {
    // Common
    loading: '読み込み中...',
    error: 'エラー',
    save: '保存する',
    cancel: 'キャンセル',
    close: '閉じる',
    refresh: '更新',
    
    // Sessions
    sessions: 'セッション',
    sessionsTitle: 'Jules Client',
    noSessions: 'まだセッションがないよ',
    noSessionsHint: '右下のボタンから新しいタスクを作ろう！',
    noApiKey: 'APIキーが設定されていないよ',
    noApiKeyHint: 'Settingsタブでキーを入力してね！',
    
    // Session Detail
    noActivities: 'アクティビティがないよ',
    replyPlaceholder: 'Julesに返信...',
    planSummary: 'Plan Summary',
    toolLabel: 'Tool',
    outputLabel: 'Output',
    detailedInfo: 'Detailed Info',
    hide: 'Hide',
    
    // Settings
    settings: '設定',
    apiKeyLabel: 'Jules API Key',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHint: 'Google Cloud Console または Jules Settings で取得したキーを入力してね。',
    darkMode: 'ダークモード',
    savedSuccess: 'APIキーをセキュアに保存したよ！',
    savedError: '保存に失敗しちゃった...',
    securityHint: 'APIキーはexpo-secure-storeでセキュアに保存されるよ。でも、他人と共有するデバイスでは気をつけてね！',
    hint: 'ヒント',
    
    // Create Session
    newTask: '新規タスク',
    selectRepo: '1. リポジトリを選んでね (Source)',
    selectPlaceholder: 'タップして選択...',
    noSourcesFound: 'ソースが見つからないよ。GitHub Appのインストールが必要かも。',
    promptLabel: '2. Julesへのお願い (Prompt)',
    promptPlaceholder: '例: mainブランチのバグを直して！新しい機能を追加して！',
    startSession: 'セッションを開始する',
    inputError: 'リポジトリを選んで、依頼内容を書いてね！',
    createSuccess: 'セッションを作成したよ！',
    processing: '処理中...',
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    refresh: 'Refresh',
    
    // Sessions
    sessions: 'Sessions',
    sessionsTitle: 'Jules Client',
    noSessions: 'No sessions yet',
    noSessionsHint: 'Tap the button below to create a new task!',
    noApiKey: 'API key not set',
    noApiKeyHint: 'Enter your key in Settings tab!',
    
    // Session Detail
    noActivities: 'No activities',
    replyPlaceholder: 'Reply to Jules...',
    planSummary: 'Plan Summary',
    toolLabel: 'Tool',
    outputLabel: 'Output',
    detailedInfo: 'Detailed Info',
    hide: 'Hide',
    
    // Settings
    settings: 'Settings',
    apiKeyLabel: 'Jules API Key',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHint: 'Enter the key from Google Cloud Console or Jules Settings.',
    darkMode: 'Dark Mode',
    savedSuccess: 'API key saved securely!',
    savedError: 'Failed to save...',
    securityHint: 'API key is stored securely with expo-secure-store. Be careful on shared devices!',
    hint: 'Hint',
    
    // Create Session
    newTask: 'New Task',
    selectRepo: '1. Select Repository (Source)',
    selectPlaceholder: 'Tap to select...',
    noSourcesFound: 'No sources found. You may need to install the GitHub App.',
    promptLabel: '2. Your Request (Prompt)',
    promptPlaceholder: 'e.g., Fix the bug in main branch! Add new features!',
    startSession: 'Start Session',
    inputError: 'Please select a repository and enter your request!',
    createSuccess: 'Session created!',
    processing: 'Processing...',
  },
};

export type Language = 'ja' | 'en';

let currentLanguage: Language = 'ja';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

export { translations };
