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
  Modal,
  ActivityIndicator,
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
import type { TranslationKey } from '@/constants/i18n';
import { useApiKey } from '@/constants/api-key-context';
import { Colors } from '@/constants/theme';

// Sort and filter options
const SORT_OPTIONS = ['newest', 'oldest', 'title'] as const;
type SortOption = typeof SORT_OPTIONS[number];

const FILTER_STATUS_OPTIONS = ['all', 'ACTIVE', 'IN_PROGRESS', 'AWAITING_PLAN_APPROVAL', 'COMPLETED', 'FAILED'] as const;
type FilterStatus = typeof FILTER_STATUS_OPTIONS[number];

// Memoized SessionCard wrapper for performance
const MemoizedSessionCard = memo(({ session, onPress }: { session: Session; onPress: () => void }) => (
  <SessionCard session={session} onPress={onPress} />
));
MemoizedSessionCard.displayName = 'MemoizedSessionCard';

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const fabScale = React.useRef(new Animated.Value(0)).current;

  const { 
    isLoading, 
    error, 
    clearError, 
    sessions,
    fetchSessions, 
    fetchMoreSessions,
    hasMoreSessions,
    isLoadingMoreSessions 
  } = useJulesApi({ apiKey, t });

  // Filter options with labels
  const filterOptions = useMemo(() => [
    { key: 'all' as FilterStatus, label: t('filterAll') },
    { key: 'ACTIVE' as FilterStatus, label: t('filterActive') },
    { key: 'IN_PROGRESS' as FilterStatus, label: t('filterInProgress') },
    { key: 'AWAITING_PLAN_APPROVAL' as FilterStatus, label: t('filterAwaitingPlanApproval') },
    { key: 'COMPLETED' as FilterStatus, label: t('filterCompleted') },
    { key: 'FAILED' as FilterStatus, label: t('filterFailed') },
  ], [t]);

  // Extract PR URLs from sessions
  const sessionsWithPr = useMemo(() => {
    return sessions.map(extractPrUrl);
  }, [sessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessionsWithPr];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session => 
        (session.title?.toLowerCase() || '').includes(query) ||
        session.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(session => session.state === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime();
      } else {
        // Sort by title
        const titleA = a.title?.toLowerCase() || '';
        const titleB = b.title?.toLowerCase() || '';
        return titleA.localeCompare(titleB);
      }
    });

    return result;
  }, [sessionsWithPr, searchQuery, sortBy, filterStatus]);

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

  const loadSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const openSession = useCallback((session: Session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-session');
  }, []);

  const renderSessionItem = useCallback(({ item }: { item: Session }) => (
    <MemoizedSessionCard session={item} onPress={() => openSession(item)} />
  ), [openSession]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              <IconSymbol name="terminal" size={20} color="#ffffff" />
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
          <TouchableOpacity 
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilterModal(true);
            }}
            accessibilityLabel={`${t('sortBy')}: ${t(`sortBy${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}` as TranslationKey)}`}
          >
            <IconSymbol 
              name={sortBy === 'newest' ? 'arrow.down.circle' : sortBy === 'oldest' ? 'arrow.up.circle' : 'textformat.abc'} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilterModal(true);
            }}
            accessibilityLabel={t('filterByStatus')}
          >
            <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={colors.primary} />
          </TouchableOpacity>
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
            ) : searchQuery.trim() || filterStatus !== 'all' ? (
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('filterByStatus')}</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.icon }]}>{t('sortBy')}</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterOption, isDark && styles.filterOptionDark]}
                  onPress={() => {
                    setSortBy(option);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.filterOptionText, { color: colors.text }]}>
                    {t(`sortBy${option.charAt(0).toUpperCase() + option.slice(1)}` as TranslationKey)}
                  </Text>
                  {sortBy === option && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.icon }]}>{t('filterByStatus')}</Text>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.filterOption, isDark && styles.filterOptionDark]}
                  onPress={() => {
                    setFilterStatus(option.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.filterOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  {filterStatus === option.key && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
              <IconSymbol name="plus" size={28} color="#ffffff" />
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalContentDark: {
    backgroundColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  filterOptionDark: {
    backgroundColor: '#0f172a',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
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
