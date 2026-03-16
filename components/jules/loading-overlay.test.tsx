import { describe, expect, it, mock, beforeEach } from "bun:test";
import React from 'react';

mock.module("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

mock.module("react/jsx-runtime", () => ({
  jsx: (type: any, props: any, key: any) => ({ type, props, key }),
  jsxs: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

const ViewMock = (props: any) => ({ type: "View", props });
const TextMock = (props: any) => ({ type: "Text", props });
const ActivityIndicatorMock = (props: any) => ({ type: "ActivityIndicator", props });

mock.module("react-native", () => ({
  View: ViewMock,
  Text: TextMock,
  ActivityIndicator: ActivityIndicatorMock,
  StyleSheet: {
    create: (styles: any) => styles,
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  Platform: { OS: 'ios' },
}));

const mockUseColorScheme = mock(() => "light");
mock.module("@/hooks/use-color-scheme", () => ({
  useColorScheme: mockUseColorScheme,
}));

const { LoadingOverlay } = require("./loading-overlay");

describe("LoadingOverlay", () => {
  beforeEach(() => {
    mockUseColorScheme.mockClear();
    mockUseColorScheme.mockReturnValue("light");
  });

  it("returns null when visible is false", () => {
    const result = LoadingOverlay({ visible: false });
    expect(result).toBeNull();
  });

  it("renders overlay and activity indicator when visible is true", () => {
    const result = LoadingOverlay({ visible: true });
    expect(result.type).toBe(ViewMock);

    // Find ActivityIndicator in children
    const content = result.props.children;
    expect(content.type).toBe(ViewMock);

    const indicator = content.props.children[0];
    expect(indicator.type).toBe(ActivityIndicatorMock);
    expect(indicator.props.size).toBe("large");
  });

  it("renders message when provided", () => {
    const message = "Loading data...";
    const result = LoadingOverlay({ visible: true, message });

    const content = result.props.children;
    const messageText = content.props.children[1];

    expect(messageText.type).toBe(TextMock);
    expect(messageText.props.children).toBe(message);
  });

  it("does not render message Text when message is not provided", () => {
    const result = LoadingOverlay({ visible: true });

    const content = result.props.children;
    const messageText = content.props.children[1];

    expect(messageText).toBeFalsy();
  });

  it("applies light theme styles", () => {
    mockUseColorScheme.mockReturnValue("light");
    const result = LoadingOverlay({ visible: true, message: "test" });

    const content = result.props.children;
    const indicator = content.props.children[0];
    const messageText = content.props.children[1];

    // Light theme colors
    expect(indicator.props.color).toBe('#2563eb');

    // Check styles
    expect(content.props.style[0]).toMatchObject({ backgroundColor: '#ffffff' });
    expect(messageText.props.style[0]).toMatchObject({ fontSize: 14, color: '#475569' });
  });

  it("applies dark theme styles", () => {
    mockUseColorScheme.mockReturnValue("dark");
    const result = LoadingOverlay({ visible: true, message: "test" });

    const content = result.props.children;
    const indicator = content.props.children[0];
    const messageText = content.props.children[1];

    // Dark theme colors
    expect(indicator.props.color).toBe('#60a5fa');

    // Check dark styles are applied
    expect(content.props.style).toContainEqual({ backgroundColor: '#1e293b' });
    expect(messageText.props.style).toContainEqual({ color: '#cbd5e1' });
  });
});
