# Presentation films

The films for Volta, Mue, Knowledge AI, Startup3D, Space and Triade are produced here entirely by code: one HTML page per film, captured frame by frame, with an original synthesised soundtrack. The video is never edited by hand: change the page (or the music sheet) and run the build again. The GoRun, MTX Viewer, Sténo and Kompagnion films were delivered as MP4 and prepared with `../presentations.sh`.

| Film | Format | Duration | Tempo | Material |
| --- | --- | --- | --- | --- |
| `volta.html` | 16:9 | 36 s | 120 | 12 real app captures, light and dark |
| `mue.html` | 16:9 | 34.3 s | 112 | 22 real captures: wheels, banners, workshop, settings |
| `knowledge-ai.html` | 16:9 | 40 s | 96 | Captures of the running app, including 26 frames of a live search |
| `startup3d.html` | 16:9 | 34.9 s | 110 | 8 app captures, day and night |
| `space.html` | 9:16 | 30 s | 128 | The site's demo run of the game and 5 game captures |
| `triade.html` | 9:16 | 38.4 s | 100 | 9 iPhone app captures |

## Building a film

From the site root, with the local server running (`python3 -m http.server 8765`):

```sh
outils/films/presentations/fabriquer.sh volta 6.4
node outils/films/presentations/apercu.mjs volta /tmp/v.png 1,6.5,12
```

The first command builds a film, with the poster frame taken at the given second. The second renders a contact sheet of a few instants for review.

`fabriquer.sh` runs:

1. `filmer.mjs`: Chromium (Playwright) opens the page with `?tournage`, advances time through `window.film.aller(t)` and captures every frame (30 fps), piped straight into ffmpeg to write a near-lossless master (H.264 4:4:4, CRF 10). The master is only rebuilt when the page or the kit changed.
2. `musique.py`: the soundtrack, at the exact film duration.
3. Web encoding with the same settings as the delivered films: H.264 (CRF 24) and AV1 (CRF 36) with AAC audio, a 720p version for phones when the film is landscape, and a WebP poster, with BT.709 colour metadata. Output goes to `realisations/<film>/assets/video/presentation*`.
4. `son.py`: re-muxes the music and checks the peak after AAC encoding; above −1 dBFS the gain is lowered accordingly and the audio re-encoded, while the video stream is copied as-is.

Do not edit `fabriquer.sh` while it runs: bash reads the script as it goes.

## Writing a film

- `../moteur.js` is the film engine: every frame is computed from time alone. Tracks (`f.piste(element, [t, {x, y, s, r, o, f}], …)`) compose; a value missing from the first keys takes the value of the first key that sets it, so specify opacity in every key when it changes at the end of a track.
- `kit.js` / `kit.css` provide masked word-by-word titles, a Mac window, an iPhone, badges, keys, cursor, background (glows and grain), a top veil that keeps titles readable over zoomed captures and an end card.
- Scenes land on musical bars (`const M = 240 / tempo`) so cuts, swells and hits of the soundtrack coincide.
- Space runs the site's game code on the film clock instead of `requestAnimationFrame`, frame by frame, so the demo run is identical on every capture.

## Music

`musique.py <film> <output.wav>` synthesises everything with NumPy and SciPy, with no sample or imported loop. Each film's sheet sets the tempo, key, four chords, sections (pad, arpeggio, bass, kick, clap, hi-hat) and the bars of scene changes. The mix is checked per bar: peak at −1.5 dBFS before encoding, about −13 dBFS RMS, with energy spread across lows and mids to stay audible on a phone speaker.

## Knowledge AI captures

Taken on the real app (Next.js UI, FastAPI API) running with the fake services from its own test suite instead of Ollama and Wikipedia, extended with five articles on the birth of France. The interface, search, passage selection and citation verification are real; the articles, model answer and timings come from the test data set. The film page says so below the video.
