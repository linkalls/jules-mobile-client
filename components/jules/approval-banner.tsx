import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TranslationKey } from '@/constants/i18n';

interface ApprovalBannerProps {
  sessionState: string | null;
  id: string | undefined;
  isDark: boolean;
  t: (key: TranslationKey) => string;
  handleApprovePlan: (planId: string) => void;
}

export function ApprovalBanner({ sessionState, id, isDark, t, handleApprovePlan }: ApprovalBannerProps) {
  if (sessionState !== 'AWAITING_PLAN_APPROVAL' || !id) return null;

  return (
    <View style={[styles.approvalBanner, isDark && styles.approvalBannerDark]}>
      <Text style={[styles.approvalBannerText, isDark && styles.approvalBannerTextDark]}>
        {t('planWaitingApproval')}
      </Text>
      <TouchableOpacity
        style={styles.approvalBannerButton}
        onPress={() => void handleApprovePlan(id)}
        accessibilityRole="button"
        accessibilityLabel={t('approve')}
        accessibilityHint={t('planWaitingApproval')}
      >
        <Text style={styles.approvalBannerButtonText}>{t('approve')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  approvalBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  approvalBannerDark: {
    backgroundColor: 'rgba(251, 191, 36, 0.16)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  approvalBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  approvalBannerTextDark: {
    color: '#fcd34d',
  },
  approvalBannerButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approvalBannerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
