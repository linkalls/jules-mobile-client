import { mock } from "bun:test";

mock.module("react-native", () => {
  return {
    StyleSheet: { create: () => ({}) },
    Platform: { OS: 'ios' },
  };
});
