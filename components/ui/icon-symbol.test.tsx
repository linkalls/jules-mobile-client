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

const MaterialIconsMock = (props: any) => ({ type: "MaterialIcons", props });

mock.module("@expo/vector-icons/MaterialIcons", () => ({
  default: MaterialIconsMock
}));

const { IconSymbol } = require("./icon-symbol");

describe("IconSymbol", () => {
  it("renders a MaterialIcon with the correctly mapped name", () => {
    const result = IconSymbol({ name: "house.fill", color: "blue" });

    expect(result.type).toBe(MaterialIconsMock);
    expect(result.props.name).toBe("home");
    expect(result.props.color).toBe("blue");
    expect(result.props.size).toBe(24); // default size
  });

  it("passes through size and style props", () => {
    const result = IconSymbol({
      name: "paperplane.fill",
      color: "red",
      size: 32,
      style: { opacity: 0.5 }
    });

    expect(result.type).toBe(MaterialIconsMock);
    expect(result.props.name).toBe("send");
    expect(result.props.color).toBe("red");
    expect(result.props.size).toBe(32);
    expect(result.props.style).toEqual({ opacity: 0.5 });
  });

  it("maps multiple known names correctly", () => {
    const cases = [
      { sf: "chevron.left.forwardslash.chevron.right", md: "code" },
      { sf: "sun.max.fill", md: "light-mode" },
      { sf: "moon.fill", md: "dark-mode" },
      { sf: "gearshape.fill", md: "settings" }
    ] as const;

    for (const { sf, md } of cases) {
      const result = IconSymbol({ name: sf as any, color: "black" });
      expect(result.props.name).toBe(md);
    }
  });
});
