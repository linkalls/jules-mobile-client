import { mock } from "bun:test";

mock.module("react-native", () => ({
  Platform: { OS: "web" },
  StyleSheet: { create: (s) => s },
  TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
  NativeEventEmitter: class {},
  useColorScheme: () => "dark",
}));

globalThis.__DEV__ = true;
globalThis.expo = {
  EventEmitter: class {},
  modules: {
    ExpoSecureStore: {
      getItemAsync: () => Promise.resolve(null),
      setItemAsync: () => Promise.resolve(),
      deleteItemAsync: () => Promise.resolve(),
    }
  }
};
