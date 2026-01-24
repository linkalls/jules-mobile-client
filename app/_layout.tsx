import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ApiKeyProvider } from '@/constants/api-key-context';
import { I18nProvider } from '@/constants/i18n-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApiKeyProvider>
      <I18nProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="create-session" options={{ presentation: 'modal', title: 'New Task' }} />
            <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </I18nProvider>
    </ApiKeyProvider>
  );
}

