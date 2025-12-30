# Components Reference

This document describes all components in the Jules Mobile Client.

## Jules Components

Located in `components/jules/`

### ActivityItem

Renders different types of activities from a Jules session.

**Props:**

```typescript
interface ActivityItemProps {
  activity: Activity;
  onApprovePlan?: (planId: string) => void;
}
```

**Supported Activity Types:**

| Type | Visual |
|------|--------|
| `agentMessaged` | Blue bubble with Jules avatar, Markdown rendered |
| `userMessaged` | Right-aligned bubble |
| `planGenerated` | Card with numbered step list |
| `planApprovalRequested` | Warning card with Approve button |
| `planApproved` | Success indicator |
| `progressUpdated` | Info banner |
| `artifacts` | Expandable code/bash output |

**Usage:**

```tsx
<ActivityItem 
  activity={activity} 
  onApprovePlan={handleApprove} 
/>
```

---

### SessionCard

Card component for session list items.

**Props:**

```typescript
interface SessionCardProps {
  session: Session;
  onPress: () => void;
}
```

**Features:**

- Status badge with color coding
- Title truncation
- Session ID display (monospace)
- Dark mode support

**Usage:**

```tsx
<SessionCard 
  session={session} 
  onPress={() => openSession(session)} 
/>
```

---

### LoadingOverlay

Full-screen loading indicator overlay.

**Props:**

```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}
```

**Usage:**

```tsx
<LoadingOverlay 
  visible={isLoading} 
  message="Processing..." 
/>
```

---

### CodeBlock

Syntax-highlighted code display component.

**Props:**

```typescript
interface CodeBlockProps {
  code: string;
  language?: string;
}
```

**Features:**

- Syntax highlighting via react-native-syntax-highlighter
- Dark/light theme support
- Horizontal scrolling for long lines

---

### DataRenderer

Generic JSON/data renderer for debugging.

**Props:**

```typescript
interface DataRendererProps {
  data: any;
  title?: string;
}
```

---

## UI Components

Located in `components/ui/`

### IconSymbol

Cross-platform icon component that uses SF Symbols on iOS and Material Icons on Android/Web.

**Props:**

```typescript
interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}
```

**Available Icons:**

| SF Symbol Name | Material Icon | Usage |
|----------------|---------------|-------|
| `house.fill` | `home` | Home tab |
| `paperplane.fill` | `send` | Send button |
| `chevron.right` | `chevron-right` | Navigation |
| `chevron.down` | `keyboard-arrow-down` | Dropdown |
| `arrow.clockwise` | `refresh` | Refresh |
| `plus` | `add` | Add/Create |
| `xmark` | `close` | Close |
| `checkmark.circle.fill` | `check-circle` | Success |
| `xmark.circle.fill` | `cancel` | Error |
| `message.fill` | `chat` | Chat/Message |
| `gearshape.fill` | `settings` | Settings |
| `key` | `vpn-key` | API Key |
| `terminal` | `terminal` | Terminal/Code |
| `doc.text` | `description` | Document |
| `lightbulb` | `lightbulb` | Hint/Tip |
| `link` | `link` | Link/URL |
| `sun.max.fill` | `light-mode` | Light theme |
| `moon.fill` | `dark-mode` | Dark theme |

**Usage:**

```tsx
<IconSymbol 
  name="paperplane.fill" 
  size={24} 
  color="#2563eb" 
/>
```

---

### Collapsible

Expandable/collapsible content container with animation.

**Props:**

```typescript
interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
```

**Usage:**

```tsx
<Collapsible title="Show Details">
  <Text>Hidden content here</Text>
</Collapsible>
```

---

## Styling Patterns

### Dark Mode

All components support dark mode using conditional styles:

```tsx
const isDark = colorScheme === 'dark';

<View style={[styles.container, isDark && styles.containerDark]}>
```

### Color Constants

```typescript
// Light
const colors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#2563eb',
  success: '#059669',
  error: '#dc2626',
  warning: '#f59e0b',
};

// Dark
const darkColors = {
  background: '#020617',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  accent: '#60a5fa',
  success: '#34d399',
  error: '#f87171',
  warning: '#fbbf24',
};
```

---

## Performance Tips

1. **Use memo() for list items:**
   ```tsx
   const MemoizedCard = memo(SessionCard);
   ```

2. **Avoid inline styles in lists:**
   ```tsx
   // Bad
   <View style={{ margin: 10 }} />
   
   // Good
   <View style={styles.container} />
   ```

3. **Use keyExtractor in FlatList:**
   ```tsx
   keyExtractor={(item) => item.name}
   ```
