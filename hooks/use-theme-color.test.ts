import { describe, expect, it, mock, afterEach } from "bun:test";

// We rely on the bun test setup file to mock react-native and jsx-runtime

import { Colors } from '@/constants/theme';

const mockUseColorScheme = mock(() => 'light');
mock.module('@/hooks/use-color-scheme', () => ({
  useColorScheme: mockUseColorScheme,
}));

import { useThemeColor } from './use-theme-color';

describe('useThemeColor', () => {
  afterEach(() => {
    mockUseColorScheme.mockClear();
  });

  it('returns color from props when provided for current theme', () => {
    mockUseColorScheme.mockImplementation(() => 'light');
    expect(useThemeColor({ light: '#123456', dark: '#654321' }, 'text')).toBe('#123456');

    mockUseColorScheme.mockImplementation(() => 'dark');
    expect(useThemeColor({ light: '#123456', dark: '#654321' }, 'text')).toBe('#654321');
  });

  it('returns color from Colors when props do not provide it', () => {
    mockUseColorScheme.mockImplementation(() => 'light');
    expect(useThemeColor({}, 'text')).toBe(Colors.light.text);

    mockUseColorScheme.mockImplementation(() => 'dark');
    expect(useThemeColor({}, 'text')).toBe(Colors.dark.text);
  });

  it('defaults to light theme if useColorScheme returns null', () => {
    mockUseColorScheme.mockImplementation(() => null);
    expect(useThemeColor({}, 'text')).toBe(Colors.light.text);
  });
});
