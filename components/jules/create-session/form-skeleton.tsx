import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * フォームスケルトン
 */
export function FormSkeleton({ paddingBottom }: { paddingBottom: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      contentContainerStyle={[skeletonStyles.content, { paddingBottom }]}
    >
      {/* ラベル1 */}
      <View style={skeletonStyles.section}>
        <Skeleton width={200} height={16} borderRadius={8} style={{ marginBottom: 8 }} />
        {/* セレクトボックス */}
        <View style={[skeletonStyles.selectBox, isDark && skeletonStyles.selectBoxDark]}>
          <Skeleton width="60%" height={16} borderRadius={8} />
          <Skeleton width={16} height={16} borderRadius={8} style={{ borderRadius: 8 }} />
        </View>
      </View>

      {/* ラベル2 */}
      <View style={[skeletonStyles.section, { marginTop: 24 }]}>
        <Skeleton width={180} height={16} borderRadius={8} style={{ marginBottom: 8 }} />
        {/* テキストエリア */}
        <View style={[skeletonStyles.textArea, isDark && skeletonStyles.textAreaDark]}>
          <Skeleton width="90%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="75%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={14} borderRadius={8} />
        </View>
      </View>

      {/* ボタン */}
      <Skeleton width="100%" height={52} borderRadius={12} style={{ marginTop: 24, borderRadius: 12 }} />
    </ScrollView>
  );
}

const skeletonStyles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    gap: 8,
  },
  selectBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    height: 120,
  },
  textAreaDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
});
