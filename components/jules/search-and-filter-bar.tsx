import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';


import type { SessionFilterState, SessionFilterPreset } from '@/hooks/use-secure-storage';

export interface SearchAndFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  activeFilter: SessionFilterState;
  setActiveFilter: (filter: SessionFilterState) => void;
  filterOptions: { key: SessionFilterState; labelKey: string }[];
  savedPresets: SessionFilterPreset[];
  saveCurrentPreset: () => void;
  applyPreset: (preset: SessionFilterPreset) => void;
  colors: any;
  isDark: boolean;
  t: (key: string) => string;
}

export function SearchAndFilterBar({
  searchQuery,
  setSearchQuery,
  clearSearch,
  activeFilter,
  setActiveFilter,
  filterOptions,
  savedPresets,
  saveCurrentPreset,
  applyPreset,
  colors,
  isDark,
  t,
}: SearchAndFilterBarProps) {
  return (
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

      <Text style={[styles.filterLabel, { color: colors.icon }]}>{t('quickFilters')}</Text>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterChipsContainer}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.key;
          return (
            <TouchableOpacity
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
                {t(item.labelKey as any)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.savedFilterHeader}>
        <Text style={[styles.filterLabel, { color: colors.icon }]}>{t('savedFilters')}</Text>
        <TouchableOpacity onPress={saveCurrentPreset}>
          <Text style={[styles.savePresetText, { color: colors.primary }]}>{t('saveCurrentFilter')}</Text>
        </TouchableOpacity>
      </View>

      {savedPresets.length > 0 && (
        <FlatList
          data={savedPresets}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterChipsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, isDark && styles.filterChipDark]}
              onPress={() => applyPreset(item)}
            >
              <Text style={[styles.filterChipText, isDark && styles.filterChipTextDark]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  filterLabel: {
    marginTop: 8,
    marginBottom: 6,
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
});
