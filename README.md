# SnipTools — Free Online Developer Tools

A fast, privacy-first developer toolbox with 16+ tools — all running entirely in your browser. No data is sent to any server.

**Live:** [sniptools.ir](https://sniptools.ir)

---

## Tools

### Security
| Tool | Description |
|---|---|
| **JWT Decoder** | Decode header & payload, check expiry, validate signature, open payload in JSON editor |
| **Crypto / Hash** | SHA-256, SHA-512, SHA-3, HMAC-SHA256, HMAC-SHA512, RIPEMD-160, MD5, SHA-1, Base64, Hex encode/decode |
| **Password Generator** | Cryptographically secure passwords with strength meter, history, and ambiguous char exclusion |

### Data & Text
| Tool | Description |
|---|---|
| **JSON Editor** | Monaco-powered editor with syntax highlighting, format, minify, validate |
| **Text Differ** | Side-by-side diff at char/word/line level with stats bar and live mode |
| **Regex Tester** | Real-time matching with flag toggles (g/i/m/s), match groups, replace preview, presets |
| **Markdown Preview** | Live side-by-side preview with toolbar buttons, custom parser — no CDN required |
| **HTML Entity** | Encode/decode HTML entities with named, decimal, hex, and all-chars modes |
| **Dummy Data** | Generate names, emails, phones, addresses, JSON, CSV, SQL INSERT, UUIDs, colors |

### Converters
| Tool | Description |
|---|---|
| **URL Tools** | URL encode/decode, URL parser, query param builder |
| **Unit Converter** | Length, weight, temperature, area, volume, data, time, speed — with swap and full table |
| **Base Converter** | Dec / Hex / Bin / Oct / Base36 / Base32, interactive 32-bit viewer, ASCII reference |
| **Color Converter** | HEX ↔ RGB ↔ HSL ↔ HSB/HSV ↔ CMYK, color picker, harmonies, tints & shades |
| **Timestamp** | Unix ↔ human-readable, live clock, duration calculator |

### Generators
| Tool | Description |
|---|---|
| **UUID / GUID** | v4, v7, NIL — multiple formats, bulk export up to 1000 |
| **CRON Parser** | Humanize expressions, next 8 run times, visual builder, 10 presets |

---

## Features

- **Zero external requests** — fonts, vendor libraries, and Monaco Editor are all self-hosted
- **Dark / light theme** — persisted in `localStorage`, respects `prefers-color-scheme`
- **Collapsible sidebar** — VSCode-style, collapses to icon-only with tooltips
- **Keyboard shortcuts** — `Ctrl+K` search, `Ctrl+Shift+T` theme, `[` / `]` prev/next tool, `?` shortcuts overlay
- **PWA-ready** — `manifest.json` for installable web app
- **SEO** — canonical URL, Open Graph, Twitter Card, JSON-LD `WebApplication` schema, `sitemap.xml`, `robots.txt`

---

## Tech Stack

- Vanilla JS (no framework)
- CSS custom properties for theming (`data-theme="dark|light"` on `<html>`)
- Monaco Editor (self-hosted) for JSON editing
- CryptoJS (self-hosted) for hashing
- diff_match_patch (self-hosted) for text diffing
- Deployed on Cloudflare Workers

---

## Project Structure

```
sniptools/
├── index.html              # SPA shell, sidebar layout
├── styles/style.css        # Design system + layout
├── scripts/
│   ├── script.js           # Router, search, keyboard shortcuts, theme
│   ├── jwt-decoder.js
│   ├── json-editor.js
│   ├── crypto-tools.js
│   ├── password-generator.js
│   ├── text-differ.js
│   ├── url-converter.js
│   ├── unit-converter.js
│   ├── uuid-generator.js
│   ├── regex-tester.js
│   ├── cron-parser.js
│   ├── color-converter.js
│   ├── base-converter.js
│   ├── timestamp-converter.js
│   ├── markdown-preview.js
│   ├── html-entity.js
│   └── dummy-data.js
├── fonts/                  # Self-hosted Inter + JetBrains Mono (woff2)
├── vendor/                 # Self-hosted JS libs + Monaco Editor
├── manifest.json
├── robots.txt
├── sitemap.xml
├── _headers                # Cloudflare cache + security headers
└── wrangler.toml
```

---

## Local Development

No build step required — open `index.html` directly in a browser, or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

---

## Deployment

Deployed via Cloudflare Workers using `wrangler`:

```bash
wrangler deploy
```

---

## License

[MIT](LICENSE)
