import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

mock.module("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

mock.module("react/jsx-runtime", () => ({
  jsx: (type: any, props: any, key: any) => ({ type, props, key }),
  jsxs: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

const mockImpactAsync = mock(() => Promise.resolve());
mock.module("expo-haptics", () => ({
  impactAsync: mockImpactAsync,
  ImpactFeedbackStyle: {
    Light: "Light"
  }
}));

const PlatformPressableMock = (props: any) => ({ type: "PlatformPressable", props });
mock.module("@react-navigation/elements", () => ({
  PlatformPressable: PlatformPressableMock
}));

const { HapticTab } = require("./haptic-tab");

describe("HapticTab", () => {
  const originalEnv = process.env.EXPO_OS;

  beforeEach(() => {
    mockImpactAsync.mockClear();
  });

  afterEach(() => {
    process.env.EXPO_OS = originalEnv;
  });

  it("calls Haptics.impactAsync and props.onPressIn on iOS", () => {
    process.env.EXPO_OS = 'ios';
    const onPressInMock = mock();

    const result = HapticTab({ onPressIn: onPressInMock, foo: 'bar' });

    expect(result.type).toBe(PlatformPressableMock);
    expect(result.props.foo).toBe('bar');

    // Trigger onPressIn
    result.props.onPressIn('event');

    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith("Light");
    expect(onPressInMock).toHaveBeenCalledTimes(1);
    expect(onPressInMock).toHaveBeenCalledWith('event');
  });

  it("does not call Haptics.impactAsync but calls props.onPressIn on Android", () => {
    process.env.EXPO_OS = 'android';
    const onPressInMock = mock();

    const result = HapticTab({ onPressIn: onPressInMock });

    expect(result.type).toBe(PlatformPressableMock);

    // Trigger onPressIn
    result.props.onPressIn('event');

    expect(mockImpactAsync).not.toHaveBeenCalled();
    expect(onPressInMock).toHaveBeenCalledTimes(1);
    expect(onPressInMock).toHaveBeenCalledWith('event');
  });

  it("handles missing props.onPressIn gracefully", () => {
    process.env.EXPO_OS = 'ios';

    const result = HapticTab({});

    expect(result.type).toBe(PlatformPressableMock);

    // Trigger onPressIn
    // Should not throw
    result.props.onPressIn('event');

    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
  });
});
