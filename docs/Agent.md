# Agent Instructions

This document provides instructions for AI agents working on the Jules Mobile Client codebase.

## Project Overview

Jules Mobile Client is a React Native/Expo application that provides a mobile interface for Google's Jules AI coding assistant. The app allows users to:

- View and manage coding sessions
- Create new tasks for Jules to work on
- Chat with Jules AI in real-time
- Approve AI-generated plans

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo SDK | 54 | React Native framework |
| React Native | 0.81 | Mobile UI |
| TypeScript | 5.3 | Type safety |
| Expo Router | 4.x | File-based routing |
| Bun | latest | Package manager & runtime |

## Key Directories

```
app/                    # Screens (Expo Router)
├── (tabs)/            # Tab navigation
│   ├── index.tsx      # Sessions list
│   ├── settings.tsx   # Settings
│   └── explore.tsx    # (unused)
├── session/[id].tsx   # Session detail/chat
├── create-session.tsx # New task creation
└── _layout.tsx        # Root layout with providers

components/
├── jules/             # Jules-specific components
│   ├── activity-item.tsx    # Chat messages + skeleton
│   ├── session-card.tsx     # Session cards + skeleton
│   ├── loading-overlay.tsx  # Loading indicator
│   ├── code-block.tsx       # Syntax highlighting
│   └── data-renderer.tsx    # Debug data display
└── ui/                # Generic UI components

constants/
├── types.ts           # TypeScript interfaces
├── i18n.ts            # Translations (ja/en)
├── i18n-context.tsx   # i18n React context
├── api-key-context.tsx # API key context
└── theme.ts           # Colors

hooks/
├── use-jules-api.ts   # Jules API communication
├── use-secure-storage.ts # Secure data persistence
├── use-color-scheme.ts   # Theme detection
└── use-theme-color.ts    # Theme colors
```

## Important Patterns

### 1. API Communication

All Jules API calls go through `hooks/use-jules-api.ts`:

```typescript
const { 
  isLoading, 
  error, 
  fetchSessions,
  fetchActivities,
  createSession,
  approvePlan 
} = useJulesApi({ apiKey, t });
```

### 2. Internationalization (i18n)

Use the `useI18n` hook for translations:

```typescript
const { t, language, setLanguage } = useI18n();
// Usage: t('keyName')
```

Add new keys to both `ja` and `en` objects in `constants/i18n.ts`.

### 3. Skeleton Loading

Use skeleton components instead of loading overlays for modern UX:

```typescript
// Sessions list
{isLoading ? (
  <>
    <SessionCardSkeleton />
    <SessionCardSkeleton />
  </>
) : (
  sessions.map(s => <SessionCard key={s.name} session={s} />)
)}

// Activity list
{isLoading ? (
  <>
    <ActivityItemSkeleton isAgent={true} />
    <ActivityItemSkeleton isAgent={false} />
  </>
) : (
  activities.map(a => <ActivityItem key={a.name} activity={a} />)
)}
```

### 4. Dark Mode

Always support dark mode:

```typescript
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

<View style={[styles.container, isDark && styles.containerDark]}>
```

### 5. Secure Storage

API keys and sensitive data use expo-secure-store:

```typescript
const { saveApiKey, getApiKey } = useSecureStorage();
```

## Jules API Reference

Base URL: `https://jules.googleapis.com/v1alpha`

### Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sources` | GET | List connected repositories |
| `/sessions` | GET | List all sessions |
| `/sessions` | POST | Create new session |
| `/sessions/{id}/activities` | GET | Get session activities |
| `/sessions/{id}:approvePlan` | POST | Approve a plan |

### Create Session Request Body

```json
{
  "prompt": "User's task description",
  "sourceContext": {
    "source": "sources/github/owner/repo",
    "githubRepoContext": {
      "startingBranch": "main"
    }
  },
  "title": "Short title..."
}
```

## Common Tasks

### Adding a New Translation

1. Add key to `constants/i18n.ts` in both `ja` and `en` objects
2. Use `t('newKey')` in components

### Adding a New Screen

1. Create file in `app/` directory
2. Export default function component
3. Add to navigation if needed

### Creating a New Component

1. Create in `components/jules/` for Jules-specific, `components/ui/` for generic
2. Export from `components/jules/index.ts` if Jules component
3. Support dark mode with `useColorScheme`

### Adding Skeleton Loading

1. Create skeleton component with shimmer animation
2. Use `Animated.Value` for opacity animation
3. Match layout of actual component

## Code Style

- Use functional components with hooks
- TypeScript strict mode enabled
- Use `StyleSheet.create` for styles
- Prefer Bun over npm/yarn
- No `any` types - use proper interfaces from `constants/types.ts`

## Bun Commands

This project uses Bun as the primary runtime and package manager.

### Essential Commands

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on specific platforms
bun ios       # iOS Simulator
bun android   # Android Emulator
bun web       # Web browser

# Install Expo-compatible packages
bunx expo install <package-name>

# Example: Add reanimated
bunx expo install react-native-reanimated

# Linting
bun lint
```

# type-checking
```bash
bun oxc
```

### Why Bun?

1. **Faster installs** - Much faster than npm/yarn
2. **Built-in TypeScript** - No compilation needed
3. **Auto .env loading** - No dotenv required
4. **npm compatible** - Works with node_modules

### Important Notes

- Always use `bunx expo install` for React Native packages (ensures version compatibility)
- Use `bun add` for non-Expo packages
- Bun automatically loads `.env` files

## Testing

```bash
# Run tests
bun test

# Type check
bun run typecheck
```

## Building

```bash
# Development
bun start

# Android build
eas build --platform android

# iOS build
eas build --platform ios
```

## Debugging Tips

1. Check `console.log` output in Metro bundler
2. API errors are logged with full response body
3. Use `DataRenderer` component to inspect data structures
4. Enable React Native Debugger for component inspection
