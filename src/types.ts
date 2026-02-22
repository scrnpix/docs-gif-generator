export const VALID_EASINGS = [
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "ease-in-quad",
  "ease-out-quad",
  "ease-in-out-quad",
  "ease-in-cubic",
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-in-quart",
  "ease-out-quart",
  "ease-in-out-quart",
  "ease-in-quint",
  "ease-out-quint",
  "ease-in-out-quint",
] as const;

export type Easing = (typeof VALID_EASINGS)[number];

export interface ScrnpixOptions {
  url: string;
  width?: number;
  height?: number;
  scrollEasing?: Easing;
  scrollDuration?: number;
  frameDelay?: number;
  scrollDelay?: number;
  output?: string;
}

export interface AnimateParams {
  url: string;
  width?: number;
  height?: number;
  scroll_easing?: string;
  scroll_duration?: number;
  frame_delay?: number;
  scroll_delay?: number;
}

export interface ScrnpixConfig {
  apiKey?: string;
  apiUrl?: string;
  width?: number;
  height?: number;
  scrollEasing?: Easing;
  scrollDuration?: number;
  frameDelay?: number;
  scrollDelay?: number;
  output?: string;
}

export interface FetchGifResult {
  gif: Buffer;
  creditCost: number;
  rateLimitRemaining: number;
}
