import { describe, it, expect, vi, afterEach } from "vitest";
import { urlToFilename, resolveOutputPath, writeGif } from "../src/output.js";
import * as fs from "node:fs";

vi.mock("node:fs", () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe("urlToFilename", () => {
  it("converts a simple URL to a slug", () => {
    expect(urlToFilename("https://example.com/guide/intro")).toBe(
      "example-com-guide-intro.gif",
    );
  });

  it("handles URL with trailing slash", () => {
    expect(urlToFilename("https://docs.example.com/")).toBe(
      "docs-example-com.gif",
    );
  });

  it("handles URL with query params (ignores them)", () => {
    expect(urlToFilename("https://example.com/page?foo=bar")).toBe(
      "example-com-page.gif",
    );
  });

  it("handles URL with special characters", () => {
    expect(urlToFilename("https://my-site.io/docs/v2.0/api")).toBe(
      "my-site-io-docs-v2-0-api.gif",
    );
  });
});

describe("resolveOutputPath", () => {
  it("uses default directory when no flag given", () => {
    const result = resolveOutputPath("https://example.com/docs");
    expect(result).toBe("docs/assets/gifs/example-com-docs.gif");
  });

  it("uses directory flag with auto-generated filename", () => {
    const result = resolveOutputPath("https://example.com/docs", "output/");
    expect(result).toBe("output/example-com-docs.gif");
  });

  it("treats path without extension as directory", () => {
    const result = resolveOutputPath("https://example.com/docs", "output/screenshots");
    expect(result).toBe("output/screenshots/example-com-docs.gif");
  });

  it("uses file path as-is when it has an extension", () => {
    const result = resolveOutputPath("https://example.com/docs", "my-output.gif");
    expect(result).toBe("my-output.gif");
  });
});

describe("writeGif", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates directory and writes file", () => {
    const buffer = Buffer.from("GIF89a");
    writeGif("output/test.gif", buffer);
    expect(fs.mkdirSync).toHaveBeenCalledWith("output", { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith("output/test.gif", buffer);
  });
});
