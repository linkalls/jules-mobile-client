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

const TextMock = (props: any) => ({ type: "Text", props });

mock.module("react-native", () => ({
  Text: TextMock,
  StyleSheet: { create: (styles: any) => styles }
}));

mock.module("@/hooks/use-theme-color", () => ({
  useThemeColor: (props: { light?: string; dark?: string }, colorName: string) => {
    return props.light || props.dark || 'mocked-theme-color';
  }
}));

const { ThemedText } = require("./themed-text");

describe("ThemedText", () => {
  it("renders with default type", () => {
    const result = ThemedText({ children: "Hello" });
    expect(result.type).toBe(TextMock);
    expect(result.props.children).toBe("Hello");

    // Check if the color from useThemeColor is applied, along with default style
    const style = result.props.style;
    expect(style).toContainEqual({ color: 'mocked-theme-color' });
    expect(style).toContainEqual({ fontSize: 16, lineHeight: 24 });
  });

  it("applies the title type style", () => {
    const result = ThemedText({ children: "Title", type: "title" });
    const style = result.props.style;
    expect(style).toContainEqual({ fontSize: 32, fontWeight: 'bold', lineHeight: 32 });
  });

  it("applies the defaultSemiBold type style", () => {
    const result = ThemedText({ children: "SemiBold", type: "defaultSemiBold" });
    const style = result.props.style;
    expect(style).toContainEqual({ fontSize: 16, lineHeight: 24, fontWeight: '600' });
  });

  it("applies the subtitle type style", () => {
    const result = ThemedText({ children: "Subtitle", type: "subtitle" });
    const style = result.props.style;
    expect(style).toContainEqual({ fontSize: 20, fontWeight: 'bold' });
  });

  it("applies the link type style", () => {
    const result = ThemedText({ children: "Link", type: "link" });
    const style = result.props.style;
    expect(style).toContainEqual({ lineHeight: 30, fontSize: 16, color: '#0a7ea4' });
  });

  it("merges custom style", () => {
    const result = ThemedText({ children: "Custom", style: { margin: 10 } });
    const style = result.props.style;
    expect(style).toContainEqual({ margin: 10 });
  });

  it("passes rest props to the Text component", () => {
    const result = ThemedText({ children: "Rest", numberOfLines: 2, selectable: true });
    expect(result.props.numberOfLines).toBe(2);
    expect(result.props.selectable).toBe(true);
  });

  it("passes lightColor and darkColor to useThemeColor", () => {
    const result = ThemedText({ children: "Colors", lightColor: "#fff", darkColor: "#000" });
    const style = result.props.style;
    // Our mock of useThemeColor returns props.light first
    expect(style).toContainEqual({ color: "#fff" });
  });
});
