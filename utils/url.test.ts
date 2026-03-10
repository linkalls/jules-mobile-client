import { expect, test, describe } from "bun:test";
import { isValidExternalLink } from "./url";

describe("isValidExternalLink", () => {
  test("should return true for valid https URLs", () => {
    expect(isValidExternalLink("https://github.com")).toBe(true);
    expect(isValidExternalLink("https://google.com/path?query=1")).toBe(true);
  });

  test("should return true for valid http URLs", () => {
    expect(isValidExternalLink("http://example.com")).toBe(true);
  });

  test("should be case-insensitive for the protocol", () => {
    expect(isValidExternalLink("HTTPS://github.com")).toBe(true);
    expect(isValidExternalLink("Http://example.com")).toBe(true);
  });

  test("should return false for invalid protocols", () => {
    expect(isValidExternalLink("javascript:alert(1)")).toBe(false);
    expect(isValidExternalLink("file:///etc/passwd")).toBe(false);
    expect(isValidExternalLink("ftp://example.com")).toBe(false);
    expect(isValidExternalLink("data:text/plain;base64,SGVsbG8=")).toBe(false);
  });

  test("should return false for empty or null inputs", () => {
    expect(isValidExternalLink("")).toBe(false);
    expect(isValidExternalLink(undefined)).toBe(false);
    expect(isValidExternalLink(null)).toBe(false);
  });

  test("should return false for malformed URLs without protocol", () => {
    expect(isValidExternalLink("github.com")).toBe(false);
    expect(isValidExternalLink("/path/to/file")).toBe(false);
  });
});
