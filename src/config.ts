import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { ScrnpixConfig, ScrnpixOptions } from "./types.js";

const CONFIG_FILENAMES = [".scrnpixrc.json", "scrnpix.config.json"];
const DEFAULT_API_URL = "https://api.scrnpix.com";

export function loadConfig(startDir: string = process.cwd()): ScrnpixConfig {
  let dir = resolve(startDir);
  const root = dirname(dir);

  while (true) {
    for (const filename of CONFIG_FILENAMES) {
      const filepath = resolve(dir, filename);
      if (existsSync(filepath)) {
        const content = readFileSync(filepath, "utf-8");
        return JSON.parse(content) as ScrnpixConfig;
      }
    }
    const parent = dirname(dir);
    if (parent === dir || dir === root) break;
    dir = parent;
  }

  return {};
}

export function mergeOptions(
  cliFlags: Partial<ScrnpixOptions>,
  config: ScrnpixConfig,
): ScrnpixOptions {
  return {
    url: cliFlags.url!,
    width: cliFlags.width ?? config.width,
    height: cliFlags.height ?? config.height,
    scrollEasing: cliFlags.scrollEasing ?? config.scrollEasing,
    scrollDuration: cliFlags.scrollDuration ?? config.scrollDuration,
    frameDelay: cliFlags.frameDelay ?? config.frameDelay,
    scrollDelay: cliFlags.scrollDelay ?? config.scrollDelay,
    output: cliFlags.output ?? config.output,
  };
}

export function resolveApiKey(config: ScrnpixConfig): string {
  const key = process.env.SCRNPIX_API_KEY ?? config.apiKey;
  if (!key) {
    throw new Error(
      `API key is required. Set SCRNPIX_API_KEY environment variable or add apiKey to your config file.\nSign up at https://scrnpix.com/signup?ref=docs-gif-generator`,
    );
  }
  return key;
}

export function resolveApiUrl(config: ScrnpixConfig): string {
  return process.env.SCRNPIX_API_URL ?? config.apiUrl ?? DEFAULT_API_URL;
}
