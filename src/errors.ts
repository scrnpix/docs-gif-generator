const REF = "?ref=docs-gif-generator";
const SIGNUP_LINK = `https://scrnpix.com/signup${REF}`;
const BILLING_LINK = `https://scrnpix.com/billing${REF}`;

interface ApiErrorBody {
  error?: string;
  message?: string;
  remaining?: number;
  retry_after?: number;
}

export function formatApiError(
  status: number,
  body: ApiErrorBody,
  plainText?: string,
): string {
  const code = body.error ?? "";

  // Match on structured error codes first
  switch (code) {
    case "missing_url_param":
      return "URL parameter is required. Usage: scrnpix-gif <url>";

    case "url_not_public":
      return "URL is not publicly accessible. Ensure the page is reachable from the internet.";

    case "missing_api_key":
      return `API key is required. Set SCRNPIX_API_KEY or sign up at ${SIGNUP_LINK}`;

    case "invalid_api_key":
      return `Invalid API key. Check your key or get a new one at ${SIGNUP_LINK}`;

    case "insufficient_credits":
      return `Insufficient credits${body.remaining !== undefined ? ` (${body.remaining} remaining)` : ""}. Add credits at ${BILLING_LINK}`;

    case "rate_limit_exceeded":
      return `Rate limit exceeded${body.retry_after !== undefined ? `. Retry after ${body.retry_after} seconds` : ""}. Upgrade your plan at ${BILLING_LINK}`;

    case "animation_error":
      return "Animation failed. Try opening the URL in a browser to verify it loads correctly.";
  }

  // No structured code — fall back to HTTP status for common plain-text responses
  if (!code) {
    switch (status) {
      case 400:
        return `Bad request${plainText ? `: ${plainText}` : ""}. Check the URL and parameters.`;
      case 401:
        return `Unauthorized. Check your API key or get one at ${SIGNUP_LINK}`;
      case 403:
        return `Forbidden. Your API key does not have access to this resource. Check your plan at ${BILLING_LINK}`;
      case 429:
        return `Rate limit exceeded. Upgrade your plan at ${BILLING_LINK}`;
    }
  }

  if (body.message) {
    return `API error (${status}): ${body.message}`;
  }
  if (plainText) {
    return `API error (${status}): ${plainText}`;
  }
  return `API error (${status}): ${code || "Unknown error"}`;
}
