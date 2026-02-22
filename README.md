# scrnpix-gif

CLI tool that turns a URL into a scrolling GIF for documentation workflows. Powered by [Scrnpix](https://scrnpix.com?ref=docs-gif-generator).

## Quickstart (60 seconds)

1. [Get your API key](https://www.scrnpix.com/?ref=docs-gif-generator)
2. Export it:
   ```bash
   export SCRNPIX_API_KEY=your_key_here
   ```
3. Generate a GIF:
   ```bash
   npx scrnpix-gif https://example.com/docs
   ```

Your GIF is saved to `docs/assets/gifs/example-com-docs.gif`.

## Installation

```bash
npm install -g scrnpix-gif
```

Or use directly with `npx`:

```bash
npx scrnpix-gif <url> [options]
```

## Parameters

| Flag | Description | Default | Range |
|---|---|---|---|
| `-W, --width <number>` | Viewport width | 800 | 100–1920 |
| `-H, --height <number>` | Viewport height | 600 | 100–1080 |
| `--scroll-easing <easing>` | Scroll easing function | linear | See below |
| `--scroll-duration <ms>` | Total scroll duration | _(auto)_ | 500–30000 |
| `--frame-delay <ms>` | Delay between frames | 100 | 20–1000 |
| `--scroll-delay <ms>` | Delay before scrolling | 0 | 0–5000 |
| `-o, --output <path>` | Output file or directory | `docs/assets/gifs/` | — |

## Easing Functions

`linear`, `ease-in`, `ease-out`, `ease-in-out`, `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`, `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`, `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`, `ease-in-quint`, `ease-out-quint`, `ease-in-out-quint`

## Configuration File

Create `.scrnpixrc.json` or `scrnpix.config.json` in your project root:

```json
{
  "apiKey": "your_key_here",
  "width": 1024,
  "height": 768,
  "scrollEasing": "ease-in-out-cubic",
  "frameDelay": 80,
  "output": "docs/images/gifs/"
}
```

CLI flags always override config file values. The `SCRNPIX_API_KEY` environment variable takes precedence over the config file `apiKey`.

## GitHub Action

Automatically regenerate documentation GIFs on every push. See [`examples/github-action.yml`](examples/github-action.yml) for a complete workflow.

```yaml
- name: Generate docs GIF
  run: npx scrnpix-gif https://your-docs-site.com/guide -o docs/assets/gifs/
  env:
    SCRNPIX_API_KEY: ${{ secrets.SCRNPIX_API_KEY }}
```

## Troubleshooting

| Error | Solution |
|---|---|
| API key is required | Set `SCRNPIX_API_KEY` env var or add `apiKey` to config file |
| Invalid API key | Check your key at [scrnpix.com](https://www.scrnpix.com/?ref=docs-gif-generator) |
| URL is not publicly accessible | Ensure the page is reachable from the internet |
| Insufficient credits | Add credits at [scrnpix.com/billing](https://www.scrnpix.com/pricing?ref=docs-gif-generator) |
| Rate limit exceeded | Wait for the retry period or upgrade your plan |
| Animation failed | Verify the URL loads correctly in a browser |

## License

MIT

---

Powered by [Scrnpix](https://scrnpix.com?ref=docs-gif-generator) | [Get API Key](https://www.scrnpix.com/?ref=docs-gif-generator)
