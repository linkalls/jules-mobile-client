# Development Guide

This guide covers development setup and workflows for the Jules Mobile Client.

## Prerequisites

- **Node.js** 18 or later
- **Bun** (recommended) or npm
- **iOS**: Xcode 15+ with iOS Simulator
- **Android**: Android Studio with an emulator or physical device
- **Expo CLI** (installed automatically via npx)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/jules-mobile-client.git
cd jules-mobile-client

# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 2. Start Development Server

```bash
# Start Expo dev server
bun start

# Or with specific platform
bun ios     # iOS Simulator
bun android # Android Emulator
bun web     # Web browser
```

### 3. Configure API Key

1. Open the app on your device/simulator
2. Go to Settings tab
3. Enter your Jules API Key
4. The key is securely stored on device

## Project Structure

```
jules-mobile-client/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── _layout.tsx    # Tab configuration
│   │   ├── index.tsx      # Sessions screen
│   │   └── settings.tsx   # Settings screen
│   ├── session/
│   │   └── [id].tsx       # Dynamic session detail
│   ├── create-session.tsx # New task modal
│   ├── modal.tsx          # Generic modal
│   └── _layout.tsx        # Root layout with providers
├── components/
│   ├── jules/             # Domain-specific components
│   └── ui/                # Reusable UI components
├── constants/
│   ├── types.ts           # TypeScript type definitions
│   ├── i18n.ts            # Translation strings
│   ├── i18n-context.tsx   # Language context
│   ├── api-key-context.tsx# API key context
│   └── theme.ts           # Color definitions
├── hooks/
│   ├── use-jules-api.ts   # Main API hook
│   ├── use-secure-storage.ts
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── assets/
│   └── images/            # App icons and images
├── docs/                  # Documentation
└── scripts/               # Build scripts
```

## Development Workflow

### Adding a New Screen

1. Create file in `app/` directory:

```tsx
// app/new-screen.tsx
import { Stack } from 'expo-router';

export default function NewScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Screen' }} />
      {/* Content */}
    </>
  );
}
```

2. Navigate using expo-router:

```tsx
import { router } from 'expo-router';

router.push('/new-screen');
```

### Adding a New Component

1. Create component file:

```tsx
// components/jules/my-component.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 16,
    color: '#0f172a',
  },
  titleDark: {
    color: '#f8fafc',
  },
});
```

2. Export from index:

```tsx
// components/jules/index.ts
export { MyComponent } from './my-component';
```

### Adding Translations

1. Add keys to both languages in `constants/i18n.ts`:

```typescript
const translations = {
  ja: {
    // ...existing
    myNewKey: '日本語テキスト',
  },
  en: {
    // ...existing
    myNewKey: 'English text',
  },
};
```

2. Use in component:

```tsx
const { t } = useI18n();

<Text>{t('myNewKey')}</Text>
```

### Adding API Endpoints

1. Add types to `constants/types.ts`:

```typescript
export interface NewResponse {
  data: string[];
}
```

2. Add method to `hooks/use-jules-api.ts`:

```typescript
const fetchNewData = useCallback(async (): Promise<string[]> => {
  setIsLoading(true);
  try {
    const data = await julesFetch<NewResponse>('/new-endpoint');
    return data.data || [];
  } catch (err) {
    setError(err.message);
    return [];
  } finally {
    setIsLoading(false);
  }
}, [julesFetch]);
```

## Code Style

### TypeScript

- Use strict types, avoid `any`
- Define interfaces for all props
- Use type imports: `import type { X } from '...'`

### React

- Use functional components with hooks
- Memoize expensive computations
- Use `useCallback` for event handlers passed as props

### Styling

- Use `StyleSheet.create()` for all styles
- Follow naming: `styles.containerDark` for dark variants
- Use Tailwind-like color palette (slate, blue, etc.)

## Debugging

### React Native Debugger

```bash
# Open debugger
npx react-devtools
```

### Console Logging

```typescript
console.log('Debug:', JSON.stringify(data, null, 2));
```

### Network Debugging

Check API calls in the Expo dev tools Network tab or use:

```typescript
// In useJulesApi hook
console.log('API Request:', url, options);
console.log('API Response:', response);
```

## Testing

### Run Linter

```bash
bun lint
```

### Type Check

```bash
bunx tsc --noEmit
```

### Unit Tests (Future)

```bash
bun test
```

## Building for Production

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android APK
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

### Build Profiles

See `eas.json` for build configurations:

| Profile | Use Case |
|---------|----------|
| `development` | Dev client with debugging |
| `preview` | Internal testing APK |
| `production` | Release build |

## Common Issues

### "Metro bundler failed to start"

```bash
# Clear cache
bun start --clear

# Or reset project
bun run reset-project
```

### "Unable to resolve module"

```bash
# Clear node_modules and reinstall
rm -rf node_modules
bun install
```

### "Invariant Violation: Native module cannot be null"

Ensure you're using Expo Go or a development build that includes the required native modules.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)
