/**
 * 多言語対応 (i18n) - 日本語 / 英語
 */

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
    recentRepos: '最近使ったリポジトリ',
    allRepos: 'すべてのリポジトリ',
    repoHint: '💡 よく使うリポジトリは一番上に表示されるよ！',
    attachImages: '3. 画像を添付 (Images)',
    addImage: '画像を追加',
    
    // Session States
    stateActive: '処理中',
    stateCompleted: '完了',
    stateFailed: '失敗',
    stateUnknown: '作成中',
    
    // Licenses
    licenses: 'オープンソースライセンス',
    licensesDescription: 'このアプリは以下のオープンソースライブラリを使用しています。各ライブラリをタップするとGitHubリポジトリを開きます。',
    
    // API Errors
    apiKeyNotSet: 'APIキーが設定されていないよ！設定画面で入力してね。',
    apiError: 'APIエラー',
    fetchSourcesFailed: 'ソースの取得に失敗したよ',
    fetchSessionsFailed: 'セッションの取得に失敗したよ',
    fetchActivitiesFailed: 'チャット履歴が見れなかったよ...',
    approvePlanFailed: 'プランの承認に失敗したよ',
    createSessionFailed: 'セッションが作れなかったよ',
    sendMessageFailed: 'メッセージの送信に失敗したよ',
    loadingMore: 'さらに読み込み中...',
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
    recentRepos: 'Recent Repositories',
    allRepos: 'All Repositories',
    repoHint: '💡 Your frequently used repos will appear at the top!',
    attachImages: '3. Attach Images',
    addImage: 'Add Image',
    
    // Session States
    stateActive: 'Processing',
    stateCompleted: 'Completed',
    stateFailed: 'Failed',
    stateUnknown: 'Creating',
    
    // Licenses
    licenses: 'Open Source Licenses',
    licensesDescription: 'This app uses the following open source libraries. Tap each library to open its GitHub repository.',
    
    // API Errors
    apiKeyNotSet: 'API key not set! Enter it in Settings.',
    apiError: 'API Error',
    fetchSourcesFailed: 'Failed to fetch sources',
    fetchSessionsFailed: 'Failed to fetch sessions',
    fetchActivitiesFailed: 'Failed to fetch chat history...',
    approvePlanFailed: 'Failed to approve plan',
    createSessionFailed: 'Failed to create session',
    sendMessageFailed: 'Failed to send message',
    loadingMore: 'Loading more...',
  },
};

export type TranslationKey = keyof typeof translations.ja;
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
