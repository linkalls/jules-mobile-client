import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|type|interface)\b/g;
const STRINGS = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
const NUMBERS = /\b\d+(\.\d+)?\b/g;
const COMMENTS = /\/\/.*|\/\*[\s\S]*?\*\//g;
const BOOLEANS = /\b(true|false|null|undefined)\b/g;

export function CodeBlock({ code, language }: CodeBlockProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const colors = useMemo(() => ({
    keyword: Colors[theme].codeKeyword,
    string: Colors[theme].codeString,
    number: Colors[theme].codeNumber,
    comment: Colors[theme].codeComment,
    boolean: Colors[theme].codeBoolean,
    default: Colors[theme].codeDefault,
  }), [theme]);

  // Simple highlighting by wrapping in spans
  const highlightCode = React.useCallback((code: string) => {
    const partsList: { text: string; color: string }[] = [];
    let lastIdx = 0;
    const matches: { index: number; length: number; color: string; text: string }[] = [];

    // Collect all matches
    [
      { regex: COMMENTS, color: colors.comment },
      { regex: STRINGS, color: colors.string },
      { regex: KEYWORDS, color: colors.keyword },
      { regex: NUMBERS, color: colors.number },
      { regex: BOOLEANS, color: colors.boolean },
    ].forEach(({ regex, color }) => {
      let match;
      const r = new RegExp(regex.source, regex.flags);
      while ((match = r.exec(code)) !== null) {
        matches.push({ index: match.index, length: match[0].length, color, text: match[0] });
      }
    });

    // Sort by index and filter overlaps
    matches.sort((a, b) => a.index - b.index);
    const filtered: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.index >= lastEnd) {
        filtered.push(m);
        lastEnd = m.index + m.length;
      }
    }

    // Build parts
    for (const m of filtered) {
      if (m.index > lastIdx) {
        partsList.push({ text: code.slice(lastIdx, m.index), color: colors.default });
      }
      partsList.push({ text: m.text, color: m.color });
      lastIdx = m.index + m.length;
    }
    if (lastIdx < code.length) {
      partsList.push({ text: code.slice(lastIdx), color: colors.default });
    }

    return partsList;
  }, [colors]);

  const parts = useMemo(() => highlightCode(code), [code, highlightCode]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].codeBackground }]}>
      {language && (
        <View style={[styles.langTag, { backgroundColor: Colors[theme].codeTagBackground }]}>
          <Text style={[styles.langText, { color: Colors[theme].codeTagText }]}>{language}</Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView nestedScrollEnabled style={styles.scroll}>
          <Text style={styles.code} selectable>
            {parts.map((p, i) => (
              <Text key={i} style={{ color: p.color }}>{p.text}</Text>
            ))}
          </Text>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  langTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  langText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scroll: {
    maxHeight: 250,
    padding: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
