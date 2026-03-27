import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { styles } from './styles';

interface ExecutionModeSelectorProps {
  isDark: boolean;
  t: (key: any) => string;
  requirePlanApproval: boolean;
  setRequirePlanApproval: (requirePlanApproval: boolean) => void;
}

export function ExecutionModeSelector({
  isDark,
  t,
  requirePlanApproval,
  setRequirePlanApproval,
}: ExecutionModeSelectorProps) {
  return (
    <View style={[styles.section, { marginTop: 24 }]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{t('executionMode')}</Text>
      <View style={styles.modeContainer}>
        {/* Start Mode */}
        <TouchableOpacity
          style={[
            styles.modeButton,
            isDark && styles.modeButtonDark,
            !requirePlanApproval && styles.modeButtonSelected,
          ]}
          onPress={() => setRequirePlanApproval(false)}
          activeOpacity={0.7}
        >
          <View style={styles.modeHeader}>
            <IconSymbol
              name={!requirePlanApproval ? 'checkmark.circle.fill' : 'circle'}
              size={20}
              color={!requirePlanApproval ? '#2563eb' : isDark ? '#64748b' : '#94a3b8'}
            />
            <Text
              style={[
                styles.modeTitle,
                isDark && styles.modeTitleDark,
                !requirePlanApproval && styles.modeTitleSelected,
              ]}
            >
              {t('modeStart')}
            </Text>
          </View>
          <Text
            style={[
              styles.modeDesc,
              isDark && styles.modeDescDark,
              !requirePlanApproval && styles.modeDescSelected,
            ]}
          >
            {t('modeStartDesc')}
          </Text>
        </TouchableOpacity>

        {/* Review Mode */}
        <TouchableOpacity
          style={[
            styles.modeButton,
            isDark && styles.modeButtonDark,
            requirePlanApproval && styles.modeButtonSelected,
          ]}
          onPress={() => setRequirePlanApproval(true)}
          activeOpacity={0.7}
        >
          <View style={styles.modeHeader}>
            <IconSymbol
              name={requirePlanApproval ? 'checkmark.circle.fill' : 'circle'}
              size={20}
              color={requirePlanApproval ? '#2563eb' : isDark ? '#64748b' : '#94a3b8'}
            />
            <Text
              style={[
                styles.modeTitle,
                isDark && styles.modeTitleDark,
                requirePlanApproval && styles.modeTitleSelected,
              ]}
            >
              {t('modeReview')}
            </Text>
          </View>
          <Text
            style={[
              styles.modeDesc,
              isDark && styles.modeDescDark,
              requirePlanApproval && styles.modeDescSelected,
            ]}
          >
            {t('modeReviewDesc')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
