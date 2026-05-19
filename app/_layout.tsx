import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import analytics from '@react-native-firebase/analytics';

import { ApiKeyProvider } from '@/constants/api-key-context';
import { I18nProvider } from '@/constants/i18n-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  useEffect(() => {
    // Log screen view whenever the pathname changes
    if (pathname) {
      analytics().logScreenView({
        screen_name: pathname,
        screen_class: pathname,
      });
    }
  }, [pathname]);

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

