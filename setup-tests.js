import { mock } from "bun:test";

mock.module("expo-secure-store", () => ({
  getItemAsync: mock(),
  setItemAsync: mock(),
  deleteItemAsync: mock(),
}));

mock.module("react-native", () => {
  return {
    Platform: { OS: "ios" },
    NativeModules: {},
    StyleSheet: { create: (s) => s },
  };
});
