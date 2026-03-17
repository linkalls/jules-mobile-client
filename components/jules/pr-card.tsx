import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { isValidExternalLink } from '@/utils/url';

import type { PullRequest } from '@/constants/types';

interface PrCardProps {
  submittedPr?: string | PullRequest;
  isDark: boolean;
  t: (key: string) => string;
}

export function PrCard({ submittedPr, isDark, t }: PrCardProps) {
  if (!submittedPr) return null;

  const isObject = typeof submittedPr === 'object';
  const url = isObject ? submittedPr.url : submittedPr;
  const title = isObject ? submittedPr.title : 'Pull Request Submitted';
  const description = isObject ? submittedPr.description : null;

  return (
    <View style={[styles.prCard, isDark && styles.prCardDark]}>
      <View style={styles.prHeader}>
        <IconSymbol name="link" size={16} color="#2563eb" />
        <Text style={[styles.prTitle, isDark && styles.prTitleDark]}>{title}</Text>
      </View>
      {description && (
        <Text style={[styles.prDescription, isDark && styles.prDescriptionDark]}>
          {description}
        </Text>
      )}
      <TouchableOpacity
        style={styles.prButton}
        onPress={() => {
          if (url && isValidExternalLink(url)) {
            void Linking.openURL(url);
          } else {
            Alert.alert(t('error'), t('unableToOpenLink'));
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.prButtonText}>View PR</Text>
        <IconSymbol name="chevron.right" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  prDescription: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  prDescriptionDark: {
    color: '#94a3b8',
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
