import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

interface PromptInputProps {
  isDark: boolean;
  t: (key: any) => string;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export function PromptInput({
  isDark,
  t,
  prompt,
  setPrompt,
}: PromptInputProps) {
  return (
    <View style={[styles.section, { marginTop: 24 }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, isDark && styles.labelDark]}>{t('promptLabel')}</Text>
        <Text style={[styles.charCounter, isDark && styles.charCounterDark]}>
          {prompt.length} chars
        </Text>
      </View>
      <TextInput
        style={[styles.textArea, isDark && styles.textAreaDark]}
        value={prompt}
        onChangeText={setPrompt}
        placeholder={t('promptPlaceholder')}
        placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}
