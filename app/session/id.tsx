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
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActivityItem, ActivityItemSkeleton } from '@/components/jules';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Activity } from '@/constants/types';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';

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
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);
  const { isLoading, error, clearError, fetchActivities, approvePlan } = useJulesApi({ apiKey, t });

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


  // アクティビティ読み込み（初回＋ポーリング）
  useEffect(() => {
    if (apiKey && id) {
      void loadActivities();

      // ポーリング設定 (5秒ごと)
      const interval = setInterval(() => {
        void fetchActivities(id, true).then((data) => {
          setActivities((prev) => {
            // データが増えている場合のみ更新
            if (data.length > prev.length) {
              return data;
            }
            return prev;
          });
        });
      }, 5000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, id]);

  const loadActivities = useCallback(async () => {
    if (!id) return;
    const data = await fetchActivities(id);
    setActivities(data);

    // 最下部にスクロール
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [id, fetchActivities]);

  // プラン承認ハンドラ
  const handleApprovePlan = async (planId: string) => {
    try {
      await approvePlan(planId);
      // リストを更新
      await loadActivities();
    } catch (e) {
      console.error(e);
    }
  };

  // TODO: 実際の送信エンドポイントに合わせて実装
  const handleSend = () => {
    if (!messageInput.trim()) return;
    // 現時点ではモック
    console.log('Send message:', messageInput);
    setMessageInput('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: title || 'Session',
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
          headerTintColor: isDark ? '#f8fafc' : '#0f172a',
          headerRight: () => (
            <TouchableOpacity onPress={loadActivities} style={{ marginRight: 8 }}>
              <IconSymbol name="arrow.clockwise" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {/* エラー表示 */}
        {error && (
          <View style={[styles.errorBanner, isDark && styles.errorBannerDark]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorClose}>×</Text>
            </TouchableOpacity>
          </View>
        )}

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
            renderItem={({ item }) => <ActivityItem activity={item} onApprovePlan={handleApprovePlan} />}
            contentContainerStyle={styles.chatContent}
            style={styles.chatList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <IconSymbol name="bubble.left.and.bubble.right" size={48} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  {t('noActivities')}
                </Text>
              </View>
            }
            ListFooterComponent={
              submittedPr ? (
                <View style={[styles.prCard, isDark && styles.prCardDark]}>
                  <View style={styles.prHeader}>
                    <IconSymbol name="link" size={16} color="#2563eb" />
                    <Text style={[styles.prTitle, isDark && styles.prTitleDark]}>Pull Request Submitted</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.prButton}
                    onPress={() => Linking.openURL(submittedPr)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.prButtonText}>View PR</Text>
                    <IconSymbol name="chevron.right" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        )}

        {/* 入力エリア - Androidではキーボード用パディング付き */}
        <Animated.View
          style={[
            styles.inputContainer,
            isDark && styles.inputContainerDark,
            { paddingBottom: 12 + insets.bottom },
            Platform.OS === 'android' && { marginBottom: keyboardPadding },
          ]}
        >
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder={t('replyPlaceholder')}
            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageInput.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageInput.trim()}
          >
            <IconSymbol name="paperplane.fill" size={18} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
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
  errorBanner: {
    margin: 12,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputContainerDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  inputDark: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  prCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 6,
  },
  prCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  prTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  prTitleDark: {
    color: '#e2e8f0',
  },
  prButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  prButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
