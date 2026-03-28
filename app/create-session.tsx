import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import { useSecureStorage } from '@/hooks/use-secure-storage';
import { useSourcesCache } from '@/hooks/use-sources-cache';
import type { Source } from '@/constants/types';
import { Colors } from '@/constants/theme';

import { FormSkeleton } from '@/components/jules/create-session/form-skeleton';
import { SourceSelector } from '@/components/jules/create-session/source-selector';
import { PromptInput } from '@/components/jules/create-session/prompt-input';
import { ExecutionModeSelector } from '@/components/jules/create-session/execution-mode-selector';
import { SubmitButton } from '@/components/jules/create-session/submit-button';
import { styles } from '@/components/jules/create-session/styles';

export default function CreateSessionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { apiKey } = useApiKey();
  const { saveRecentRepo, getRecentRepos } = useSecureStorage();
  const { getCachedSources, saveCachedSources } = useSourcesCache();
  const [selectedSource, setSelectedSource] = useState('');
  const [prompt, setPrompt] = useState('');
  const [requirePlanApproval, setRequirePlanApproval] = useState(false); // false = Start/Run, true = Review
  const [sourcesLoaded, setSourcesLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentRepos, setRecentRepos] = useState<Source[]>([]);
  const [sourceQuery, setSourceQuery] = useState('');

  const {
    isLoading,
    error,
    clearError,
    sources,
    setSources,
    hasMoreSources,
    isLoadingMoreSources,
    fetchMoreSources,
    syncAllSources,
    createSession
  } = useJulesApi({ apiKey, t });

  // Load recent repos on mount
  useEffect(() => {
    void getRecentRepos().then(setRecentRepos);
  }, [getRecentRepos]);

  // Pre-fetch sources when screen loads
  useEffect(() => {
    if (apiKey && !sourcesLoaded) {
      const loadSources = async () => {
        // 1. Try to load from cache
        const cached = await getCachedSources();
        let hasAnySources = false;
        if (cached && cached.length > 0) {
          setSources(cached);
          setSourcesLoaded(true); // Allow immediate filtering from cache
          hasAnySources = true;
        }

        // 2. Fetch full sources list in background without blowing up UI
        try {
          const freshSources = await syncAllSources();
          if (freshSources && freshSources.length > 0) {
            setSources(freshSources);
            await saveCachedSources(freshSources);
            if (!hasAnySources) {
              // Only mark as loaded here if we didn't already do so via cache
              setSourcesLoaded(true);
            }
          }
        } catch (e) {
          // If there was no cache and the full sync failed, leave sourcesLoaded as false
          // so the UI can decide to trigger a retry or lighter fetch path.
          if (hasAnySources) {
            // We at least have cached data; keep the previously set loaded state.
            return;
          }
        }
      };
      void loadSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Save sources to cache when they change significantly (like via fetchMoreSources)
  useEffect(() => {
    if (sources.length > 0 && sourcesLoaded) {
      void saveCachedSources(sources);
    }
  }, [sources, sourcesLoaded, saveCachedSources]);

  // Filter recent repos to only include those that still exist in sources
  const validRecentRepos = useMemo(() => {
    const sourceNames = new Set(sources.map(s => s.name));
    return recentRepos.filter(r => sourceNames.has(r.name));
  }, [sources, recentRepos]);

  const sourceMatchesQuery = useCallback((source: Source) => {
    if (!sourceQuery.trim()) return true;
    const q = sourceQuery.toLowerCase();
    const display = source.githubRepo
      ? `${source.githubRepo.owner}/${source.githubRepo.repo}`
      : source.displayName || source.name;
    return display.toLowerCase().includes(q) || source.name.toLowerCase().includes(q);
  }, [sourceQuery]);

  // Memoize all sources excluding recent ones
  const allSources = useMemo(() => {
    const recentNames = new Set(validRecentRepos.map(r => r.name));
    return sources.filter(s => !recentNames.has(s.name));
  }, [sources, validRecentRepos]);

  const filteredRecentRepos = useMemo(() => {
    return validRecentRepos.filter(sourceMatchesQuery);
  }, [validRecentRepos, sourceMatchesQuery]);

  const filteredAllSources = useMemo(() => {
    return allSources.filter(sourceMatchesQuery);
  }, [allSources, sourceMatchesQuery]);

  // Helper function to get display name for a source
  const getSourceDisplayName = useCallback((source: Source): string => {
    return source.githubRepo
      ? `${source.githubRepo.owner}/${source.githubRepo.repo}`
      : source.displayName || source.name;
  }, []);

  // Toggle dropdown (sources already loaded)
  const toggleSources = useCallback(() => {
    if (isDropdownOpen) {
      setSourceQuery('');
    }
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

  const sourcesMap = useMemo(() => {
    const map = new Map<string, Source>();
    for (const source of sources) {
      map.set(source.name, source);
    }
    return map;
  }, [sources]);

  // Create session and save to recent repos
  const handleCreate = useCallback(async () => {
    if (!selectedSource || !prompt.trim()) {
      Alert.alert(t('error'), t('inputError'));
      return;
    }

    if (prompt.length > 50000) {
      Alert.alert(t('error'), t('promptTooLong'));
      return;
    }

    // Get source object from sourcesMap (validRecentRepos are already included in sources)
    const source = sourcesMap.get(selectedSource);
    const defaultBranch = source?.githubRepo?.defaultBranch?.displayName || 'main';

    const session = await createSession(selectedSource, prompt, defaultBranch, [], requirePlanApproval);
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
  }, [selectedSource, prompt, requirePlanApproval, sourcesMap, createSession, saveRecentRepo, t]);

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
                <TouchableOpacity
                  onPress={clearError}
                  accessibilityLabel={t('close')}
                  accessibilityRole="button"
                  accessibilityHint={t('close')}
                >
                  <Text style={styles.errorClose}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            <SourceSelector
              isDark={isDark}
              t={t}
              isLoading={isLoading}
              selectedSource={selectedSource}
              sourcesMap={sourcesMap}
              getSourceDisplayName={getSourceDisplayName}
              toggleSources={toggleSources}
              isDropdownOpen={isDropdownOpen}
              sourcesLoaded={sourcesLoaded}
              sources={sources}
              sourceQuery={sourceQuery}
              setSourceQuery={setSourceQuery}
              handleSourcesScroll={handleSourcesScroll}
              filteredRecentRepos={filteredRecentRepos}
              filteredAllSources={filteredAllSources}
              setSelectedSource={setSelectedSource}
              setIsDropdownOpen={setIsDropdownOpen}
              isLoadingMoreSources={isLoadingMoreSources}
              hasMoreSources={hasMoreSources}
            />

            <PromptInput
              isDark={isDark}
              t={t}
              prompt={prompt}
              setPrompt={setPrompt}
            />

            <ExecutionModeSelector
              isDark={isDark}
              t={t}
              requirePlanApproval={requirePlanApproval}
              setRequirePlanApproval={setRequirePlanApproval}
            />

            <SubmitButton
              selectedSource={selectedSource}
              prompt={prompt}
              isLoading={isLoading}
              handleCreate={handleCreate}
              t={t}
              colors={colors}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
