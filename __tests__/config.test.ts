import { describe, it, expect, afterEach } from "vitest";
import { loadConfig, mergeOptions, resolveApiKey, resolveApiUrl } from "../src/config.js";
import { tmpdir } from "node:os";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

describe("loadConfig", () => {
  it("returns empty config when no config file exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "scrnpix-test-"));
    const config = loadConfig(dir);
    expect(config).toEqual({});
  });

  it("loads .scrnpixrc.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "scrnpix-test-"));
    writeFileSync(join(dir, ".scrnpixrc.json"), JSON.stringify({ width: 1024 }));
    const config = loadConfig(dir);
    expect(config.width).toBe(1024);
  });

  it("loads scrnpix.config.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "scrnpix-test-"));
    writeFileSync(join(dir, "scrnpix.config.json"), JSON.stringify({ height: 768 }));
    const config = loadConfig(dir);
    expect(config.height).toBe(768);
  });

  it("prefers .scrnpixrc.json over scrnpix.config.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "scrnpix-test-"));
    writeFileSync(join(dir, ".scrnpixrc.json"), JSON.stringify({ width: 100 }));
    writeFileSync(join(dir, "scrnpix.config.json"), JSON.stringify({ width: 200 }));
    const config = loadConfig(dir);
    expect(config.width).toBe(100);
  });

  it("searches parent directories", () => {
    const parent = mkdtempSync(join(tmpdir(), "scrnpix-test-"));
    const child = join(parent, "subdir");
    mkdirSync(child);
    writeFileSync(join(parent, ".scrnpixrc.json"), JSON.stringify({ width: 500 }));
    const config = loadConfig(child);
    expect(config.width).toBe(500);
  });
});

describe("mergeOptions", () => {
  it("CLI flags override config values", () => {
    const result = mergeOptions(
      { url: "https://example.com", width: 1920 },
      { width: 800, height: 600 },
    );
    expect(result.width).toBe(1920);
    expect(result.height).toBe(600);
  });

  it("uses config values when CLI flags are not set", () => {
    const result = mergeOptions(
      { url: "https://example.com" },
      { width: 1024, scrollEasing: "ease-in-out" },
    );
    expect(result.width).toBe(1024);
    expect(result.scrollEasing).toBe("ease-in-out");
  });

  it("url always comes from CLI flags", () => {
    const result = mergeOptions(
      { url: "https://example.com" },
      {},
    );
    expect(result.url).toBe("https://example.com");
  });
});

describe("resolveApiKey", () => {
  const originalEnv = process.env.SCRNPIX_API_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SCRNPIX_API_KEY = originalEnv;
    } else {
      delete process.env.SCRNPIX_API_KEY;
    }
  });

  it("prefers environment variable over config", () => {
    process.env.SCRNPIX_API_KEY = "env-key";
    expect(resolveApiKey({ apiKey: "config-key" })).toBe("env-key");
  });

  it("falls back to config apiKey", () => {
    delete process.env.SCRNPIX_API_KEY;
    expect(resolveApiKey({ apiKey: "config-key" })).toBe("config-key");
  });

  it("throws when no key is available", () => {
    delete process.env.SCRNPIX_API_KEY;
    expect(() => resolveApiKey({})).toThrow("API key is required");
  });
});

describe("resolveApiUrl", () => {
  const originalEnv = process.env.SCRNPIX_API_URL;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SCRNPIX_API_URL = originalEnv;
    } else {
      delete process.env.SCRNPIX_API_URL;
    }
  });

  it("prefers environment variable", () => {
    process.env.SCRNPIX_API_URL = "https://custom.api.com";
    expect(resolveApiUrl({})).toBe("https://custom.api.com");
  });

  it("falls back to config apiUrl", () => {
    delete process.env.SCRNPIX_API_URL;
    expect(resolveApiUrl({ apiUrl: "https://config.api.com" })).toBe("https://config.api.com");
  });

  it("defaults to https://api.scrnpix.com", () => {
    delete process.env.SCRNPIX_API_URL;
    expect(resolveApiUrl({})).toBe("https://api.scrnpix.com");
  });
});
