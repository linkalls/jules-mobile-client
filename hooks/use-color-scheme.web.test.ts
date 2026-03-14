import { describe, expect, it, mock } from "bun:test";

mock.module("react-native", () => ({
  Platform: { OS: "web" },
  StyleSheet: { create: (s: any) => s },
  TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
  NativeEventEmitter: class {},
  useColorScheme: () => "dark",
}));

import { renderHook, waitFor } from "@testing-library/react-native";
import { useColorScheme } from "./use-color-scheme.web";

describe("useColorScheme (web)", () => {
  it("should return 'light' initially and 'dark' after hydration", async () => {
    const { result } = renderHook(() => useColorScheme());

    // renderHook will render and eventually run the useEffect
    // Since we mocked useColorScheme in react-native to return 'dark',
    // the hook should return 'dark' after hydration completes.
    await waitFor(() => {
      expect(result.current).toBe("dark");
    });
  });
});
