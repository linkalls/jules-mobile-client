import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function getSessionStateText(state: string | null, t: (key: string) => string): string {
  if (!state) return '';
  switch (state) {
    case 'QUEUED': return t('stateQueued');
    case 'PLANNING': return t('statePlanning');
    case 'AWAITING_PLAN_APPROVAL': return t('stateAwaitingPlanApproval');
    case 'AWAITING_USER_FEEDBACK': return t('stateAwaitingUserFeedback');
    case 'IN_PROGRESS': return t('stateInProgress');
    case 'PAUSED': return t('statePaused');
    case 'FAILED': return t('stateFailed');
    case 'COMPLETED': return t('stateCompleted');
    case 'ACTIVE': return t('stateActive');
    default: return t('stateUnknown');
  }
}

interface SessionHeaderRightProps {
  sessionState: string | null;
  isDark: boolean;
  t: (key: string) => string;
  showExportMenu: () => void;
  loadActivities: () => void;
}

export function SessionHeaderRight({ sessionState, isDark, t, showExportMenu, loadActivities }: SessionHeaderRightProps) {
  return (
    <View style={styles.headerRightContainer}>
      {sessionState && (
        <View style={[
          styles.stateBadge,
          sessionState === 'AWAITING_PLAN_APPROVAL' && styles.stateBadgeWarning,
          sessionState === 'COMPLETED' && styles.stateBadgeSuccess,
          sessionState === 'FAILED' && styles.stateBadgeError,
          isDark && styles.stateBadgeDark,
        ]}>
          <Text style={[
            styles.stateBadgeText,
            sessionState === 'AWAITING_PLAN_APPROVAL' && styles.stateBadgeTextWarning,
            sessionState === 'COMPLETED' && styles.stateBadgeTextSuccess,
            sessionState === 'FAILED' && styles.stateBadgeTextError,
          ]}>
            {getSessionStateText(sessionState, t)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={showExportMenu}
        accessibilityLabel={t('exportSession')}
        accessibilityRole="button"
        accessibilityHint={t('chooseExportFormat')}
      >
        <IconSymbol name="square.and.arrow.up" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={loadActivities}
        accessibilityLabel={t('refresh')}
        accessibilityRole="button"
        accessibilityHint={t('refresh')}
      >
        <IconSymbol name="arrow.clockwise" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  stateBadgeDark: {
    backgroundColor: '#334155',
  },
  stateBadgeWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  stateBadgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  stateBadgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  stateBadgeTextWarning: {
    color: '#f59e0b',
  },
  stateBadgeTextSuccess: {
    color: '#22c55e',
  },
  stateBadgeTextError: {
    color: '#ef4444',
  },
});
