import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorBannerProps {
  error: string;
  clearError: () => void;
  onRefresh: () => void;
  isDark: boolean;
  t: (key: string) => string;
}

export function ErrorBanner({ error, clearError, onRefresh, isDark, t }: ErrorBannerProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
});
