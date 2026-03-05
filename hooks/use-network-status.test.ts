import { test, expect, describe, beforeEach, afterEach, mock, jest, it } from "bun:test";
import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus } from './use-network-status';

describe('useNetworkStatus', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should initialize with true', () => {
    global.fetch = mock().mockResolvedValue(new Response());
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('should return false if network check fails', async () => {
    global.fetch = mock().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should timeout when request takes too long', async () => {
    let abortSignal: AbortSignal | undefined;
    global.fetch = mock((input, init) => {
      abortSignal = init?.signal;
      return new Promise((resolve, reject) => {
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }
      });
    });

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
       if (abortSignal) {
         abortSignal.dispatchEvent(new Event("abort"));
       }
       await Promise.resolve();
    });

    expect(result.current.isOnline).toBe(false);
  });
});
