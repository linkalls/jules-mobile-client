import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Appearance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSecureStorage } from '@/hooks/use-secure-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const colors = isDark ? Colors.dark : Colors.light;

  const { apiKey, setApiKey: saveApiKeyToContext } = useApiKey();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [manualDarkMode, setManualDarkMode] = useState(isDark);
  
  const { language, setLanguage, t } = useI18n();

  const { saveTheme, getTheme } = useSecureStorage();

  // Sync local key with context
  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      if (savedTheme === 'dark') setManualDarkMode(true);
      else if (savedTheme === 'light') setManualDarkMode(false);
    };
    void loadTheme();
  }, [getTheme]);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await saveApiKeyToContext(localApiKey);
      Alert.alert(t('savedSuccess'));
    } catch {
      Alert.alert(t('error'), t('savedError'));
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setManualDarkMode(value);
    const theme = value ? 'dark' : 'light';
    await saveTheme(theme);
    Appearance.setColorScheme(theme);
  };

  const toggleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLang = language === 'ja' ? 'en' : 'ja';
    setLanguage(newLang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Modern Header with Gradient */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <LinearGradient
          colors={isDark 
            ? [colors.surface, colors.surfaceSecondary]
            : [colors.surface, colors.surfaceSecondary]
          }
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* APIキー設定 */}
        <View style={styles.section}>
          <Text style={[styles.label, isDark && styles.labelDark]}>{t('apiKeyLabel')}</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={localApiKey}
            onChangeText={setLocalApiKey}
            placeholder="AIzaSy..."
            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.hint, isDark && styles.hintDark]}>
            {t('apiKeyHint')}
          </Text>
        </View>

        {/* 保存ボタン with gradient */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave} 
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* テーマ切り替え */}
        <View style={[styles.section, styles.sectionMargin]}>
          <View style={[styles.switchRow, isDark && styles.switchRowDark]}>
            <View style={styles.switchLabel}>
              <IconSymbol
                name={isDark ? 'moon.fill' : 'sun.max.fill'}
                size={20}
                color={isDark ? '#fbbf24' : '#f59e0b'}
              />
              <Text style={[styles.label, isDark && styles.labelDark]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={manualDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={manualDarkMode ? '#ffffff' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* 言語切り替え */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.switchRow, isDark && styles.switchRowDark]} 
            onPress={toggleLanguage}
          >
            <View style={styles.switchLabel}>
              <Text style={{ fontSize: 20 }}>{language === 'ja' ? '🇯🇵' : '🇺🇸'}</Text>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                {language === 'ja' ? 'Language / 言語' : 'Language'}
              </Text>
            </View>
            <Text style={[styles.langValue, isDark && styles.langValueDark]}>
              {language === 'ja' ? '日本語' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ライセンス */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.switchRow, isDark && styles.switchRowDark]} 
            onPress={() => router.push('/licenses')}
          >
            <View style={styles.switchLabel}>
              <IconSymbol name="doc.text" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={[styles.label, isDark && styles.labelDark]}>
                {t('licenses')}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={isDark ? '#475569' : '#94a3b8'} />
          </TouchableOpacity>
        </View>

        {/* About/Version */}
        <View style={styles.section}>
          <View style={[styles.switchRow, isDark && styles.switchRowDark]}>
            <View style={styles.switchLabel}>
              <IconSymbol name="info.circle" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={[styles.label, isDark && styles.labelDark]}>
                {t('appVersion')}
              </Text>
            </View>
            <Text style={[styles.langValue, isDark && styles.langValueDark]}>
              v{Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </View>

        {/* ヒント */}
        <View style={[styles.hintBox, isDark && styles.hintBoxDark]}>
          <View style={styles.hintHeader}>
            <IconSymbol name="lightbulb" size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
            <Text style={[styles.hintBoxTitle, isDark && styles.hintBoxTitleDark]}>{t('hint')}</Text>
          </View>
          <Text style={[styles.hintBoxText, isDark && styles.hintBoxTextDark]}>
            {t('securityHint')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  header: {
    height: 70,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  headerDark: {
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionMargin: {
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  labelDark: {
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  hintDark: {
    color: '#64748b',
  },
  saveButton: {
    borderRadius: 14,
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hintBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    padding: 18,
    borderRadius: 14,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  hintBoxDark: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    borderLeftColor: '#818cf8',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  hintBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6366f1',
  },
  hintBoxTitleDark: {
    color: '#818cf8',
  },
  hintBoxText: {
    fontSize: 13,
    color: '#4f46e5',
    lineHeight: 20,
  },
  hintBoxTextDark: {
    color: '#a5b4fc',
  },
  switchRowDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  langValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  langValueDark: {
    color: '#818cf8',
  },
});
