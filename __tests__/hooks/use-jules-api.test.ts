import { renderHook, act } from '@testing-library/react-native';
import { useJulesApi } from '../../hooks/use-jules-api';
import { expect, test, describe } from 'bun:test';

describe('useJulesApi', () => {
  test('throws an error if apiKey is not set in julesFetch', async () => {
    const { result } = renderHook(() => useJulesApi({ apiKey: '' }));

    // Act to ensure state updates are flushed properly.
    let caughtError;
    await act(async () => {
      try {
        await result.current.approvePlan('test-session');
      } catch (err) {
        caughtError = err;
      }
    });

    // We verify the caught error directly, and verify the hook state.
    expect(caughtError).toBeDefined();
    expect(caughtError?.message).toBe('API key not set! Enter it in Settings.');
    expect(result.current.error).toBe('API key not set! Enter it in Settings.');
  });
});
