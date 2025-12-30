import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import type { Session } from '@/constants/types';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

interface SkeletonProps {
  width: number | string;
  height: number;
  style?: object;
}

/**
 * シマー効果付きスケルトン
 */
function Skeleton({ width, height, style }: SkeletonProps) {
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
          borderRadius: height / 2,
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * スケルトンカード
 */
export function SessionCardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.headerRow}>
        <Skeleton width="60%" height={20} />
        <Skeleton width={60} height={20} />
      </View>
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
      <View style={[styles.footer, { marginTop: 12 }]}>
        <Skeleton width={12} height={12} style={{ borderRadius: 6 }} />
        <Skeleton width={100} height={12} />
      </View>
    </View>
  );
}

/**
 * セッション一覧のカードコンポーネント
 */
export function SessionCard({ session, onPress }: SessionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();

  const getStateColor = () => {
    switch (session.state) {
      case 'ACTIVE':
        return isDark ? '#34d399' : '#059669';
      case 'COMPLETED':
        return isDark ? '#60a5fa' : '#2563eb';
      case 'FAILED':
        return isDark ? '#f87171' : '#dc2626';
      default:
        return isDark ? '#94a3b8' : '#64748b';
    }
  };

  const getStateBgColor = () => {
    switch (session.state) {
      case 'ACTIVE':
        return isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.1)';
      case 'COMPLETED':
        return isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)';
      case 'FAILED':
        return isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.1)';
      default:
        return isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.1)';
    }
  };

  const getStateLabel = () => {
    switch (session.state) {
      case 'ACTIVE':
        return t('stateActive');
      case 'COMPLETED':
        return t('stateCompleted');
      case 'FAILED':
        return t('stateFailed');
      default:
        return t('stateUnknown');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
          {session.title || 'Untitled Session'}
        </Text>
        <View style={[styles.badge, { backgroundColor: getStateBgColor() }]}>
          <Text style={[styles.badgeText, { color: getStateColor() }]}>
            {getStateLabel()}
          </Text>
        </View>
      </View>

      <Text style={[styles.nameText, isDark && styles.nameTextDark]} numberOfLines={1}>
        {session.name}
      </Text>

      <View style={styles.footer}>
        <IconSymbol name="link" size={12} color={isDark ? '#64748b' : '#94a3b8'} />
        <Text style={[styles.footerText, isDark && styles.footerTextDark]}>Repository Link...</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  titleDark: {
    color: '#f8fafc',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94a3b8',
  },
  nameTextDark: {
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerTextDark: {
    color: '#94a3b8',
  },
});
