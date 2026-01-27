import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
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
import { Colors } from '@/constants/theme';

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fabScale = React.useRef(new Animated.Value(0)).current;

  const { isLoading, error, clearError, fetchSessions } = useJulesApi({ apiKey, t });

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
    const data = await fetchSessions();
    const sessionsWithPr = data.map(extractPrUrl);
    setSessions(sessionsWithPr);
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
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={onRefresh} 
            disabled={isLoading}
            style={styles.refreshButton}
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
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorClose}>×</Text>
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
          data={sessions}
          keyExtractor={(item) => item.name}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#60a5fa' : '#2563eb'} />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(_, index) => ({ length: 100, offset: 112 * index, index })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorBannerDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
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
