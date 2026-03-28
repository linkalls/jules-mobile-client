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
    approve: '承認',
    
    // Sessions
    sessions: 'セッション',
    sessionsTitle: 'Jules Client',
    noSessions: 'まだセッションがないよ',
    noSessionsHint: '右下のボタンから新しいタスクを作ろう！',
    noApiKey: 'APIキーが設定されていないよ',
    noApiKeyHint: 'Settingsタブでキーを入力してね！',
    searchSessions: 'セッションを検索...',
    sortBy: '並び替え',
    sortByNewest: '新しい順',
    sortByOldest: '古い順',
    sortByTitle: 'タイトル順',
    filterByStatus: 'ステータスで絞り込み',
    filterAll: 'すべて',
    filterActive: '処理中のみ',
    filterInProgress: '実行中のみ',
    filterAwaitingPlanApproval: '承認待ちのみ',
    filterCompleted: '完了のみ',
    filterFailed: '失敗のみ',
    noResultsFound: '該当するセッションが見つかりませんでした',
    
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
    appVersion: 'アプリバージョン',
    about: 'アプリについて',
    
    // Create Session
    newTask: '新規タスク',
    selectRepo: '1. リポジトリを選んでね (Source)',
    selectPlaceholder: 'タップして選択...',
    noSourcesFound: 'ソースが見つからないよ。GitHub Appのインストールが必要かも。',
    promptLabel: '2. Julesへのお願い (Prompt)',
    promptPlaceholder: '例: mainブランチのバグを直して！新しい機能を追加して！',
    executionMode: '3. 実行モード',
    modeStart: '実行 (Start)',
    modeReview: '確認 (Review)',
    modeStartDesc: 'プラン作成後、自動で実行開始',
    modeReviewDesc: 'プラン確認してから実行',
    startSession: 'セッションを開始する',
    inputError: 'リポジトリを選んで、依頼内容を書いてね！',
    promptTooLong: '依頼内容が長すぎます（最大50000文字）',
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
    stateQueued: '待機中',
    statePlanning: '計画中',
    stateAwaitingPlanApproval: '承認待ち',
    stateAwaitingUserFeedback: 'フィードバック待ち',
    stateInProgress: '実行中',
    statePaused: '一時停止',
    fetchSessionFailed: 'セッションの取得に失敗したよ',
    
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
    networkError: 'ネットワークエラー。接続を確認してね。',
    retryHint: 'もう一度お試しください',
    tapToRetry: 'タップして再試行',
    savedFilters: '保存フィルタ',
    saveCurrentFilter: '現在の条件を保存',
    quickFilters: 'クイックフィルタ',
    
    // Help & Support
    help: 'ヘルプ',
    helpCenter: 'ヘルプセンター',
    documentation: 'ドキュメント',
    faq: 'よくある質問',
    troubleshooting: 'トラブルシューティング',
    reportIssue: '問題を報告',
    contribute: '貢献する',
    viewOnGitHub: 'GitHubで見る',
    unableToOpenLink: 'リンクを開けませんでした。デバイスの設定を確認してください。',
    
    // Statistics
    statistics: '統計情報',
    totalSessions: '総セッション数',
    activeSessions: 'アクティブなセッション',
    completedSessions: '完了したセッション',
    failedSessions: '失敗したセッション',
    statisticsHint: 'これらの統計は、現在読み込まれているセッションに基づいています。',
    
    // Export & Share
    exportSession: 'セッションをエクスポート',
    exportAsMarkdown: 'Markdownでエクスポート',
    exportAsJSON: 'JSONでエクスポート',
    shareSession: 'セッションを共有',
    exportSuccess: 'セッションをエクスポートしました！',
    exportFailed: 'エクスポートに失敗しました',
    sharingNotAvailable: 'この端末では共有機能が利用できません',
    noSessionDataToExport: 'エクスポートできるセッションデータがありません',
    chooseExportFormat: 'エクスポート形式を選んでね',
    planWaitingApproval: 'このプランは承認待ちです',
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    refresh: 'Refresh',
    approve: 'Approve',
    
    // Sessions
    sessions: 'Sessions',
    sessionsTitle: 'Jules Client',
    noSessions: 'No sessions yet',
    noSessionsHint: 'Tap the button below to create a new task!',
    noApiKey: 'API key not set',
    noApiKeyHint: 'Enter your key in Settings tab!',
    searchSessions: 'Search sessions...',
    sortBy: 'Sort by',
    sortByNewest: 'Newest first',
    sortByOldest: 'Oldest first',
    sortByTitle: 'Title',
    filterByStatus: 'Filter by status',
    filterAll: 'All',
    filterActive: 'Active only',
    filterInProgress: 'In Progress only',
    filterAwaitingPlanApproval: 'Awaiting Approval only',
    filterCompleted: 'Completed only',
    filterFailed: 'Failed only',
    noResultsFound: 'No matching sessions found',
    
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
    appVersion: 'App Version',
    about: 'About',
    
    // Create Session
    newTask: 'New Task',
    selectRepo: '1. Select Repository (Source)',
    selectPlaceholder: 'Tap to select...',
    noSourcesFound: 'No sources found. You may need to install the GitHub App.',
    promptLabel: '2. Your Request (Prompt)',
    promptPlaceholder: 'e.g., Fix the bug in main branch! Add new features!',
    executionMode: '3. Execution Mode',
    modeStart: 'Start (Run)',
    modeReview: 'Review',
    modeStartDesc: 'Auto-execute after plan generation',
    modeReviewDesc: 'Review plan before execution',
    startSession: 'Start Session',
    inputError: 'Please select a repository and enter your request!',
    promptTooLong: 'Prompt is too long (max 50000 characters)',
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
    stateQueued: 'Queued',
    statePlanning: 'Planning',
    stateAwaitingPlanApproval: 'Awaiting Plan Approval',
    stateAwaitingUserFeedback: 'Awaiting Feedback',
    stateInProgress: 'In Progress',
    statePaused: 'Paused',
    fetchSessionFailed: 'Failed to fetch session',
    
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
    networkError: 'Network error. Please check your connection.',
    retryHint: 'Please try again',
    tapToRetry: 'Tap to retry',
    savedFilters: 'Saved Filters',
    saveCurrentFilter: 'Save current filter',
    quickFilters: 'Quick Filters',
    
    // Help & Support
    help: 'Help',
    helpCenter: 'Help Center',
    documentation: 'Documentation',
    faq: 'FAQ',
    troubleshooting: 'Troubleshooting',
    reportIssue: 'Report Issue',
    contribute: 'Contribute',
    viewOnGitHub: 'View on GitHub',
    unableToOpenLink: 'Unable to open this link. Please check your device settings.',
    
    // Statistics
    statistics: 'Statistics',
    totalSessions: 'Total Sessions',
    activeSessions: 'Active Sessions',
    completedSessions: 'Completed Sessions',
    failedSessions: 'Failed Sessions',
    statisticsHint: 'These statistics are based on your currently loaded sessions.',
    
    // Export & Share
    exportSession: 'Export Session',
    exportAsMarkdown: 'Export as Markdown',
    exportAsJSON: 'Export as JSON',
    shareSession: 'Share Session',
    exportSuccess: 'Session exported successfully!',
    exportFailed: 'Failed to export session',
    sharingNotAvailable: 'Sharing is not available on this platform',
    noSessionDataToExport: 'No session data available to export',
    chooseExportFormat: 'Choose export format',
    planWaitingApproval: 'This plan is waiting for your approval',
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
