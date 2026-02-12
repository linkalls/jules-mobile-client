import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import { useJulesApi } from '@/hooks/use-jules-api';
import { Colors } from '@/constants/theme';
import type { Session } from '@/constants/types';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { t } = useI18n();
  const { apiKey } = useApiKey();
  const { sessions } = useJulesApi({ apiKey, t });

  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s: Session) => 
      s.state === 'ACTIVE' || 
      s.state === 'QUEUED' || 
      s.state === 'PLANNING' || 
      s.state === 'IN_PROGRESS' ||
      s.state === 'AWAITING_PLAN_APPROVAL'
    ).length;
    const completed = sessions.filter((s: Session) => s.state === 'COMPLETED').length;
    const failed = sessions.filter((s: Session) => s.state === 'FAILED').length;

    return { total, active, completed, failed };
  }, [sessions]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('statistics'),
          headerStyle: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          },
          headerTintColor: isDark ? '#f8fafc' : '#0f172a',
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Total Sessions */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <LinearGradient
              colors={isDark ? ['#1e3a8a', '#1e40af'] : ['#3b82f6', '#2563eb']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statIcon}>
                <IconSymbol name="bubble.left.and.bubble.right" size={28} color="#ffffff" />
              </View>
              <Text style={styles.statLabel}>{t('totalSessions')}</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </LinearGradient>
          </View>

          {/* Active Sessions */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <LinearGradient
              colors={isDark ? ['#15803d', '#16a34a'] : ['#22c55e', '#16a34a']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statIcon}>
                <IconSymbol name="arrow.clockwise" size={28} color="#ffffff" />
              </View>
              <Text style={styles.statLabel}>{t('activeSessions')}</Text>
              <Text style={styles.statValue}>{stats.active}</Text>
            </LinearGradient>
          </View>

          {/* Completed Sessions */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <LinearGradient
              colors={isDark ? ['#059669', '#10b981'] : ['#34d399', '#10b981']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statIcon}>
                <IconSymbol name="checkmark.circle.fill" size={28} color="#ffffff" />
              </View>
              <Text style={styles.statLabel}>{t('completedSessions')}</Text>
              <Text style={styles.statValue}>{stats.completed}</Text>
            </LinearGradient>
          </View>

          {/* Failed Sessions */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <LinearGradient
              colors={isDark ? ['#b91c1c', '#dc2626'] : ['#ef4444', '#dc2626']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statIcon}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#ffffff" />
              </View>
              <Text style={styles.statLabel}>{t('failedSessions')}</Text>
              <Text style={styles.statValue}>{stats.failed}</Text>
            </LinearGradient>
          </View>

          {/* Info Section */}
          <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
            <View style={styles.infoHeader}>
              <IconSymbol name="info.circle" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
                {t('about')}
              </Text>
            </View>
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {t('statisticsHint')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardDark: {
    elevation: 4,
    shadowOpacity: 0.3,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoBoxDark: {
    backgroundColor: '#1e293b',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  infoTitleDark: {
    color: '#f8fafc',
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  infoTextDark: {
    color: '#94a3b8',
  },
});
