import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, extname } from "node:path";

const DEFAULT_OUTPUT_DIR = "docs/assets/gifs";

export function urlToFilename(url: string): string {
  const parsed = new URL(url);
  const slug = (parsed.hostname + parsed.pathname)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug}.gif`;
}

export function resolveOutputPath(url: string, outputFlag?: string): string {
  if (!outputFlag) {
    return join(DEFAULT_OUTPUT_DIR, urlToFilename(url));
  }

  if (outputFlag.endsWith("/") || !extname(outputFlag)) {
    return join(outputFlag, urlToFilename(url));
  }

  return outputFlag;
}

export function writeGif(path: string, buffer: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}
