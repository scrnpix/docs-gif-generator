import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchGif } from "../src/api.js";
import type { ScrnpixOptions } from "../src/types.js";

const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

function mockFetchOk(headers?: Record<string, string>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(GIF_BYTES.buffer),
    headers: new Headers({
      "X-Credit-Cost": "2",
      "X-RateLimit-Remaining": "98",
      ...headers,
    }),
  });
}

function mockFetchError(status: number, body: Record<string, unknown>) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

function mockFetchPlainTextError(status: number, text: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(text),
  });
}

describe("fetchGif", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends correct URL and headers", async () => {
    const mockFn = mockFetchOk();
    global.fetch = mockFn;

    const options: ScrnpixOptions = {
      url: "https://example.com",
      width: 1024,
      height: 768,
      scrollEasing: "ease-in-out",
    };

    await fetchGif(options, "test-key", "https://api.scrnpix.com");

    const [callUrl, callInit] = mockFn.mock.calls[0];
    const parsed = new URL(callUrl);
    expect(parsed.pathname).toBe("/animate");
    expect(parsed.searchParams.get("url")).toBe("https://example.com");
    expect(parsed.searchParams.get("width")).toBe("1024");
    expect(parsed.searchParams.get("height")).toBe("768");
    expect(parsed.searchParams.get("scroll_easing")).toBe("ease-in-out");
    expect(callInit.headers["X-KEY"]).toBe("test-key");
  });

  it("omits undefined params from query string", async () => {
    const mockFn = mockFetchOk();
    global.fetch = mockFn;

    const options: ScrnpixOptions = { url: "https://example.com" };
    await fetchGif(options, "test-key", "https://api.scrnpix.com");

    const [callUrl] = mockFn.mock.calls[0];
    const parsed = new URL(callUrl);
    expect(parsed.searchParams.has("width")).toBe(false);
    expect(parsed.searchParams.has("scroll_easing")).toBe(false);
  });

  it("returns GIF buffer with credit info", async () => {
    global.fetch = mockFetchOk();

    const result = await fetchGif(
      { url: "https://example.com" },
      "test-key",
      "https://api.scrnpix.com",
    );

    expect(Buffer.isBuffer(result.gif)).toBe(true);
    expect(result.creditCost).toBe(2);
    expect(result.rateLimitRemaining).toBe(98);
  });

  it("throws with formatted error on non-200 response", async () => {
    global.fetch = mockFetchError(401, { error: "invalid_api_key" });

    await expect(
      fetchGif({ url: "https://example.com" }, "bad-key", "https://api.scrnpix.com"),
    ).rejects.toThrow("Invalid API key");
  });

  it("handles plain-text error response with actionable message", async () => {
    global.fetch = mockFetchPlainTextError(401, "Unauthorized");

    await expect(
      fetchGif({ url: "https://example.com" }, "bad-key", "https://api.scrnpix.com"),
    ).rejects.toThrow("Unauthorized");
  });

  it("handles non-JSON non-plain error response", async () => {
    global.fetch = mockFetchPlainTextError(500, "");

    await expect(
      fetchGif({ url: "https://example.com" }, "key", "https://api.scrnpix.com"),
    ).rejects.toThrow("API error (500)");
  });
});
