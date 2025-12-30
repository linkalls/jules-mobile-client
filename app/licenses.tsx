import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface License {
  name: string;
  version: string;
  license: string;
  url?: string;
}

const licenses = require('../assets/licenses.json') as License[];

export default function LicensesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const openUrl = (url?: string) => {
    if (url) {
      void Linking.openURL(url);
    }
  };

  // ライセンスタイプ別のバッジカラー
  const getBadgeColor = (license: string) => {
    if (license === 'MIT') return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', darkText: '#4ade80' };
    if (license === 'Apache-2.0') return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', darkText: '#60a5fa' };
    return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', darkText: '#c084fc' };
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('licenses'),
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
          headerTintColor: isDark ? '#f8fafc' : '#0f172a',
        }}
      />

      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* ヘッダーカード */}
        <View style={[styles.headerCard, isDark && styles.headerCardDark]}>
          <IconSymbol name="doc.text" size={32} color={isDark ? '#60a5fa' : '#3b82f6'} />
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Open Source Libraries
          </Text>
          <Text style={[styles.headerText, isDark && styles.headerTextDark]}>
            {t('licensesDescription')}
          </Text>
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, isDark && styles.statBadgeDark]}>
              <Text style={[styles.statNumber, isDark && styles.statNumberDark]}>{licenses.length}</Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>packages</Text>
            </View>
          </View>
        </View>

        {/* ライブラリ一覧 */}
        {licenses.map((lib, index) => {
          const badgeColor = getBadgeColor(lib.license);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.item, isDark && styles.itemDark]}
              onPress={() => openUrl(lib.url)}
              activeOpacity={0.7}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                  <Text style={[styles.itemName, isDark && styles.itemNameDark]}>
                    {lib.name}
                  </Text>
                  <Text style={[styles.itemVersion, isDark && styles.itemVersionDark]}>
                    {lib.version}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <View style={[styles.licenseBadge, { backgroundColor: badgeColor.bg }]}>
                    <Text style={[styles.licenseText, { color: isDark ? badgeColor.darkText : badgeColor.text }]}>
                      {lib.license}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={isDark ? '#475569' : '#94a3b8'} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* フッター */}
        <View style={styles.footer}>
          <View style={[styles.footerCard, isDark && styles.footerCardDark]}>
            <Text style={[styles.footerTitle, isDark && styles.footerTitleDark]}>
              Jules Mobile Client
            </Text>
            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
              © 2024 linkalls • MIT License
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCardDark: {
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  headerText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  headerTextDark: {
    color: '#94a3b8',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statBadgeDark: {
    backgroundColor: '#334155',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statNumberDark: {
    color: '#60a5fa',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  statLabelDark: {
    color: '#94a3b8',
  },
  item: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemDark: {
    backgroundColor: '#1e293b',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  itemLeft: {
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemNameDark: {
    color: '#f8fafc',
  },
  itemVersion: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  itemVersionDark: {
    color: '#94a3b8',
  },
  licenseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    paddingTop: 24,
  },
  footerCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerCardDark: {
    backgroundColor: '#1e293b',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  footerTitleDark: {
    color: '#f8fafc',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  footerTextDark: {
    color: '#64748b',
  },
});
