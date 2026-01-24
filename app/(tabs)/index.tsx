import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SessionCard, SessionCardSkeleton } from '@/components/jules';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Session } from '@/constants/types';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';

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

  const { apiKey } = useApiKey();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { isLoading, error, clearError, fetchSessions } = useJulesApi({ apiKey, t });

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
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const openSession = (session: Session) => {
    router.push({
      pathname: '/session/id',
      params: {
        id: session.name,
        title: session.title || 'Session',
        submittedPr: session.submittedPr || '',
      },
    });
  };

  const openCreateSession = () => {
    router.push('/create-session');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      {/* ヘッダー */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <IconSymbol name="terminal" size={20} color="#ffffff" />
          </View>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Jules Client</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
          <IconSymbol
            name="arrow.clockwise"
            size={20}
            color={isDark ? '#94a3b8' : '#64748b'}
          />
        </TouchableOpacity>
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
          renderItem={({ item }) => (
            <MemoizedSessionCard session={item} onPress={() => openSession(item)} />
          )}
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

      {/* FAB (新規作成ボタン) */}
      {apiKey && (
        <TouchableOpacity style={styles.fab} onPress={openCreateSession} activeOpacity={0.8}>
          <IconSymbol name="plus" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    backgroundColor: '#2563eb',
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
  },
  errorClose: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  emptyTextDark: {
    color: '#94a3b8',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptySubtextDark: {
    color: '#64748b',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
