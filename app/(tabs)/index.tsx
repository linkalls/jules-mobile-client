import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SessionCard, SessionCardSkeleton } from '@/components/jules';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Session } from '@/constants/types';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import {
  useSecureStorage,
  type SessionFilterPreset,
  type SessionFilterState,
} from '@/hooks/use-secure-storage';
import { Colors } from '@/constants/theme';

// Memoized SessionCard wrapper for performance
const MemoizedSessionCard = memo((props: React.ComponentProps<typeof SessionCard>) => (
  <SessionCard {...props} />
));
MemoizedSessionCard.displayName = 'MemoizedSessionCard';

const FILTER_OPTIONS: { key: SessionFilterState; labelKey: 'filterAll' | 'filterInProgress' | 'filterAwaitingPlanApproval' | 'filterFailed' | 'filterCompleted' }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'inProgress', labelKey: 'filterInProgress' },
  { key: 'awaitingPlanApproval', labelKey: 'filterAwaitingPlanApproval' },
  { key: 'failed', labelKey: 'filterFailed' },
  { key: 'completed', labelKey: 'filterCompleted' },
];

// Extract PR URL from session outputs
// The API returns PR information in outputs[].pullRequest.url, not as a top-level field
function extractPrUrl(session: Session): Session {
  if (!session.submittedPr && session.outputs && session.outputs.length > 0) {
    // Find the first output that contains a pull request URL
    for (const output of session.outputs) {
      const prUrl = output?.pullRequest?.url;
      if (prUrl) {
        return { ...session, submittedPr: prUrl };
      }
    }
  }
  return session;
}

export default function SessionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();
  const colors = isDark ? Colors.dark : Colors.light;

  const { apiKey } = useApiKey();
  const {
    getSessionFilterPresets,
    saveSessionFilterPreset,
    getLastSessionFilter,
    saveLastSessionFilter,
  } = useSecureStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SessionFilterState>('all');
  const [savedPresets, setSavedPresets] = useState<SessionFilterPreset[]>([]);
  const [approvingSessionId, setApprovingSessionId] = useState<string | null>(null);
  const fabScale = React.useRef(new Animated.Value(0)).current;

  const { 
    isLoading, 
    error, 
    clearError, 
    sessions,
    fetchSessions, 
    fetchMoreSessions,
    hasMoreSessions,
    isLoadingMoreSessions,
    approvePlan,
  } = useJulesApi({ apiKey, t });

  // Extract PR URLs from sessions
  const sessionsWithPr = useMemo(() => {
    return sessions.map(extractPrUrl);
  }, [sessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessionsWithPr];

    // Filter by selected state
    if (activeFilter !== 'all') {
      result = result.filter((session) => {
        switch (activeFilter) {
          case 'inProgress':
            return session.state === 'IN_PROGRESS' || session.state === 'ACTIVE' || session.state === 'PLANNING' || session.state === 'QUEUED';
          case 'awaitingPlanApproval':
            return session.state === 'AWAITING_PLAN_APPROVAL';
          case 'failed':
            return session.state === 'FAILED';
          case 'completed':
            return session.state === 'COMPLETED';
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session => 
        (session.title?.toLowerCase() || '').includes(query) ||
        session.name.toLowerCase().includes(query)
      );
    }

    // Default Sort (Newest first)
    result.sort((a, b) => {
      return Date.parse(b.updateTime) - Date.parse(a.updateTime);
    });

    return result;
  }, [sessionsWithPr, searchQuery, activeFilter]);

  // Animate FAB on mount
  useEffect(() => {
    if (apiKey) {
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [apiKey, fabScale]);

  // APIキーが設定されたらセッションを取得
  useEffect(() => {
    if (apiKey) {
      void loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Load saved filter state and presets
  useEffect(() => {
    const loadFilterState = async () => {
      const [lastFilter, presets] = await Promise.all([
        getLastSessionFilter(),
        getSessionFilterPresets(),
      ]);

      if (lastFilter) {
        setSearchQuery(lastFilter.query || '');
        setActiveFilter(lastFilter.state || 'all');
      }

      setSavedPresets(presets);
    };

    void loadFilterState();
  }, [getLastSessionFilter, getSessionFilterPresets]);

  // Persist latest filter state
  useEffect(() => {
    void saveLastSessionFilter({ query: searchQuery, state: activeFilter });
  }, [searchQuery, activeFilter, saveLastSessionFilter]);

  const loadSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const openSession = useCallback((session: Session) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/session/id',
      params: {
        id: session.name,
        title: session.title || 'Session',
        submittedPr: session.submittedPr || '',
      },
    });
  }, []);

  const openCreateSession = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-session');
  }, []);

  const handleApprove = useCallback(async (sessionName: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApprovingSessionId(sessionName);
    try {
      await approvePlan(sessionName);
      // Refresh sessions to update state
      await fetchSessions(true);
    } catch {
      // Error is handled by useJulesApi state
    } finally {
      setApprovingSessionId(null);
    }
  }, [approvePlan, fetchSessions]);

  const renderSessionItem = useCallback(({ item }: { item: Session }) => (
    <MemoizedSessionCard
      session={item}
      onPress={() => openSession(item)}
      onApprove={() => handleApprove(item.name)}
      isApproving={approvingSessionId === item.name}
    />
  ), [openSession, handleApprove, approvingSessionId]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const getFilterLabel = useCallback((filter: SessionFilterState): string => {
    switch (filter) {
      case 'inProgress':
        return t('filterInProgress');
      case 'awaitingPlanApproval':
        return t('filterAwaitingPlanApproval');
      case 'failed':
        return t('filterFailed');
      case 'completed':
        return t('filterCompleted');
      default:
        return t('filterAll');
    }
  }, [t]);

  const saveCurrentPreset = useCallback(async () => {
    const preset: SessionFilterPreset = {
      id: `${Date.now()}`,
      name: searchQuery.trim() ? `${t('searchSessions')}: ${searchQuery.trim().slice(0, 20)}` : getFilterLabel(activeFilter),
      query: searchQuery,
      state: activeFilter,
    };

    await saveSessionFilterPreset(preset);
    const presets = await getSessionFilterPresets();
    setSavedPresets(presets);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [searchQuery, activeFilter, saveSessionFilterPreset, getSessionFilterPresets, t, getFilterLabel]);

  const applyPreset = useCallback((preset: SessionFilterPreset) => {
    setSearchQuery(preset.query);
    setActiveFilter(preset.state);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleLoadMore = useCallback(() => {
    void fetchMoreSessions();
  }, [fetchMoreSessions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Modern Header with Gradient */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <LinearGradient
          colors={isDark 
            ? [colors.surface, colors.surfaceSecondary]
            : [colors.surface, colors.surfaceSecondary]
          }
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.logoContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="terminal" size={20} color={colors.surface} />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Jules Client</Text>
              <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                {hasMoreSessions && ' loaded'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={onRefresh} 
            disabled={isLoading}
            style={styles.refreshButton}
            accessibilityLabel={t('refresh')}
            accessibilityRole="button"
            accessibilityHint="Refresh the list of sessions"
          >
            <IconSymbol
              name="arrow.clockwise"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* エラー表示 */}
      {error && (
        <View style={[styles.errorBanner, isDark && styles.errorBannerDark]}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                clearError();
                void onRefresh();
              }}
              accessibilityLabel={t('tapToRetry')}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>{t('tapToRetry')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={clearError} accessibilityLabel="Close error" accessibilityRole="button">
            <Text style={styles.errorClose}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search and Filter Bar */}
      {apiKey && sessions.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
            <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('searchSessions')}
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <IconSymbol name="xmark.circle.fill" size={18} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.filtersScrollContent}>
                <Text style={[styles.filterLabel, { color: colors.icon }]}>{t('quickFilters')}</Text>
                {FILTER_OPTIONS.map((item) => {
                  const isActive = activeFilter === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterChip,
                        isDark && styles.filterChipDark,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() => setActiveFilter(item.key)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isDark && styles.filterChipTextDark,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {t(item.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {savedPresets.length > 0 && (
                  <>
                    <Text style={[styles.filterLabel, { color: colors.icon, marginLeft: 8 }]}>{t('savedFilters')}</Text>
                    {savedPresets.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.filterChip, isDark && styles.filterChipDark]}
                        onPress={() => applyPreset(item)}
                      >
                        <Text style={[styles.filterChipText, isDark && styles.filterChipTextDark]} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity onPress={() => void saveCurrentPreset()}>
              <Text style={[styles.savePresetText, { color: colors.primary }]} numberOfLines={1}>{t('saveCurrentFilter')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* セッション一覧 */}
      {isLoading && sessions.length === 0 ? (
        <View style={styles.listContent}>
          <SessionCardSkeleton />
          <View style={{ height: 12 }} />
          <SessionCardSkeleton />
          <View style={{ height: 12 }} />
          <SessionCardSkeleton />
          <View style={{ height: 12 }} />
          <SessionCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedSessions}
          keyExtractor={(item) => item.name}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#60a5fa' : '#2563eb'} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(_, index) => ({ length: 100, offset: 112 * index, index })}
          ListFooterComponent={
            isLoadingMoreSessions && sessions.length > 0 ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingMoreText, { color: colors.icon }]}>
                  {t('loadingMore')}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !apiKey ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="key" size={48} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  {t('noApiKey')}
                </Text>
                <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
                  {t('noApiKeyHint')}
                </Text>
              </View>
            ) : searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="magnifyingglass" size={48} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  {t('noResultsFound')}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol name="terminal" size={48} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  {t('noSessions')}
                </Text>
                <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
                  {t('noSessionsHint')}
                </Text>
              </View>
            )
          }
        />
      )}

      {/* FAB (新規作成ボタン) with modern design */}
      {apiKey && (
        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity 
            style={styles.fab} 
            onPress={openCreateSession} 
            activeOpacity={0.9}
            accessibilityLabel={t('newTask')}
            accessibilityRole="button"
            accessibilityHint="Create a new coding task session"
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="plus" size={28} color={colors.surface} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  header: {
    height: 70,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  headerDark: {
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    padding: 8,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  errorBanner: {
    margin: 16,
    padding: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorBannerDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorContent: {
    flex: 1,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  errorClose: {
    color: '#dc2626',
    fontSize: 20,
    fontWeight: '700',
    paddingLeft: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 20,
  },
  emptyTextDark: {
    color: '#94a3b8',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptySubtextDark: {
    color: '#64748b',
  },
  searchContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'stretch',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  searchBarDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
  },
  filtersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipsContainer: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  filterChipDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  filterChipTextDark: {
    color: '#cbd5e1',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  savedFilterHeader: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savePresetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
