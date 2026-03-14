import { mock } from 'bun:test';

globalThis.__DEV__ = true;
globalThis.expo = { EventEmitter: class {} } as any;

mock.module('react-native', () => {
  return {
    Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
    StyleSheet: { create: (s: any) => s },
    TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
    NativeEventEmitter: class {},
    ScrollView: 'ScrollView',
    View: 'View',
    Text: 'Text',
    Animated: {
      Text: 'Animated.Text',
      View: 'Animated.View',
      createAnimatedComponent: (c: any) => c,
    },
    TouchableOpacity: 'TouchableOpacity',
    Pressable: 'Pressable',
    Dimensions: { get: () => ({ width: 400, height: 800 }) },
    Linking: { openURL: mock(), canOpenURL: mock() },
    Clipboard: { setString: mock() },
  };
});
