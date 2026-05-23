import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { styles } from './styles';

interface SubmitButtonProps {
  selectedSource: string;
  prompt: string;
  isLoading: boolean;
  handleCreate: () => void;
  t: (key: any) => string;
  colors: any;
}

export function SubmitButton({
  selectedSource,
  prompt,
  isLoading,
  handleCreate,
  t,
  colors,
}: SubmitButtonProps) {
  const buttonLabel = isLoading ? 'Creating...' : 'Start Task';

  return (
    <TouchableOpacity
      style={[
        styles.createButton,
        (!selectedSource || !prompt.trim()) && styles.createButtonDisabled
      ]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        void handleCreate();
      }}
      disabled={!selectedSource || !prompt.trim() || isLoading}
      activeOpacity={0.9}
    >
      {(!selectedSource || !prompt.trim()) ? (
        <View style={styles.createButtonContent}>
          <IconSymbol name="plus" size={20} color="#94a3b8" />
          <Text style={[styles.createButtonText, styles.createButtonTextDisabled]}>
            {buttonLabel}
          </Text>
        </View>
      ) : (
        <View style={[styles.createButtonGradient, { backgroundColor: colors.primary }]}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <IconSymbol name="plus" size={20} color="#ffffff" />
          )}
          <Text style={styles.createButtonText}>{buttonLabel}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
