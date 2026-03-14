import { mock } from "bun:test";

mock.module("react-native", () => {
  return {
    Platform: { OS: "ios", select: (obj: any) => obj.default || obj.ios || obj.web },
    StyleSheet: { create: (s: any) => s },
    useColorScheme: () => "light",
  };
});
