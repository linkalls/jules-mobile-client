import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FeedbackBannerProps {
  sessionState: string | null;
  isDark: boolean;
  t: (key: string) => string;
}

export function FeedbackBanner({ sessionState, isDark, t }: FeedbackBannerProps) {
  if (sessionState !== 'AWAITING_USER_FEEDBACK') return null;

  return (
    <View style={[styles.banner, isDark && styles.bannerDark]} accessibilityRole="alert" accessibilityLabel={t('stateAwaitingUserFeedback')}>
      <LinearGradient
        colors={isDark
          ? ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']
          : ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.03)']}
        style={StyleSheet.absoluteFill}
      />
      <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color="#8b5cf6" />
      <Text style={[styles.text, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>
        Jules is waiting for your response
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    overflow: 'hidden',
  },
  bannerDark: {
    borderColor: '#8b5cf6',
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
});
