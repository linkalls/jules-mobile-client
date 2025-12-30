# Architecture

This document describes the architecture of the Jules Mobile Client application.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Entry Point                          │
│                         app/_layout.tsx                         │
├─────────────────────────────────────────────────────────────────┤
│                          Providers                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  ApiKeyProvider │  │   I18nProvider  │  │  ThemeProvider  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Expo Router                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Stack Navigator                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ (tabs)      │  │create-session│  │ session/[id]   │  │   │
│  │  │ Tab Nav     │  │   Modal      │  │    Screen      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Architecture

### 1. Presentation Layer (Screens)

Located in `app/` directory, using Expo Router's file-based routing.

| Screen | Path | Description |
|--------|------|-------------|
| Sessions List | `/(tabs)/index.tsx` | Main session list with FAB |
| Settings | `/(tabs)/settings.tsx` | API key and preferences |
| Session Detail | `/session/[id].tsx` | Chat view with activities |
| Create Session | `/create-session.tsx` | New task creation modal |

### 2. Component Layer

#### Jules Components (`components/jules/`)

Specialized components for Jules functionality:

- **`ActivityItem`** - Renders different activity types (messages, plans, artifacts)
- **`ActivityItemSkeleton`** - Chat-style shimmer skeleton for loading states
- **`SessionCard`** - Session list item with i18n status badge
- **`SessionCardSkeleton`** - Card shimmer skeleton for loading states
- **`LoadingOverlay`** - Full-screen loading indicator (legacy)
- **`DataRenderer`** - Generic JSON/data renderer
- **`CodeBlock`** - Syntax highlighted code display

#### UI Components (`components/ui/`)

Generic, reusable UI components:

- **`IconSymbol`** - Cross-platform icon component (SF Symbols / Material Icons)
- **`Collapsible`** - Expandable content container

### 3. Business Logic Layer (Hooks)

#### `useJulesApi`

The main API hook that handles all Jules API communication:

```typescript
const {
  isLoading,
  error,
  sources,
  fetchSessions,
  fetchActivities,
  createSession,
  approvePlan,
} = useJulesApi({ apiKey, t });
```

Features:
- Automatic error handling
- Loading state management
- Pagination support for sources
- Silent refresh option

#### `useSecureStorage`

Handles secure data persistence:

```typescript
const {
  saveApiKey,
  getApiKey,
  saveTheme,
  getTheme,
  saveLanguage,
  getLanguage,
} = useSecureStorage();
```

### 4. Data Layer

#### Types (`constants/types.ts`)

Strict TypeScript definitions for all API responses:

```typescript
interface Session {
  name: string;
  title?: string;
  state: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createTime: string;
  updateTime: string;
}

interface Activity {
  name: string;
  originator: 'agent' | 'user';
  agentMessaged?: { agentMessage: string };
  userMessaged?: { userMessage: string };
  planGenerated?: { plan: Plan };
  // ...
}
```

#### Context Providers

**ApiKeyContext** - Global API key state with secure persistence

```typescript
<ApiKeyProvider>
  {children}
</ApiKeyProvider>
```

**I18nContext** - Language state and translation function

```typescript
const { language, setLanguage, t } = useI18n();
```

## Data Flow

```
┌────────────┐      ┌──────────────┐      ┌────────────────┐
│   Screen   │ ──▶  │  useJulesApi │ ──▶  │  Jules API     │
│            │      │    Hook      │      │ googleapis.com │
└────────────┘      └──────────────┘      └────────────────┘
      │                    │
      │                    ▼
      │             ┌──────────────┐
      │             │    State     │
      │             │  (useState)  │
      │             └──────────────┘
      │                    │
      ▼                    ▼
┌────────────┐      ┌──────────────┐
│ Components │ ◀──  │  Re-render   │
└────────────┘      └──────────────┘
```

## State Management

### Local State (useState)

Used for component-specific state:
- Form inputs
- UI toggles
- Temporary data

### Context (React Context)

Used for app-wide state:
- API Key
- Language preference
- Theme (via Appearance API)

### Persistent State (SecureStore)

Used for secure, persistent data:
- API Key
- User preferences

## Styling Strategy

### Approach

- **StyleSheet.create()** for static styles
- **Conditional styles** for dark mode: `[styles.base, isDark && styles.dark]`
- **Inline styles** only for dynamic values

### Color Palette

```typescript
// Light Theme
background: '#f8fafc'
card: '#ffffff'
text: '#0f172a'
accent: '#2563eb'

// Dark Theme
background: '#020617'
card: '#1e293b'
text: '#f8fafc'
accent: '#60a5fa'
```

## Performance Optimizations

1. **Memoized Components**
   ```typescript
   const MemoizedSessionCard = memo(SessionCard);
   ```

2. **FlatList Optimization**
   ```typescript
   <FlatList
     removeClippedSubviews={true}
     initialNumToRender={10}
     maxToRenderPerBatch={10}
     windowSize={5}
     getItemLayout={(_, index) => ({...})}
   />
   ```

3. **Lazy Loading**
   - Sources loaded on dropdown open
   - Pagination with infinite scroll

4. **Polling Strategy**
   - 5-second interval for activity updates
   - Silent refresh (no loading spinner)

## Error Handling

```typescript
try {
  const data = await julesFetch('/sessions');
} catch (err) {
  setError(err.message);
}
```

- Errors displayed in dismissible banners
- API errors parsed from response
- Network errors handled gracefully

## Testing Strategy

(To be implemented)

- Unit tests for hooks
- Component tests with React Native Testing Library
- E2E tests with Detox
