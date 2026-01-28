import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import { useSecureStorage } from '@/hooks/use-secure-storage';
import type { Source } from '@/constants/types';
import { Colors } from '@/constants/theme';

/**
 * シマー効果付きスケルトン
 */
function Skeleton({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 8,
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * フォームスケルトン
 */
function FormSkeleton({ paddingBottom }: { paddingBottom: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView 
      contentContainerStyle={[skeletonStyles.content, { paddingBottom }]}
    >
      {/* ラベル1 */}
      <View style={skeletonStyles.section}>
        <Skeleton width={200} height={16} style={{ marginBottom: 8 }} />
        {/* セレクトボックス */}
        <View style={[skeletonStyles.selectBox, isDark && skeletonStyles.selectBoxDark]}>
          <Skeleton width="60%" height={16} />
          <Skeleton width={16} height={16} style={{ borderRadius: 8 }} />
        </View>
      </View>

      {/* ラベル2 */}
      <View style={[skeletonStyles.section, { marginTop: 24 }]}>
        <Skeleton width={180} height={16} style={{ marginBottom: 8 }} />
        {/* テキストエリア */}
        <View style={[skeletonStyles.textArea, isDark && skeletonStyles.textAreaDark]}>
          <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="75%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={14} />
        </View>
      </View>

      {/* ボタン */}
      <Skeleton width="100%" height={52} style={{ marginTop: 24, borderRadius: 12 }} />
    </ScrollView>
  );
}

const skeletonStyles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    gap: 8,
  },
  selectBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    height: 120,
  },
  textAreaDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
});

export default function CreateSessionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { apiKey } = useApiKey();
  const { saveRecentRepo, getRecentRepos } = useSecureStorage();
  const [selectedSource, setSelectedSource] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sourcesLoaded, setSourcesLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentRepos, setRecentRepos] = useState<Source[]>([]);

  const { 
    isLoading, 
    error, 
    clearError, 
    sources,
    hasMoreSources,
    isLoadingMoreSources,
    fetchSources, 
    fetchMoreSources,
    createSession 
  } = useJulesApi({ apiKey, t });

  // Load recent repos on mount
  useEffect(() => {
    void getRecentRepos().then(setRecentRepos);
  }, [getRecentRepos]);

  // Pre-fetch sources when screen loads
  useEffect(() => {
    if (apiKey && !sourcesLoaded) {
      void fetchSources().then(() => setSourcesLoaded(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Filter recent repos to only include those that still exist in sources
  const validRecentRepos = useMemo(() => {
    const sourceNames = new Set(sources.map(s => s.name));
    return recentRepos.filter(r => sourceNames.has(r.name));
  }, [sources, recentRepos]);

  // Memoize all sources excluding recent ones
  const allSources = useMemo(() => {
    const recentNames = validRecentRepos.map(r => r.name);
    return sources.filter(s => !recentNames.includes(s.name));
  }, [sources, validRecentRepos]);

  // Helper function to get display name for a source
  const getSourceDisplayName = useCallback((source: Source): string => {
    return source.githubRepo
      ? `${source.githubRepo.owner}/${source.githubRepo.repo}`
      : source.displayName || source.name;
  }, []);

  // Background fetch more sources while dropdown is open
  useEffect(() => {
    if (!isDropdownOpen || !hasMoreSources || isLoadingMoreSources) return;
    
    // Fetch next page after a short delay while dropdown is open
    const timer = setTimeout(() => {
      void fetchMoreSources();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropdownOpen, hasMoreSources, isLoadingMoreSources, sources.length]);

  // Toggle dropdown (sources already loaded)
  const toggleSources = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen]);

  // Handle scroll to load more sources (manual trigger)
  const handleSourcesScroll = (event: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    
    if (isCloseToBottom && hasMoreSources && !isLoadingMoreSources) {
      void fetchMoreSources();
    }
  };

  // Create session and save to recent repos
  const handleCreate = useCallback(async () => {
    if (!selectedSource || !prompt.trim()) {
      Alert.alert(t('error'), t('inputError'));
      return;
    }

    // Get source object from either recent or fetched sources
    const source = sources.find((s) => s.name === selectedSource) || recentRepos.find((s) => s.name === selectedSource);
    const defaultBranch = source?.githubRepo?.defaultBranch?.displayName || 'main';

    const session = await createSession(selectedSource, prompt, defaultBranch, []);
    if (session && source) {
      // Save to recent repos
      await saveRecentRepo(source);
      Alert.alert(t('createSuccess'), '', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  }, [selectedSource, prompt, sources, recentRepos, createSession, saveRecentRepo, t, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('newTask'),
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
          headerTintColor: isDark ? '#f8fafc' : '#0f172a',
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {isLoading ? (
          <FormSkeleton paddingBottom={40 + insets.bottom} />
        ) : (
          <ScrollView 
            contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Error */}
            {error && (
              <View style={[styles.errorBanner, isDark && styles.errorBannerDark]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Text style={styles.errorClose}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Source selection */}
            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                {t('selectRepo')}
              </Text>
              <TouchableOpacity
                style={[styles.selectButton, isDark && styles.selectButtonDark]}
                onPress={toggleSources}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    isDark && styles.selectButtonTextDark,
                    !selectedSource && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {selectedSource
                    ? (() => {
                        const source = sources.find((s) => s.name === selectedSource);
                        return source ? getSourceDisplayName(source) : selectedSource;
                      })()
                    : t('selectPlaceholder')}
                </Text>
                <IconSymbol name={isDropdownOpen ? 'chevron.up' : 'chevron.down'} size={16} color={isDark ? '#64748b' : '#94a3b8'} />
              </TouchableOpacity>

              {/* Source list with lazy loading */}
              {isDropdownOpen && sourcesLoaded && sources.length > 0 && (
                <ScrollView 
                  style={[styles.sourceList, isDark && styles.sourceListDark]}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  onScroll={handleSourcesScroll}
                  scrollEventThrottle={400}
                >
                  {/* Recent Repositories Section */}
                  {validRecentRepos.length > 0 && (
                    <>
                      <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
                        <IconSymbol name="clock" size={14} color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={[styles.sectionHeaderText, isDark && styles.sectionHeaderTextDark]}>
                          {t('recentRepos')}
                        </Text>
                      </View>
                      {validRecentRepos.map((source) => {
                        return (
                          <TouchableOpacity
                            key={source.name}
                            style={[
                              styles.sourceItem,
                              selectedSource === source.name && styles.sourceItemSelected,
                              isDark && styles.sourceItemDark,
                            ]}
                            onPress={() => {
                              setSelectedSource(source.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <IconSymbol
                              name="clock.fill"
                              size={14}
                              color={selectedSource === source.name ? '#2563eb' : isDark ? '#60a5fa' : '#3b82f6'}
                            />
                            <Text
                              style={[
                                styles.sourceItemText,
                                isDark && styles.sourceItemTextDark,
                                selectedSource === source.name && styles.sourceItemTextSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {getSourceDisplayName(source)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}
                  
                  {/* All Repositories Section */}
                  {allSources.length > 0 && (
                    <>
                      {validRecentRepos.length > 0 && (
                        <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark, { marginTop: 8 }]}>
                          <IconSymbol name="folder" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                          <Text style={[styles.sectionHeaderText, isDark && styles.sectionHeaderTextDark]}>
                            {t('allRepos')}
                          </Text>
                        </View>
                      )}
                      {allSources.map((source) => {
                        return (
                          <TouchableOpacity
                            key={source.name}
                            style={[
                              styles.sourceItem,
                              selectedSource === source.name && styles.sourceItemSelected,
                              isDark && styles.sourceItemDark,
                            ]}
                            onPress={() => {
                              setSelectedSource(source.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <IconSymbol
                              name="link"
                              size={14}
                              color={selectedSource === source.name ? '#2563eb' : isDark ? '#64748b' : '#94a3b8'}
                            />
                            <Text
                              style={[
                                styles.sourceItemText,
                                isDark && styles.sourceItemTextDark,
                                selectedSource === source.name && styles.sourceItemTextSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {getSourceDisplayName(source)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}
                  {/* Loading indicator for more sources */}
                  {isLoadingMoreSources && (
                    <View style={styles.loadingMore}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={[styles.loadingMoreText, isDark && styles.loadingMoreTextDark]}>
                        {t('loadingMore')}
                      </Text>
                    </View>
                  )}
                  {/* End of list indicator */}
                  {!hasMoreSources && sources.length > 20 && (
                    <View style={styles.endOfList}>
                      <Text style={[styles.endOfListText, isDark && styles.endOfListTextDark]}>
                        {sources.length} repos
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {sourcesLoaded && sources.length === 0 && isDropdownOpen && (
                <Text style={[styles.hint, { color: '#f59e0b' }]}>
                  {t('noSourcesFound')}
                </Text>
              )}
              
              {/* Helper hint */}
              {!isDropdownOpen && sourcesLoaded && sources.length > 0 && (
                <Text style={[styles.hint, isDark && styles.hintDark]}>
                  {t('repoHint')}
                </Text>
              )}
            </View>

            {/* プロンプト入力 */}
            <View style={[styles.section, { marginTop: 24 }]}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, isDark && styles.labelDark]}>{t('promptLabel')}</Text>
                <Text style={[styles.charCounter, isDark && styles.charCounterDark]}>
                  {prompt.length} / 500
                </Text>
              </View>
              <TextInput
                style={[styles.textArea, isDark && styles.textAreaDark]}
                value={prompt}
                onChangeText={setPrompt}
                placeholder={t('promptPlaceholder')}
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* 作成ボタン with gradient */}
            <TouchableOpacity
              style={[
                styles.createButton, 
                (!selectedSource || !prompt.trim()) && styles.createButtonDisabled
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleCreate();
              }}
              disabled={!selectedSource || !prompt.trim() || isLoading}
              activeOpacity={0.9}
            >
              {(!selectedSource || !prompt.trim()) ? (
                <View style={styles.createButtonContent}>
                  <IconSymbol name="plus" size={20} color="#94a3b8" />
                  <Text style={[styles.createButtonText, styles.createButtonTextDisabled]}>
                    {t('startSession')}
                  </Text>
                </View>
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.createButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconSymbol name="plus" size={20} color="#ffffff" />
                  <Text style={styles.createButtonText}>{t('startSession')}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
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
  content: {
    padding: 16,
  },
  errorBanner: {
    marginBottom: 16,
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
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  labelDark: {
    color: '#cbd5e1',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#94a3b8',
  },
  charCounterDark: {
    color: '#64748b',
  },
  selectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  selectButtonText: {
    fontSize: 15,
    color: '#0f172a',
    flex: 1,
  },
  selectButtonTextDark: {
    color: '#f8fafc',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  sourceList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    maxHeight: 250,
  },
  sourceListDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sourceItemDark: {
    borderBottomColor: '#334155',
  },
  sourceItemSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  sourceItemText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  sourceItemTextDark: {
    color: '#e2e8f0',
  },
  sourceItemTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  hintDark: {
    color: '#64748b',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    height: 120,
  },
  textAreaDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  createButton: {
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#e2e8f0',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  createButtonDisabled: {
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createButtonTextDisabled: {
    color: '#94a3b8',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingMoreTextDark: {
    color: '#94a3b8',
  },
  endOfList: {
    alignItems: 'center',
    padding: 8,
  },
  endOfListText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  endOfListTextDark: {
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionHeaderDark: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#334155',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderTextDark: {
    color: '#94a3b8',
  },
});
