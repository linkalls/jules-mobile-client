import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { renderHook, act } from "@testing-library/react-native";
import { useJulesApi } from "./use-jules-api";

describe("useJulesApi error parsing", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should handle error response with malformed JSON body", async () => {
    // Mock fetch to return a 500 error and malformed JSON
    global.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: new Headers({
          'content-type': 'application/json',
          'content-length': '10',
        }),
        json: () => Promise.reject(new SyntaxError("Unexpected token '<', \"<html>...\" is not valid JSON")),
      }) as any
    );

    const { result } = renderHook(() =>
      useJulesApi({ apiKey: "test-key", t: (key, fallback) => key })
    );

    await act(async () => {
      await result.current.fetchSources();
    });

    // The fetchSources method should fail gracefully, returning an empty array
    // and setting the error to the fallback message since JSON parsing fails
    expect(result.current.sources).toEqual([]);
    expect(result.current.error).toBe("apiError: 500");
  });

  it("should handle error response with well-formed JSON body", async () => {
    global.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
          'content-length': '50',
        }),
        json: () => Promise.resolve({ error: { message: "Invalid request" } }),
      }) as any
    );

    const { result } = renderHook(() =>
      useJulesApi({ apiKey: "test-key", t: (key, fallback) => key })
    );

    await act(async () => {
      await result.current.fetchSources();
    });

    expect(result.current.sources).toEqual([]);
    expect(result.current.error).toBe("Invalid request");
  });
});
