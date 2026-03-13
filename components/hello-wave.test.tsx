import { describe, expect, it, mock } from "bun:test";

mock.module("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

mock.module("react/jsx-runtime", () => ({
  jsx: (type: any, props: any, key: any) => ({ type, props, key }),
  jsxs: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

const AnimatedTextMock = (props: any) => ({ type: "Animated.Text", props });

mock.module("react-native-reanimated", () => ({
  default: {
    Text: AnimatedTextMock
  }
}));

const { HelloWave } = require("./hello-wave");

describe("HelloWave", () => {
  it("renders an Animated.Text with correct styling and animation props", () => {
    const result = HelloWave();

    // Check if the component is using our mocked Animated.Text directly
    expect(result.type).toBe(AnimatedTextMock);
    expect(result.props.children).toBe("👋");

    const style = result.props.style;
    expect(style.fontSize).toBe(28);
    expect(style.lineHeight).toBe(32);
    expect(style.marginTop).toBe(-6);
    expect(style.animationIterationCount).toBe(4);
    expect(style.animationDuration).toBe('300ms');
    expect(style.animationName).toEqual({
      '50%': { transform: [{ rotate: '25deg' }] },
    });
  });
});
