import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { styles } from './styles';
import type { Source } from '@/constants/types';

interface SourceSelectorProps {
  isDark: boolean;
  t: (key: any) => string;
  isLoading: boolean;
  selectedSource: string;
  sourcesMap: Map<string, Source>;
  getSourceDisplayName: (source: Source) => string;
  toggleSources: () => void;
  isDropdownOpen: boolean;
  sourcesLoaded: boolean;
  sources: Source[];
  sourceQuery: string;
  setSourceQuery: (query: string) => void;
  handleSourcesScroll: (event: any) => void;
  filteredRecentRepos: Source[];
  filteredAllSources: Source[];
  setSelectedSource: (source: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  isLoadingMoreSources: boolean;
  hasMoreSources: boolean;
}

export function SourceSelector({
  isDark,
  t,
  isLoading,
  selectedSource,
  sourcesMap,
  getSourceDisplayName,
  toggleSources,
  isDropdownOpen,
  sourcesLoaded,
  sources,
  sourceQuery,
  setSourceQuery,
  handleSourcesScroll,
  filteredRecentRepos,
  filteredAllSources,
  setSelectedSource,
  setIsDropdownOpen,
  isLoadingMoreSources,
  hasMoreSources,
}: SourceSelectorProps) {
  return (
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
                const source = sourcesMap.get(selectedSource);
                return source ? getSourceDisplayName(source) : selectedSource;
              })()
            : t('selectPlaceholder')}
        </Text>
        <IconSymbol name={isDropdownOpen ? 'chevron.up' : 'chevron.down'} size={16} color={isDark ? '#64748b' : '#94a3b8'} />
      </TouchableOpacity>

      {/* Source list with lazy loading */}
      {isDropdownOpen && sourcesLoaded && sources.length > 0 && (
        <View style={[styles.sourceList, isDark && styles.sourceListDark]}>
          <View style={[styles.repoSearchContainer, isDark && styles.repoSearchContainerDark]}>
            <IconSymbol name="magnifyingglass" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
            <TextInput
              style={[styles.repoSearchInput, isDark && styles.repoSearchInputDark]}
              placeholder={t('searchSessions')}
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={sourceQuery}
              onChangeText={setSourceQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            onScroll={handleSourcesScroll}
            scrollEventThrottle={400}
          >
            {/* Recent Repositories Section */}
            {filteredRecentRepos.length > 0 && (
              <>
                <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
                  <IconSymbol name="clock" size={14} color={isDark ? '#60a5fa' : '#2563eb'} />
                  <Text style={[styles.sectionHeaderText, isDark && styles.sectionHeaderTextDark]}>
                    {t('recentRepos')}
                  </Text>
                </View>
                {filteredRecentRepos.map((source: Source) => {
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
                        setSourceQuery('');
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
            {filteredAllSources.length > 0 && (
              <>
                {filteredRecentRepos.length > 0 && (
                  <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark, { marginTop: 8 }]}>
                    <IconSymbol name="folder" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text style={[styles.sectionHeaderText, isDark && styles.sectionHeaderTextDark]}>
                      {t('allRepos')}
                    </Text>
                  </View>
                )}
                {filteredAllSources.map((source: Source) => {
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
                        setSourceQuery('');
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
        </View>
      )}

      {sourcesLoaded && isDropdownOpen && (sources.length === 0 || (filteredRecentRepos.length === 0 && filteredAllSources.length === 0 && !isLoadingMoreSources)) && (
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
  );
}
