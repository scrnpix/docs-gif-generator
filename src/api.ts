import type { ScrnpixOptions, AnimateParams, FetchGifResult } from "./types.js";
import { formatApiError } from "./errors.js";

function toAnimateParams(options: ScrnpixOptions): AnimateParams {
  const params: AnimateParams = { url: options.url };
  if (options.width !== undefined) params.width = options.width;
  if (options.height !== undefined) params.height = options.height;
  if (options.scrollEasing !== undefined) params.scroll_easing = options.scrollEasing;
  if (options.scrollDuration !== undefined) params.scroll_duration = options.scrollDuration;
  if (options.frameDelay !== undefined) params.frame_delay = options.frameDelay;
  if (options.scrollDelay !== undefined) params.scroll_delay = options.scrollDelay;
  return params;
}

export async function fetchGif(
  options: ScrnpixOptions,
  apiKey: string,
  apiUrl: string,
): Promise<FetchGifResult> {
  const params = toAnimateParams(options);
  const url = new URL("/animate", apiUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "X-KEY": apiKey },
  });

  if (!response.ok) {
    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // Response may not be JSON
    }
    throw new Error(formatApiError(response.status, body));
  }

  const arrayBuffer = await response.arrayBuffer();
  const gif = Buffer.from(arrayBuffer);

  const creditCost = Number(response.headers.get("X-Credit-Cost") ?? "1");
  const rateLimitRemaining = Number(
    response.headers.get("X-RateLimit-Remaining") ?? "0",
  );

  return { gif, creditCost, rateLimitRemaining };
}
