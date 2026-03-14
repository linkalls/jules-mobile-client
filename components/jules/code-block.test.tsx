import { describe, expect, it, mock } from "bun:test";
import React from 'react';

// Avoid evaluating real react native using mock.
// IMPORTANT: we explicitly mock `@testing-library/react-native` and `react-native`
// before anything else so bun caches our mocked versions!
mock.module("@testing-library/react-native", () => ({}));
mock.module("react-test-renderer", () => ({}));

// Mock react to simulate basic hooks when bypassing RNTL
mock.module("react", () => ({
  useMemo: (factory: any) => factory(),
  createElement: (type: any, props: any, ...children: any[]) => ({ type, props, children }),
  ComponentProps: {},
}));

mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  StyleSheet: {
    create: (s: any) => s,
    flatten: (s: any) => s
  },
  View: (props: any) => ({ type: "View", props }),
  Text: (props: any) => ({ type: "Text", props }),
  ScrollView: (props: any) => ({ type: "ScrollView", props }),
  useColorScheme: () => "light",
  TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
  NativeEventEmitter: class {},
}));

mock.module("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => "light",
}));

mock.module("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

mock.module("react/jsx-runtime", () => ({
  jsx: (type: any, props: any, key: any) => ({ type, props, key }),
  jsxs: (type: any, props: any, key: any) => ({ type, props, key }),
  Fragment: "Fragment"
}));

// RNTL bypass using pure require to guarantee isolation
const { CodeBlock } = require("./code-block");

function extractTextNodes(node: any): { text: string; color: string }[] {
  let results: { text: string; color: string }[] = [];
  if (!node) return results;

  if (node.props?.style?.color && typeof node.props?.children === 'string') {
     results.push({
       text: node.props.children,
       color: node.props.style.color
     });
  }
  if (node.props?.children) {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    for (const child of children) {
       results = results.concat(extractTextNodes(child));
    }
  }
  return results;
}

const colors = {
  keyword: '#af00db',
  string: '#a31515',
  number: '#098658',
  comment: '#008000',
  boolean: '#0000ff',
  default: '#1e1e1e',
};

describe("CodeBlock syntax highlighting", () => {
  it("renders keywords correctly", () => {
    const result = CodeBlock({ code: "const x = function() { return async };" } as any);
    const nodes = extractTextNodes(result);
    const keywords = nodes.filter(n => n.color === colors.keyword).map(n => n.text);
    expect(keywords).toContain("const");
    expect(keywords).toContain("function");
    expect(keywords).toContain("return");
    expect(keywords).toContain("async");
  });

  it("renders strings correctly", () => {
    const result = CodeBlock({ code: "const a = 'hello'; const b = \"world\"; const c = `test`;" } as any);
    const nodes = extractTextNodes(result);
    const strings = nodes.filter(n => n.color === colors.string).map(n => n.text);
    expect(strings).toContain("'hello'");
    expect(strings).toContain("\"world\"");
    expect(strings).toContain("`test`");
  });

  it("renders numbers correctly", () => {
    const result = CodeBlock({ code: "const a = 42; const b = 3.14;" } as any);
    const nodes = extractTextNodes(result);
    const numbers = nodes.filter(n => n.color === colors.number).map(n => n.text);
    expect(numbers).toContain("42");
    expect(numbers).toContain("3.14");
  });

  it("renders comments correctly", () => {
    const result = CodeBlock({ code: "/* block comment */ const a = 1; // line comment" } as any);
    const nodes = extractTextNodes(result);
    const comments = nodes.filter(n => n.color === colors.comment).map(n => n.text);
    expect(comments).toContain("/* block comment */");
    expect(comments).toContain("// line comment");
  });

  it("renders booleans correctly", () => {
    const result = CodeBlock({ code: "const a = true; const b = false; const c = null; const d = undefined;" } as any);
    const nodes = extractTextNodes(result);
    const booleans = nodes.filter(n => n.color === colors.boolean).map(n => n.text);
    expect(booleans).toContain("true");
    expect(booleans).toContain("false");
    expect(booleans).toContain("null");
    expect(booleans).toContain("undefined");
  });

  it("splits text correctly with consecutive or overlapping matches", () => {
    const result = CodeBlock({ code: "return true;" } as any);
    const nodes = extractTextNodes(result);
    expect(nodes.length).toBe(4);
    expect(nodes[0]).toEqual({ text: "return", color: colors.keyword });
    expect(nodes[1]).toEqual({ text: " ", color: colors.default });
    expect(nodes[2]).toEqual({ text: "true", color: colors.boolean });
    expect(nodes[3]).toEqual({ text: ";", color: colors.default });
  });

  it("renders without errors when code is empty", () => {
    const result = CodeBlock({ code: "" } as any);
    const nodes = extractTextNodes(result);
    expect(nodes).toEqual([]);
  });

  it("displays language tag if provided", () => {
    const result = CodeBlock({ code: "const x = 1;", language: "typescript" } as any);
    const langView = result.props.children[0];
    expect(langView).toBeTruthy();
    expect(langView.props?.children?.props?.children).toBe("typescript");
  });
});
