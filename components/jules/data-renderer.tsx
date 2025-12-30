import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DataRendererProps {
  data: unknown;
  depth?: number;
}

/**
 * キー名を読みやすく変換する
 * 例: createTime -> Create Time
 */
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

/**
 * 再帰的にデータを表示するコンポーネント
 * どんな謎データが来ても見れるようにするよ！
 */
export function DataRenderer({ data, depth = 0 }: DataRendererProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (data === null || data === undefined) {
    return <Text style={[styles.nullText, isDark && styles.nullTextDark]}>null</Text>;
  }

  // プリミティブな値
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return (
      <Text style={[styles.valueText, isDark && styles.valueTextDark]} selectable>
        {String(data)}
      </Text>
    );
  }

  // 配列の場合
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <Text style={[styles.nullText, isDark && styles.nullTextDark]}>Empty List</Text>;
    }

    return (
      <View style={styles.arrayContainer}>
        {data.map((item, idx) => (
          <View key={idx} style={[styles.arrayItem, isDark && styles.arrayItemDark]}>
            <Text style={[styles.indexText, isDark && styles.indexTextDark]}>#{idx + 1}</Text>
            <View style={styles.itemContent}>
              <DataRenderer data={item} depth={depth + 1} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // オブジェクトの場合
  if (typeof data === 'object') {
    const keys = Object.keys(data as Record<string, unknown>);
    if (keys.length === 0) {
      return <Text style={[styles.nullText, isDark && styles.nullTextDark]}>Empty Object</Text>;
    }

    return (
      <View style={[styles.objectContainer, depth > 0 && styles.nestedObject]}>
        {keys.map((key) => (
          <View key={key} style={styles.objectField}>
            <Text style={[styles.keyText, isDark && styles.keyTextDark]}>{formatKey(key)}</Text>
            <View style={styles.fieldValue}>
              <DataRenderer data={(data as Record<string, unknown>)[key]} depth={depth + 1} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Fallback for unknown types - convert to JSON string
  return <Text>{JSON.stringify(data)}</Text>;
}

const styles = StyleSheet.create({
  nullText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  nullTextDark: {
    color: '#64748b',
  },
  valueText: {
    color: '#334155',
    flexShrink: 1,
  },
  valueTextDark: {
    color: '#cbd5e1',
  },
  arrayContainer: {
    gap: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 6,
  },
  arrayItemDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  indexText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
    minWidth: 20,
  },
  indexTextDark: {
    color: '#64748b',
  },
  itemContent: {
    flex: 1,
  },
  objectContainer: {
    gap: 4,
  },
  nestedObject: {
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 8,
    marginLeft: 4,
  },
  objectField: {
    marginBottom: 4,
  },
  keyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  keyTextDark: {
    color: '#94a3b8',
  },
  fieldValue: {
    paddingLeft: 2,
  },
});
