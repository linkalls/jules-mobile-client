import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import type { Session } from '@/constants/types';
import { Colors } from '@/constants/theme';

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
 * セッション一覧のカードコンポーネント - Modern Enhanced Version
 */
export const SessionCard = React.memo(function SessionCard({ session, onPress }: SessionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();
  const colors = isDark ? Colors.dark : Colors.light;
  
  // Animation for press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getStateColor = () => {
    switch (session.state) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return colors.success;
      case 'COMPLETED':
        return colors.primary;
      case 'FAILED':
        return colors.error;
      case 'AWAITING_PLAN_APPROVAL':
      case 'AWAITING_USER_FEEDBACK':
        return colors.warning;
      case 'QUEUED':
      case 'PLANNING':
      case 'PAUSED':
        return colors.icon;
      default:
        return colors.icon;
    }
  };

  const getStateBgColor = () => {
    switch (session.state) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.1)';
      case 'COMPLETED':
        return isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)';
      case 'FAILED':
        return isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.1)';
      case 'AWAITING_PLAN_APPROVAL':
      case 'AWAITING_USER_FEEDBACK':
        return isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)';
      case 'QUEUED':
      case 'PLANNING':
      case 'PAUSED':
        return isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.1)';
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
      case 'QUEUED':
        return t('stateQueued');
      case 'PLANNING':
        return t('statePlanning');
      case 'AWAITING_PLAN_APPROVAL':
        return t('stateAwaitingPlanApproval');
      case 'AWAITING_USER_FEEDBACK':
        return t('stateAwaitingUserFeedback');
      case 'IN_PROGRESS':
        return t('stateInProgress');
      case 'PAUSED':
        return t('statePaused');
      default:
        return t('stateUnknown');
    }
  };

  const isActiveState = session.state === 'ACTIVE' || session.state === 'IN_PROGRESS';
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isActiveState ? [0.3, 0.7] : [0, 0],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {/* Active session glow effect */}
        {isActiveState && (
          <Animated.View 
            style={[
              styles.glowBorder,
              { 
                opacity: glowOpacity,
                borderColor: getStateColor(),
              }
            ]} 
          />
        )}
        
        {/* Gradient accent for active sessions */}
        {isActiveState && (
          <LinearGradient
            colors={isDark 
              ? ['rgba(129, 140, 248, 0.1)', 'rgba(52, 211, 153, 0.1)']
              : ['rgba(99, 102, 241, 0.05)', 'rgba(16, 185, 129, 0.05)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientOverlay}
          />
        )}
        
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
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    shadowColor: '#818cf8',
    shadowOpacity: 0.15,
  },
  glowBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    borderWidth: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    letterSpacing: -0.3,
  },
  titleDark: {
    color: '#f8fafc',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94a3b8',
    zIndex: 1,
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
