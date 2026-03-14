import { beforeEach, describe, expect, it, mock } from "bun:test";

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

mock.module("react-native", () => ({
  View: ViewMock
}));

const mockUseThemeColor = mock(() => "mocked-color");
mock.module("@/hooks/use-theme-color", () => ({
  useThemeColor: mockUseThemeColor
}));

const { ThemedView } = require("./themed-view");

describe("ThemedView", () => {
  beforeEach(() => {
    mockUseThemeColor.mockClear();
  });

  it("renders with default background color when no color props are provided", () => {
    mockUseThemeColor.mockReturnValue("default-background-color");

    const result = ThemedView({});

    expect(result.type).toBe(ViewMock);

    // useThemeColor should be called with no overrides
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: undefined },
      "background"
    );

    // Should have backgroundColor applied to style
    expect(result.props.style).toEqual([{ backgroundColor: "default-background-color" }, undefined]);
  });

  it("passes lightColor and darkColor overrides to useThemeColor", () => {
    mockUseThemeColor.mockReturnValue("overridden-color");

    const result = ThemedView({ lightColor: "#fff", darkColor: "#000" });

    expect(mockUseThemeColor).toHaveBeenCalledWith(
      { light: "#fff", dark: "#000" },
      "background"
    );

    expect(result.props.style).toEqual([{ backgroundColor: "overridden-color" }, undefined]);
  });

  it("merges custom style with background color", () => {
    mockUseThemeColor.mockReturnValue("mocked-color");

    const customStyle = { padding: 10, margin: 5 };
    const result = ThemedView({ style: customStyle });

    expect(result.props.style).toEqual([{ backgroundColor: "mocked-color" }, customStyle]);
  });

  it("passes other ViewProps to the underlying View", () => {
    mockUseThemeColor.mockReturnValue("mocked-color");

    const result = ThemedView({ testID: "themed-view-test", accessible: true });

    expect(result.props.testID).toBe("themed-view-test");
    expect(result.props.accessible).toBe(true);
  });
});
