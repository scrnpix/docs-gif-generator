const REF = "?ref=docs-gif-generator";
const SIGNUP_LINK = `https://scrnpix.com/signup${REF}`;
const BILLING_LINK = `https://scrnpix.com/billing${REF}`;

interface ApiErrorBody {
  error?: string;
  message?: string;
  remaining?: number;
  retry_after?: number;
}

export function formatApiError(status: number, body: ApiErrorBody): string {
  const code = body.error ?? "";

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

    default:
      if (body.message) {
        return `API error (${status}): ${body.message}`;
      }
      return `API error (${status}): ${code || "Unknown error"}`;
  }
}
