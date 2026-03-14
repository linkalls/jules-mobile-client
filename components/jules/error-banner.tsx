import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorBannerProps {
  error: string | null;
  isDark: boolean;
  t: (key: string) => string;
  clearError: () => void;
}

export function ErrorBanner({ error, isDark, t, clearError }: ErrorBannerProps) {
  if (!error) return null;

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
