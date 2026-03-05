import { describe, expect, it, mock } from 'bun:test';

mock.module('react-native', () => {
  return {
    View: () => null,
    Text: () => null,
    StyleSheet: {
      create: (obj: any) => obj,
    },
  };
});

mock.module('@/hooks/use-color-scheme', () => {
  return {
    useColorScheme: () => 'light',
  };
});

const { formatKey } = require('../data-renderer');

describe('formatKey', () => {
  it('converts camelCase to Title Case', () => {
    expect(formatKey('createTime')).toBe('Create Time');
    expect(formatKey('userEmailAddress')).toBe('User Email Address');
  });

  it('converts snake_case to Title Case (with spaces)', () => {
    expect(formatKey('create_time')).toBe('Create time');
    expect(formatKey('user_email_address')).toBe('User email address');
  });

  it('capitalizes the first letter', () => {
    expect(formatKey('id')).toBe('Id');
    expect(formatKey('name')).toBe('Name');
  });

  it('handles strings with multiple spaces correctly', () => {
    expect(formatKey('my   space')).toBe('My space');
  });

  it('handles empty strings gracefully', () => {
    expect(formatKey('')).toBe('');
  });

  it('handles single characters correctly', () => {
    expect(formatKey('a')).toBe('A');
    expect(formatKey('Z')).toBe('Z');
  });

  it('handles already correctly formatted strings', () => {
    expect(formatKey('Create Time')).toBe('Create Time');
    expect(formatKey('Name')).toBe('Name');
  });

  it('handles leading and trailing spaces/underscores', () => {
    expect(formatKey(' _test_key_ ')).toBe('test key');
  });
});
