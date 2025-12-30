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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSecureStorage } from '@/hooks/use-secure-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/constants/i18n-context';
import { useApiKey } from '@/constants/api-key-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

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
    try {
      await saveApiKeyToContext(localApiKey);
      Alert.alert(t('savedSuccess'));
    } catch {
      Alert.alert(t('error'), t('savedError'));
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    setManualDarkMode(value);
    const theme = value ? 'dark' : 'light';
    await saveTheme(theme);
    Appearance.setColorScheme(theme);
  };

  const toggleLanguage = () => {
    const newLang = language === 'ja' ? 'en' : 'ja';
    setLanguage(newLang);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      {/* ヘッダー */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>{t('settings')}</Text>
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

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{t('save')}</Text>
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
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionMargin: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  labelDark: {
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  inputDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
  },
  hintDark: {
    color: '#64748b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hintBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  hintBoxDark: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  hintBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  hintBoxTitleDark: {
    color: '#60a5fa',
  },
  hintBoxText: {
    fontSize: 13,
    color: '#1d4ed8',
    lineHeight: 18,
  },
  hintBoxTextDark: {
    color: '#93c5fd',
  },
  switchRowDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  langValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  langValueDark: {
    color: '#60a5fa',
  },
});
