import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * ローディングオーバーレイコンポーネント
 */
export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.content, isDark && styles.contentDark]}>
        <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
        {message && (
          <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  contentDark: {
    backgroundColor: '#1e293b',
  },
  message: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
  },
  messageDark: {
    color: '#cbd5e1',
  },
});
