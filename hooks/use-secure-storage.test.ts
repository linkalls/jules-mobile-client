import { describe, expect, it, mock } from "bun:test";

mock.module("@testing-library/react-native", () => ({
  renderHook: (hook: any) => {
    let current;
    const result = {
      get current() {
        return current;
      }
    };
    current = hook();
    return { result };
  },
  act: async (cb: any) => {
    await cb();
  }
}));

mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  StyleSheet: { create: (s: any) => s },
  TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
  NativeEventEmitter: class {},
  useColorScheme: () => "light",
}));

mock.module("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

mock.module("react/jsx-runtime", () => ({
  jsx: (type: any, props: any, key: any) => ({ type, props, key }),
  jsxs: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

// Mock expo-secure-store
mock.module("expo-secure-store", () => ({
  getItemAsync: mock(() => Promise.resolve(null)),
  setItemAsync: mock(() => Promise.resolve()),
  deleteItemAsync: mock(() => Promise.resolve()),
}));

import { renderHook, act } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { useSecureStorage } from "./use-secure-storage";

describe("useSecureStorage", () => {
  describe("getApiKey", () => {
    it("should return null when SecureStore.getItemAsync fails", async () => {
      const { getItemAsync } = await import("expo-secure-store");
      (getItemAsync as any).mockImplementation(() => Promise.reject(new Error("Storage error")));

      const { result } = renderHook(() => useSecureStorage());
      let apiKey;
      await act(async () => {
        apiKey = await result.current.getApiKey();
      });

      expect(apiKey).toBeNull();
    });

    it("should return the key when SecureStore.getItemAsync succeeds", async () => {
      const { getItemAsync } = await import("expo-secure-store");
      (getItemAsync as any).mockImplementation(() => Promise.resolve("test-api-key"));

      const { result } = renderHook(() => useSecureStorage());
      let apiKey: string | null = "";
      await act(async () => {
        apiKey = await result.current.getApiKey();
      });

      expect(apiKey).toBe("test-api-key");
    });
  });

  describe("saveApiKey", () => {
    it("should call SecureStore.setItemAsync with correct parameters", async () => {
      const { setItemAsync } = await import("expo-secure-store");
      const mockSetItem = setItemAsync as any;
      mockSetItem.mockClear();

      const { result } = renderHook(() => useSecureStorage());
      await act(async () => {
        await result.current.saveApiKey("new-key");
      });

      expect(mockSetItem).toHaveBeenCalledWith("jules_api_key", "new-key");
    });
  });

  describe("deleteApiKey", () => {
    it("should handle error silently when SecureStore.deleteItemAsync fails", async () => {
      const { deleteItemAsync } = await import("expo-secure-store");
      (deleteItemAsync as any).mockImplementation(() => Promise.reject(new Error("Delete error")));

      const { result } = renderHook(() => useSecureStorage());

      // Should not throw
      await act(async () => {
        await expect(result.current.deleteApiKey()).resolves.toBeUndefined();
      });
    });
  });

  describe("theme storage", () => {
    it("getTheme should return null when SecureStore.getItemAsync fails", async () => {
      const { getItemAsync } = await import("expo-secure-store");
      (getItemAsync as any).mockImplementation(() => Promise.reject(new Error("Storage error")));

      const { result } = renderHook(() => useSecureStorage());
      let theme;
      await act(async () => {
        theme = await result.current.getTheme();
      });

      expect(theme).toBeNull();
    });

    it("saveTheme should call SecureStore.setItemAsync", async () => {
      const { setItemAsync } = await import("expo-secure-store");
      const mockSetItem = setItemAsync as any;
      mockSetItem.mockClear();

      const { result } = renderHook(() => useSecureStorage());
      await act(async () => {
        await result.current.saveTheme("dark");
      });

      expect(mockSetItem).toHaveBeenCalledWith("jules_theme", "dark");
    });
  });

  describe("language storage", () => {
    it("getLanguage should return null when SecureStore.getItemAsync fails", async () => {
      const { getItemAsync } = await import("expo-secure-store");
      (getItemAsync as any).mockImplementation(() => Promise.reject(new Error("Storage error")));

      const { result } = renderHook(() => useSecureStorage());
      let lang;
      await act(async () => {
        lang = await result.current.getLanguage();
      });

      expect(lang).toBeNull();
    });

    it("saveLanguage should call SecureStore.setItemAsync", async () => {
      const { setItemAsync } = await import("expo-secure-store");
      const mockSetItem = setItemAsync as any;
      mockSetItem.mockClear();

      const { result } = renderHook(() => useSecureStorage());
      await act(async () => {
        await result.current.saveLanguage("en");
      });

      expect(mockSetItem).toHaveBeenCalledWith("jules_language", "en");
    });
  });

  describe("recent repos storage", () => {
    it("getRecentRepos should return empty array when SecureStore.getItemAsync fails", async () => {
      const { getItemAsync } = await import("expo-secure-store");
      (getItemAsync as any).mockImplementation(() => Promise.reject(new Error("Storage error")));

      const { result } = renderHook(() => useSecureStorage());
      let repos: any[] = [];
      await act(async () => {
        repos = await result.current.getRecentRepos();
      });

      expect(repos).toEqual([]);
    });

    it("saveRecentRepo should update recent repos list correctly", async () => {
      const { getItemAsync, setItemAsync } = await import("expo-secure-store");

      // Initial state: one repo already exists
      const existingRepos = JSON.stringify([{ name: "old-repo" }]);
      (getItemAsync as any).mockImplementation(() => Promise.resolve(existingRepos));

      const mockSetItem = setItemAsync as any;
      mockSetItem.mockClear();

      const { result } = renderHook(() => useSecureStorage());
      await act(async () => {
        await result.current.saveRecentRepo({ name: "new-repo" } as any);
      });

      // Verify it adds new repo to the front
      const expectedValue = JSON.stringify([{ name: "new-repo" }, { name: "old-repo" }]);
      expect(mockSetItem).toHaveBeenCalledWith("jules_recent_repos", expectedValue);
    });

    it("saveRecentRepo should handle error silently", async () => {
        const { getItemAsync } = await import("expo-secure-store");
        (getItemAsync as any).mockImplementation(() => Promise.reject(new Error("Read error")));

        const { result } = renderHook(() => useSecureStorage());

        // Should not throw
        await act(async () => {
          await expect(result.current.saveRecentRepo({ name: "any" } as any)).resolves.toBeUndefined();
        });
      });
  });
});
