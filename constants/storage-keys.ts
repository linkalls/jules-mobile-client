/**
 * Shared SecureStore key constants — single source of truth.
 */
export const STORAGE_KEYS = {
  API_KEY: 'jules_api_key',
  THEME: 'jules_theme',
  LANGUAGE: 'jules_language',
  RECENT_REPOS: 'jules_recent_repos',
  SESSION_FILTER_PRESETS: 'jules_session_filter_presets',
  LAST_SESSION_FILTER: 'jules_last_session_filter',
  CACHED_SOURCES: 'jules_cached_sources',
} as const;
