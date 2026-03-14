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

const mockLink = (props: any) => ({ type: "Link", props });

mock.module("expo-router", () => ({
  Link: mockLink
}));

const mockOpenBrowserAsync = mock(async () => {});

mock.module("expo-web-browser", () => ({
  openBrowserAsync: mockOpenBrowserAsync,
  WebBrowserPresentationStyle: { AUTOMATIC: "AUTOMATIC" }
}));

const { ExternalLink } = require("./external-link");

describe("ExternalLink", () => {
  let originalExpoOS: string | undefined;

  beforeEach(() => {
    mockOpenBrowserAsync.mockClear();
    originalExpoOS = process.env.EXPO_OS;
  });

  afterEach(() => {
    process.env.EXPO_OS = originalExpoOS;
  });

  it("calls preventDefault and openBrowserAsync when EXPO_OS is not web", async () => {
    process.env.EXPO_OS = "ios";

    const result = ExternalLink({ href: "https://example.com" });

    expect(result.type).toBe(mockLink);
    expect(result.props.href).toBe("https://example.com");
    expect(result.props.target).toBe("_blank");

    const mockEvent = {
      preventDefault: mock(() => {})
    };

    await result.props.onPress(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith("https://example.com", {
      presentationStyle: "AUTOMATIC"
    });
  });

  it("does not call preventDefault and openBrowserAsync when EXPO_OS is web", async () => {
    process.env.EXPO_OS = "web";

    const result = ExternalLink({ href: "https://example.com" });

    const mockEvent = {
      preventDefault: mock(() => {})
    };

    await result.props.onPress(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
  });
});
