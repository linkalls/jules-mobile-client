import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const isDark = colorScheme === 'dark';

  const colors = {
    keyword: isDark ? '#c586c0' : '#af00db',
    string: isDark ? '#ce9178' : '#a31515',
    number: isDark ? '#b5cea8' : '#098658',
    comment: isDark ? '#6a9955' : '#008000',
    boolean: isDark ? '#569cd6' : '#0000ff',
    default: isDark ? '#d4d4d4' : '#1e1e1e',
  };

  // Simple highlighting by wrapping in spans
  const highlightCode = (text: string) => {
    const parts: { text: string; color: string }[] = [];
    let lastIndex = 0;
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
      while ((match = r.exec(text)) !== null) {
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
      if (m.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, m.index), color: colors.default });
      }
      parts.push({ text: m.text, color: m.color });
      lastIndex = m.index + m.length;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), color: colors.default });
    }

    return parts;
  };

  const parts = highlightCode(code);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {language && (
        <View style={[styles.langTag, isDark && styles.langTagDark]}>
          <Text style={styles.langText}>{language}</Text>
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  containerDark: {
    backgroundColor: '#1e1e1e',
  },
  langTag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  langTagDark: {
    backgroundColor: '#333',
  },
  langText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
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
