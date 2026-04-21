import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
  Linking,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActivityItem, ActivityItemSkeleton } from '@/components/jules';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { shareSession } from '@/hooks/use-export-session';
import type { Activity, Session } from '@/constants/types';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import { SessionHeaderRight } from '@/components/jules/session-header-right';
import { ErrorBanner } from '@/components/jules/error-banner';
import { ApprovalBanner } from '@/components/jules/approval-banner';
import { FeedbackBanner } from '@/components/jules/feedback-banner';
import { SessionInput } from '@/components/jules/session-input';
import { PrCard } from '@/components/jules/pr-card';

export default function SessionDetailScreen() {
  const { id, title, submittedPr } = useLocalSearchParams<{ id: string; title: string; submittedPr?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const { apiKey } = useApiKey();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sessionState, setSessionState] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentSubmittedPr, setCurrentSubmittedPr] = useState<string | import('@/constants/types').PullRequest | undefined>(submittedPr);
  // Ref mirror of currentSubmittedPr to avoid stale closures inside setInterval
  const currentSubmittedPrRef = useRef(currentSubmittedPr);
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);
  const { isLoading, error, clearError, fetchActivities, fetchActivitiesSince, fetchSession, approvePlan, sendMessage } = useJulesApi({ apiKey, t });

  // キーボード表示時のアニメーション付きパディング調整
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;
      // iOSではKeyboardAvoidingViewが処理、Androidでは手動でパディング
      if (Platform.OS === 'android') {
        Animated.timing(keyboardPadding, {
          toValue: keyboardHeight,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
      // キーボード表示時に最下部へスクロール
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'android') {
        Animated.timing(keyboardPadding, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardPadding]);

  // Keep ref in sync with state to avoid stale closures in the polling interval
  useEffect(() => {
    currentSubmittedPrRef.current = currentSubmittedPr;
  }, [currentSubmittedPr]);

  // アクティビティ読み込み（初回＋ポーリング）
  useEffect(() => {
    if (apiKey && id) {
      void loadActivities();
      void loadSessionState();

      // ポーリング設定 (5秒ごと)
      const interval = setInterval(async () => {
        // 最後のactivityのcreateTimeを基準に差分取得
        setActivities((prev) => {
          const lastActivity = prev[prev.length - 1];
          const sinceTime = lastActivity?.createTime ?? new Date(0).toISOString();

          void fetchActivitiesSince(id, sinceTime, true).then((newActivities) => {
            if (newActivities.length > 0) {
              setActivities((currentActivities) => {
                const existingNames = new Set(currentActivities.map((a) => a.name));
                const truly_new = newActivities.filter((a) => !existingNames.has(a.name));
                if (truly_new.length === 0) return currentActivities;

                // 自動スクロール
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                return [...currentActivities, ...truly_new];
              });
            }
          });
          return prev;
        });

        // Also poll session state to detect state changes
        const session = await fetchSession(id, true);
        if (session) {
          setSessionState(session.state);
          setCurrentSession(session);

          // Use ref to read the latest value without causing a stale closure
          if (session.state === 'COMPLETED' && !currentSubmittedPrRef.current) {
            for (const output of session.outputs ?? []) {
              if (output.pullRequest?.url) {
                setCurrentSubmittedPr(output.pullRequest);
                break;
              }
            }
          }
        }
      }, 5000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, id]);

  // sessionState の変化を監視してHaptics通知
  const prevSessionStateRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionState) return;
    const prev = prevSessionStateRef.current;
    prevSessionStateRef.current = sessionState;

    if (prev && prev !== sessionState) {
      if (sessionState === 'COMPLETED') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (sessionState === 'FAILED') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (
        sessionState === 'AWAITING_PLAN_APPROVAL' ||
        sessionState === 'AWAITING_USER_FEEDBACK'
      ) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  }, [sessionState]);

  const loadActivities = useCallback(async () => {
    if (!id) return;
    const data = await fetchActivities(id);
    setActivities(data);

    // 最下部にスクロール
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [id, fetchActivities]);

  const loadSessionState = useCallback(async () => {
    if (!id) return;
    const session = await fetchSession(id, true);
    if (session) {
      setSessionState(session.state);
      setCurrentSession(session);

      // Update PR link if newly available from outputs
      if (!currentSubmittedPr && session.state === 'COMPLETED' && session.outputs && session.outputs.length > 0) {
        for (const output of session.outputs) {
          if (output.pullRequest?.url) {
            setCurrentSubmittedPr(output.pullRequest);
            break;
          }
        }
      }
    }
  }, [id, fetchSession, currentSubmittedPr]);

  // プラン承認ハンドラ
  const handleApprovePlan = useCallback(async (_planId: string) => {
    if (!id) return;
    try {
      await approvePlan(id); // Pass session name, not planId
      // リストを更新
      await loadActivities();
      await loadSessionState();
    } catch {
      // Error is already handled by the API hook
    }
  }, [id, approvePlan, loadActivities, loadSessionState]);

  const renderActivityItem = useCallback(({ item }: { item: Activity }) => (
    <ActivityItem activity={item} onApprovePlan={handleApprovePlan} />
  ), [handleApprovePlan]);

  const handleSend = async () => {
    if (!messageInput.trim() || !id) return;

    const messageToSend = messageInput;
    setMessageInput(''); // Clear immediately for better UX

    try {
      await sendMessage(id, messageToSend);
      // Reload activities to show the new message
      await loadActivities();
    } catch {
      // Error is already handled by the API hook
      // Optionally show error or restore input
    }
  };

  const STATE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    QUEUED:                  { label: t('stateQueued'),                color: '#64748b', icon: 'clock' },
    IN_PROGRESS:             { label: t('stateInProgress'),            color: '#2563eb', icon: 'arrow.clockwise' },
    AWAITING_PLAN_APPROVAL:  { label: t('stateAwaitingPlanApproval'), color: '#f59e0b', icon: 'hand.raised' },
    AWAITING_USER_FEEDBACK:  { label: t('stateAwaitingUserFeedback'), color: '#8b5cf6', icon: 'bubble.left' },
    COMPLETED:               { label: t('stateCompleted'),             color: '#10b981', icon: 'checkmark.circle' },
    FAILED:                  { label: t('stateFailed'),                color: '#ef4444', icon: 'xmark.circle' },
    PAUSED:                  { label: t('statePaused'),                color: '#94a3b8', icon: 'pause.circle' },
  };

  // Export session handler
  const handleExportSession = useCallback(async (format: 'markdown' | 'json') => {
    if (!currentSession || activities.length === 0) {
      Alert.alert(t('error'), t('noSessionDataToExport'));
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await shareSession(currentSession, activities, format);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('exportFailed');
      if (errorMessage.includes('not available')) {
        Alert.alert(t('error'), t('sharingNotAvailable'));
      } else {
        Alert.alert(t('error'), errorMessage);
      }
    }
  }, [currentSession, activities, t]);

  // Show export menu
  const showExportMenu = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('cancel'), t('exportAsMarkdown'), t('exportAsJSON')],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            void handleExportSession('markdown');
          } else if (buttonIndex === 2) {
            void handleExportSession('json');
          }
        }
      );
    } else {
      // Android - show simple alert
      Alert.alert(
        t('exportSession'),
        t('chooseExportFormat'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('exportAsMarkdown'), onPress: () => void handleExportSession('markdown') },
          { text: t('exportAsJSON'), onPress: () => void handleExportSession('json') },
        ]
      );
    }
  }, [t, handleExportSession]);


  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
                {title || 'Session'}
              </Text>
              {sessionState && STATE_CONFIG[sessionState] && (
                <View style={styles.headerSubtitleContainer}>
                  <IconSymbol name={STATE_CONFIG[sessionState].icon as any} size={10} color={STATE_CONFIG[sessionState].color} />
                  <Text style={[styles.headerSubtitle, { color: STATE_CONFIG[sessionState].color }]}>
                    {STATE_CONFIG[sessionState].label}
                  </Text>
                </View>
              )}
            </View>
          ),
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
          headerTintColor: isDark ? '#f8fafc' : '#0f172a',
          headerRight: () => (
            <SessionHeaderRight
              sessionState={sessionState}
              sessionUrl={currentSession?.url}
              isDark={isDark}
              t={t}
              showExportMenu={showExportMenu}
              loadActivities={loadActivities}
            />
          ),
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {/* エラー表示 */}
        <ErrorBanner error={error} isDark={isDark} t={t} clearError={clearError} />

        {/* Global approve button fallback (API may not emit planApprovalRequested activity) */}
        <ApprovalBanner sessionState={sessionState} id={id} isDark={isDark} t={t} handleApprovePlan={handleApprovePlan} />
        <FeedbackBanner sessionState={sessionState} isDark={isDark} t={t} />

        {/* チャットエリア */}
        {isLoading && activities.length === 0 ? (
          <View style={styles.chatContent}>
            <ActivityItemSkeleton isAgent={true} />
            <ActivityItemSkeleton isAgent={false} />
            <ActivityItemSkeleton isAgent={true} />
            <ActivityItemSkeleton isAgent={true} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={activities}
            keyExtractor={(item) => item.name}
            renderItem={renderActivityItem}
            contentContainerStyle={styles.chatContent}
            style={styles.chatList}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListHeaderComponent={
              sessionState === 'COMPLETED' && currentSubmittedPr ? (
                <TouchableOpacity
                  style={[styles.prBanner, isDark && styles.prBannerDark]}
                  onPress={() => {
                    const url = typeof currentSubmittedPr === 'string'
                      ? currentSubmittedPr
                      : currentSubmittedPr.url;
                    if (url) void Linking.openURL(url);
                  }}
                >
                  <LinearGradient
                    colors={['#059669', '#10b981']}
                    style={styles.prBannerGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <IconSymbol name="arrow.triangle.pull" size={18} color="#ffffff" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.prBannerTitle}>{t('pullRequestCreated')}</Text>
                      {typeof currentSubmittedPr !== 'string' && currentSubmittedPr?.title && (
                        <Text style={styles.prBannerSubtitle} numberOfLines={1}>
                          {currentSubmittedPr.title}
                        </Text>
                      )}
                    </View>
                    <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.7)" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <IconSymbol name="bubble.left.and.bubble.right" size={48} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  {t('noActivities')}
                </Text>
              </View>
            }
            ListFooterComponent={null}
          />
        )}

        {/* 入力エリア - Androidではキーボード用パディング付き */}
        <SessionInput
          isDark={isDark}
          insetsBottom={insets.bottom}
          keyboardPadding={keyboardPadding}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          t={t}
          handleSend={handleSend}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  chatList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
  },
  emptyTextDark: {
    color: '#94a3b8',
  },
  prBanner: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  prBannerDark: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
  prBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  prBannerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  prBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  headerTitleContainer: {
    alignItems: Platform.OS === 'ios' ? 'center' : 'flex-start',
    justifyContent: 'center',
    maxWidth: Platform.OS === 'ios' ? 200 : 250,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});
