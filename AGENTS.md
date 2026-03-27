# AI Agent Guidelines

This document provides comprehensive instructions, architectural context, and coding standards for all AI agents (Jules, Cursor, Cline, GitHub Copilot, etc.) working on the Jules Mobile Client codebase.

**IMPORTANT:** All AI agents must read and strictly adhere to the guidelines in this file before modifying any code.

---

## 🏗️ 1. Project Overview & Architecture

Jules Mobile Client is a React Native/Expo application that acts as a mobile interface for Google's Jules AI coding assistant.

### Tech Stack
- **Framework:** Expo SDK 54, React Native 0.81
- **Language:** TypeScript 5.3 (Strict Mode)
- **Routing:** Expo Router 4.x (File-based routing)
- **Package Manager & Runtime:** Bun
- **Styling:** React Native `StyleSheet` (No Tailwind/NativeWind)

### Directory Structure
```
├── app/                    # Expo Router screens & layouts
│   ├── (tabs)/             # Main tab navigation
│   ├── session/            # Session detail & chat interfaces
│   └── _layout.tsx         # Root layout with global providers
├── components/
│   ├── jules/              # Domain-specific components (AI, chat, sessions)
│   └── ui/                 # Reusable generic UI components (buttons, text)
├── constants/
│   ├── theme.ts            # Color tokens, typography, spacing
│   ├── i18n.ts             # Localization dictionaries (en/ja)
│   └── types.ts            # Shared TypeScript interfaces
├── hooks/                  # Custom React hooks (API, storage, theme)
├── utils/                  # Helper functions
└── docs/                   # Comprehensive project documentation
```

---

## 🤖 2. General Agent Workflow

When assigned a task, follow this exact workflow:

1. **Explore First:** Never write code blindly. Use `grep`, `find`, or read relevant files (`app/`, `components/`, `hooks/`) to understand the current implementation.
2. **Read the Docs:** Check the `docs/` directory for specific feature or API documentation before implementing new logic.
3. **Plan:** Formulate a step-by-step plan. Identify all files that will be affected.
4. **Implement Incrementally:** Make small, focused changes. Verify syntax and logic after each file change.
5. **Test Thoroughly:** Use `bun test` to verify changes. Update or write new tests if applicable.
6. **Self-Review:** Ensure your changes adhere to the "Coding Standards" below.

---

## 💻 3. Coding Standards & Conventions

### 3.1. TypeScript & React Patterns
- **Strict Typing:** No `any`. Use interfaces and types from `constants/types.ts`.
- **Functional Components:** Use React Functional Components with hooks.
- **Props:** Component props must extend React Native primitives when wrapping them (e.g., `interface ThemedTextProps extends TextProps`).
- **Memoization:** Use `useMemo` and `useCallback` judiciously, especially for list items and heavy computations. Combine chained `.filter()` or `.map()` operations into single passes where possible.

### 3.2. Styling & Theming
- **Strict Theme Adherence:** Hardcoded colors (e.g., `#FFFFFF`, `rgba(0,0,0,0.5)`) are strictly forbidden. You **must** use the `colors` object from the theme system.
- **Dark Mode Support:** Every new UI element must support both light and dark modes. Use the `useColorScheme` hook.
  ```tsx
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  <View style={[styles.container, isDark && styles.containerDark]}>
  ```
- **Shared Styles:** Extract common styles. Use `StyleSheet.create()`.

### 3.3. Internationalization (i18n)
- **No Hardcoded Strings:** User-facing text must be localized.
- **Usage:** Use the `t()` function from `useI18n()`.
- **Updating Dictionaries:** Whenever adding a new string, you must add it to *both* the `en` and `ja` objects in `constants/i18n.ts`.

### 3.4. UI/UX Guidelines
- **Skeleton Loading:** Do not use full-screen spinners. Use Skeleton components (e.g., `SessionCardSkeleton`, `ActivityItemSkeleton`) with `Animated.Value` for shimmer effects.
- **Haptic Feedback:** Use `expo-haptics` for meaningful user interactions (e.g., success, error, selection).
- **Icons:** Use the `IconSymbol` component from `components/ui/icon-symbol.tsx` which maps SF Symbols (iOS) to Material Icons (Android/Web).

### 3.5. State & Data Management
- **API Calls:** All communication with the Jules API must go through the centralized hooks in `hooks/use-jules-api.ts`. Do not use raw `fetch` in components.
- **Secure Storage:** Sensitive data (like API keys) must be stored using `expo-secure-store` via the `use-secure-storage.ts` hook. Do not use `AsyncStorage`.

---

## 🧪 4. Testing Rules (Bun Test)

This project uses `bun:test` and `@testing-library/react-native`.

1. **Mocking React Native:** When testing modules that import `react-native`, you must mock it **before** importing the target module:
   ```typescript
   import { mock } from "bun:test";
   mock.module('react-native', () => ({
     default: { View: 'View', Text: 'Text' },
     View: 'View',
     Text: 'Text',
     StyleSheet: { create: (s: any) => s }
   }));
   ```
2. **Global Mocks:** Avoid globally mocking `react` (e.g., `mock.module('react', ...)`), as it bleeds across concurrent test files and causes `SyntaxError: Missing 'default' export`.
3. **Idiomatic Testing:** Write standard RTL tests (`render`, `fireEvent`, `screen`). Do not write hacky functional workarounds.
4. **Running Tests:**
   - Run all: `bun test`
   - Run specific: `bun test ./path/to/file.test.tsx` (Use `./` prefix)

---

## 🛠️ 5. Standard Commands

Agents should execute these commands via the terminal sandbox when verifying work:

- **Install deps:** `bun install` (Never use `bun install <package>` for existing dependencies to avoid unintended version bumps. Just `bun install` to respect the lockfile.)
- **Run Tests:** `bun test`
- **Lint:** `bun lint`
- **Typecheck:** `bun oxc` or `bun run typecheck`

---

## ⚠️ 6. Common Pitfalls to Avoid

- **Circular Dependencies:** Do not export shared utility components/functions from Expo Router entry files (`app/**/*.tsx`). Move them to `components/` or `utils/`.
- **API URL Formatting:** When calling Jules API endpoints, construct the full resource name exactly (e.g., `sessions/{session_id}/activities/{activity_id}`).
- **Static Web Builds:** Visual verification of UI changes via Playwright fails on `expo export` if Metro isn't configured. Start the dev server directly (`bun web > output.log 2>&1 &`) and wait for `localhost:8081`.
- **Over-Mucking the Environment:** If tests fail, diagnose the code first. Do not try to randomly install/uninstall packages or alter `package.json` unless explicitly required.

---
*End of Agent Instructions. Proceed with your task.*
