import React, { useState } from 'react';
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
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingOverlay } from '@/components/jules';
import { useJulesApi } from '@/hooks/use-jules-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';

export default function CreateSessionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { apiKey } = useApiKey();
  const [selectedSource, setSelectedSource] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sourcesLoaded, setSourcesLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Load sources when dropdown opens
  const toggleSources = async () => {
    if (!sourcesLoaded) {
      await fetchSources();
      setSourcesLoaded(true);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle scroll to load more sources
  const handleSourcesScroll = (event: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    
    if (isCloseToBottom && hasMoreSources && !isLoadingMoreSources) {
      fetchMoreSources();
    }
  };

  // Create session
  const handleCreate = async () => {
    if (!selectedSource || !prompt.trim()) {
      Alert.alert(t('error'), t('inputError'));
      return;
    }

    const session = await createSession(selectedSource, prompt);
    if (session) {
      Alert.alert(t('createSuccess'), '', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  };

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
                  ? sources.find((s) => s.name === selectedSource)?.displayName || selectedSource
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
                {sources.map((source) => {
                  const displayName = source.githubRepo
                    ? `${source.githubRepo.owner}/${source.githubRepo.repo}`
                    : source.displayName || source.name;
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
                        {displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
          </View>

          {/* プロンプト入力 */}
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('promptLabel')}</Text>
            <TextInput
              style={[styles.textArea, isDark && styles.textAreaDark]}
              value={prompt}
              onChangeText={setPrompt}
              placeholder={t('promptPlaceholder')}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* 作成ボタン */}
          <TouchableOpacity
            style={[styles.createButton, (!selectedSource || !prompt.trim()) && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!selectedSource || !prompt.trim() || isLoading}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>{t('startSession')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <LoadingOverlay visible={isLoading} message={t('processing')} />
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
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
});
