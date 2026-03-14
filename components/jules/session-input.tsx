import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SessionInputProps {
  isDark: boolean;
  insetsBottom: number;
  keyboardPadding: Animated.Value;
  messageInput: string;
  setMessageInput: (text: string) => void;
  t: (key: string) => string;
  handleSend: () => void;
}

export function SessionInput({
  isDark,
  insetsBottom,
  keyboardPadding,
  messageInput,
  setMessageInput,
  t,
  handleSend
}: SessionInputProps) {
  return (
    <Animated.View
      style={[
        styles.inputContainer,
        isDark && styles.inputContainerDark,
        { paddingBottom: 12 + insetsBottom },
        Platform.OS === 'android' && { marginBottom: keyboardPadding },
      ]}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder={t('replyPlaceholder')}
          placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageInput.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageInput.trim()}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityHint="Send message"
        >
          <IconSymbol name="paperplane.fill" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputContainerDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  inputDark: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
});
