import { Command } from "commander";
import { VALID_EASINGS } from "./types.js";
import type { Easing, ScrnpixOptions } from "./types.js";
import { loadConfig, mergeOptions, resolveApiKey, resolveApiUrl } from "./config.js";
import { fetchGif } from "./api.js";
import { resolveOutputPath, writeGif } from "./output.js";

const program = new Command();

program
  .name("scrnpix-gif")
  .description("Turn a URL into a scrolling GIF for documentation")
  .version("0.1.0")
  .argument("<url>", "URL to capture")
  .option("-W, --width <number>", "viewport width (100–1920)", parseInt)
  .option("-H, --height <number>", "viewport height (100–1080)", parseInt)
  .option("--scroll-easing <easing>", `scroll easing function (${VALID_EASINGS.join(", ")})`)
  .option("--scroll-duration <ms>", "total scroll duration in ms (500–30000)", parseInt)
  .option("--frame-delay <ms>", "delay between frames in ms (20–1000)", parseInt)
  .option("--scroll-delay <ms>", "delay before scrolling in ms (0–5000)", parseInt)
  .option("-o, --output <path>", "output file or directory (default: docs/assets/gifs/)")
  .action(async (url: string, flags: Record<string, unknown>) => {
    try {
      // Validate easing
      if (flags.scrollEasing && !VALID_EASINGS.includes(flags.scrollEasing as Easing)) {
        console.error(
          `Error: Invalid easing "${flags.scrollEasing}". Valid options: ${VALID_EASINGS.join(", ")}`,
        );
        process.exit(1);
      }

      const config = loadConfig();
      const apiKey = resolveApiKey(config);
      const apiUrl = resolveApiUrl(config);

      const cliFlags: Partial<ScrnpixOptions> = {
        url,
        width: flags.width as number | undefined,
        height: flags.height as number | undefined,
        scrollEasing: flags.scrollEasing as Easing | undefined,
        scrollDuration: flags.scrollDuration as number | undefined,
        frameDelay: flags.frameDelay as number | undefined,
        scrollDelay: flags.scrollDelay as number | undefined,
        output: flags.output as string | undefined,
      };

      const options = mergeOptions(cliFlags, config);
      const outputPath = resolveOutputPath(url, options.output);

      const result = await fetchGif(options, apiKey, apiUrl);
      writeGif(outputPath, result.gif);

      const sizeKb = (result.gif.length / 1024).toFixed(1);
      console.log(`GIF saved to ${outputPath} (${sizeKb} KB)`);
      console.log(`Credits used: ${result.creditCost} | Remaining rate limit: ${result.rateLimitRemaining}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
