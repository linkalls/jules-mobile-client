/**
 * Modern color system with gradients and improved contrast
 */

import { Platform } from 'react-native';

const tintColorLight = '#6366f1'; // Modern indigo
const tintColorDark = '#a5b4fc'; // Lighter indigo for dark mode

export const Colors = {
  light: {
    text: '#0f172a',
    textPlaceholder: '#94a3b8',
    background: '#fafbfe',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    
    // Extended colors for modern UI
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    secondary: '#ec4899',
    accent: '#14b8a6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Gradients
    gradientStart: '#6366f1',
    gradientEnd: '#ec4899',
    gradientAccent: '#14b8a6',
    
    // Surface colors
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Header colors
    headerBackground: '#ffffff',
    headerText: '#0f172a',

    // Shadows
    shadowLight: 'rgba(99, 102, 241, 0.1)',
    shadowMedium: 'rgba(99, 102, 241, 0.2)',
    shadowDark: 'rgba(99, 102, 241, 0.3)',

    // Code Highlighting
    codeKeyword: '#af00db',
    codeString: '#a31515',
    codeNumber: '#098658',
    codeComment: '#008000',
    codeBoolean: '#0000ff',
    codeDefault: '#1e1e1e',
    codeBackground: '#f5f5f5',
    codeTagBackground: '#e0e0e0',
    codeTagText: '#666',
  },
  dark: {
    text: '#f1f5f9',
    textPlaceholder: '#475569',
    background: '#0a0d1a',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    
    // Extended colors for modern UI
    primary: '#818cf8',
    primaryLight: '#a5b4fc',
    primaryDark: '#6366f1',
    secondary: '#f472b6',
    accent: '#2dd4bf',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    
    // Gradients
    gradientStart: '#818cf8',
    gradientEnd: '#f472b6',
    gradientAccent: '#2dd4bf',
    
    // Surface colors
    surface: '#1e293b',
    surfaceSecondary: '#0f172a',
    border: '#334155',
    borderLight: '#1e293b',
    
    // Header colors
    headerBackground: '#0f172a',
    headerText: '#f8fafc',

    // Shadows
    shadowLight: 'rgba(129, 140, 248, 0.15)',
    shadowMedium: 'rgba(129, 140, 248, 0.25)',
    shadowDark: 'rgba(129, 140, 248, 0.35)',

    // Code Highlighting
    codeKeyword: '#c586c0',
    codeString: '#ce9178',
    codeNumber: '#b5cea8',
    codeComment: '#6a9955',
    codeBoolean: '#569cd6',
    codeDefault: '#d4d4d4',
    codeBackground: '#1e1e1e',
    codeTagBackground: '#333',
    codeTagText: '#666',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
