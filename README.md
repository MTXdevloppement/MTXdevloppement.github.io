# MTX Studio — website

Source of [mtx-developpement.fr](https://mtx-developpement.fr), the website of MTX Studio: apps for iPhone, iPad, Apple Watch and Mac, websites and web apps, custom software, AI systems and games, with a dedicated site for each project.

A static site in plain HTML, CSS and JavaScript, with no dependency and no build step, served by GitHub Pages on a custom domain (`CNAME`).

## Getting started

```bash
npm run dev
npm run check
```

- `dev` serves the site on http://127.0.0.1:8765 (`python3 -m http.server`).
- `check` runs `outils/verifier.mjs`, which validates every page (links, anchors, assets, metadata, accessibility attributes).

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home page |
| `realisations.html`, `services.html`, `formules.html`, `studio.html`, `contact.html` | Main pages |
| `realisations/<project>/` | One self-contained site per project: GoRun (`foulee`), Space, MTX Viewer (`viewer`), Volta, Triade, Knowledge AI, Sténo, Mue, Kompagnion, Startup3D |
| `assets/` | Shared styles, scripts, fonts and images |
| `mentions-legales.html`, `confidentialite.html` | Legal notice and privacy policy |
| `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `llms.txt` | Error page, SEO and metadata |
| `outils/` | Site check script and the tooling that renders the presentation films |

### Presentation films

The project films in `realisations/*/assets/video/` are generated entirely by code: one HTML page per film, rendered frame by frame with Playwright and encoded with ffmpeg, plus an original soundtrack synthesised in Python. See [`outils/films/presentations/README.md`](outils/films/presentations/README.md).

## Contact

Designed and developed by **MTX Studio**.

- Email: [mtxstudio@proton.me](mailto:mtxstudio@proton.me)
- Website: [mtx-developpement.fr](https://mtx-developpement.fr)

© 2026 MTX Studio. All rights reserved.
