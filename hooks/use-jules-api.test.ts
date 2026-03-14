import { test, expect, describe, mock, beforeEach, afterEach, spyOn, type Mock } from 'bun:test';
import { renderHook, act, cleanup } from '@testing-library/react-native';
import { useJulesApi } from './use-jules-api';

describe('useJulesApi', () => {
  const mockApiKey = 'test-api-key';

  // Mock translation function correctly
  const mockTranslate = (key: string, fallback?: string) => {
    return fallback || key; // fallback is always provided by the hook for these cases
  };

  let originalFetch: typeof globalThis.fetch;
  let fetchMock: Mock<typeof globalThis.fetch>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = mock();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.restore();
    cleanup();
  });

  test('fetchSources success', async () => {
    const mockSourcesData = {
      sources: [{ name: 'source1' }, { name: 'source2' }],
      nextPageToken: 'token123'
    };

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockSourcesData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

    const { result } = renderHook(() => useJulesApi({ apiKey: mockApiKey, t: mockTranslate as any }));

    await act(async () => {
      await result.current.fetchSources();
    });

    expect(result.current.sources).toEqual(mockSourcesData.sources as any);
    expect(result.current.hasMoreSources).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://jules.googleapis.com/v1alpha/sources?pageSize=20',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mockApiKey,
        })
      })
    );
  });

  test('julesFetch handles 204 No Content', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, {
      status: 204,
    }));

    const { result } = renderHook(() => useJulesApi({ apiKey: mockApiKey, t: mockTranslate as any }));

    let res: any;
    await act(async () => {
      try {
        res = await result.current.approvePlan('test-session');
      } catch {
        // ignore
      }
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('julesFetch handles HTTP error with JSON body', async () => {
    const errorBody = {
      error: {
        message: 'Invalid request'
      }
    };

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(errorBody), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }));

    const { result } = renderHook(() => useJulesApi({ apiKey: mockApiKey, t: mockTranslate as any }));

    await act(async () => {
      await result.current.fetchSources();
    });

    expect(result.current.error).toBe('Invalid request');
  });

  test('julesFetch handles HTTP error with non-JSON body', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    }));

    // For missing `t`, the hook falls back. Let's provide undefined for t to test fallback paths
    const { result } = renderHook(() => useJulesApi({ apiKey: mockApiKey, t: undefined }));

    await act(async () => {
      await result.current.fetchSources();
    });

    expect(result.current.error).toBe('API Error: 500');
  });

  test('julesFetch throws when API key is missing', async () => {
    const { result } = renderHook(() => useJulesApi({ apiKey: '', t: undefined }));

    await act(async () => {
      await result.current.fetchSources();
    });

    expect(result.current.error).toBe('API key not set! Enter it in Settings.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
