import { describe, it, expect } from "vitest";
import { formatApiError } from "../src/errors.js";

const REF = "?ref=docs-gif-generator";

describe("formatApiError", () => {
  it("handles missing_url_param", () => {
    const msg = formatApiError(400, { error: "missing_url_param" });
    expect(msg).toContain("URL parameter is required");
  });

  it("handles url_not_public", () => {
    const msg = formatApiError(400, { error: "url_not_public" });
    expect(msg).toContain("not publicly accessible");
  });

  it("handles missing_api_key with signup link", () => {
    const msg = formatApiError(401, { error: "missing_api_key" });
    expect(msg).toContain("API key is required");
    expect(msg).toContain(`scrnpix.com/signup${REF}`);
  });

  it("handles invalid_api_key with signup link", () => {
    const msg = formatApiError(401, { error: "invalid_api_key" });
    expect(msg).toContain("Invalid API key");
    expect(msg).toContain(`scrnpix.com/signup${REF}`);
  });

  it("handles insufficient_credits with remaining count", () => {
    const msg = formatApiError(402, { error: "insufficient_credits", remaining: 0 });
    expect(msg).toContain("Insufficient credits");
    expect(msg).toContain("0 remaining");
    expect(msg).toContain(`scrnpix.com/billing${REF}`);
  });

  it("handles insufficient_credits without remaining count", () => {
    const msg = formatApiError(402, { error: "insufficient_credits" });
    expect(msg).toContain("Insufficient credits");
    expect(msg).not.toContain("remaining");
  });

  it("handles rate_limit_exceeded with retry_after", () => {
    const msg = formatApiError(429, { error: "rate_limit_exceeded", retry_after: 30 });
    expect(msg).toContain("Rate limit exceeded");
    expect(msg).toContain("30 seconds");
    expect(msg).toContain(`scrnpix.com/billing${REF}`);
  });

  it("handles rate_limit_exceeded without retry_after", () => {
    const msg = formatApiError(429, { error: "rate_limit_exceeded" });
    expect(msg).toContain("Rate limit exceeded");
    expect(msg).not.toContain("seconds");
  });

  it("handles animation_error", () => {
    const msg = formatApiError(500, { error: "animation_error" });
    expect(msg).toContain("Animation failed");
    expect(msg).toContain("browser");
  });

  it("falls back to message when error code is unknown", () => {
    const msg = formatApiError(500, { error: "something_new", message: "Detailed info" });
    expect(msg).toBe("API error (500): Detailed info");
  });

  it("falls back to error code when no message", () => {
    const msg = formatApiError(500, { error: "something_new" });
    expect(msg).toBe("API error (500): something_new");
  });

  it("handles completely empty body", () => {
    const msg = formatApiError(500, {});
    expect(msg).toBe("API error (500): Unknown error");
  });

  // Plain-text status fallbacks (no structured error code)
  it("maps plain-text 401 to actionable auth message", () => {
    const msg = formatApiError(401, {}, "Unauthorized");
    expect(msg).toContain("Unauthorized");
    expect(msg).toContain(`scrnpix.com/signup${REF}`);
  });

  it("maps plain-text 400 with body text", () => {
    const msg = formatApiError(400, {}, "missing url parameter");
    expect(msg).toContain("Bad request");
    expect(msg).toContain("missing url parameter");
  });

  it("maps plain-text 403 to forbidden message", () => {
    const msg = formatApiError(403, {});
    expect(msg).toContain("Forbidden");
    expect(msg).toContain(`scrnpix.com/billing${REF}`);
  });

  it("maps plain-text 429 to rate limit message", () => {
    const msg = formatApiError(429, {});
    expect(msg).toContain("Rate limit exceeded");
    expect(msg).toContain(`scrnpix.com/billing${REF}`);
  });

  it("uses plainText in generic fallback when no code or message", () => {
    const msg = formatApiError(502, {}, "Bad Gateway");
    expect(msg).toBe("API error (502): Bad Gateway");
  });
});
