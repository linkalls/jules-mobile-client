import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
      <View style={[styles.objectContainer, depth > 0 && styles.nestedObject, depth > 0 && isDark && styles.nestedObjectDark]}>
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
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
  },
  nullTextDark: {
    color: Colors.dark.tabIconDefault,
  },
  valueText: {
    color: Colors.light.text,
    flexShrink: 1,
  },
  valueTextDark: {
    color: Colors.dark.text,
  },
  arrayContainer: {
    gap: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.light.surfaceSecondary,
    padding: 8,
    borderRadius: 6,
  },
  arrayItemDark: {
    backgroundColor: Colors.dark.surfaceSecondary,
  },
  indexText: {
    fontSize: 10,
    color: Colors.light.tabIconDefault,
    fontFamily: 'monospace',
    minWidth: 20,
  },
  indexTextDark: {
    color: Colors.dark.tabIconDefault,
  },
  itemContent: {
    flex: 1,
  },
  objectContainer: {
    gap: 4,
  },
  nestedObject: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.light.border,
    paddingLeft: 8,
    marginLeft: 4,
  },
  nestedObjectDark: {
    borderLeftColor: Colors.dark.border,
  },
  objectField: {
    marginBottom: 4,
  },
  keyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.icon,
    marginBottom: 2,
  },
  keyTextDark: {
    color: Colors.dark.icon,
  },
  fieldValue: {
    paddingLeft: 2,
  },
});
