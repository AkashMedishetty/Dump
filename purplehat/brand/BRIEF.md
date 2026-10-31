# PurpleHat Events: PhE brand kit (brief for designers and agents)

PurpleHat Events is a Hyderabad events company covering event management, conferences and PCO, MICE, corporate events, experiential installations, branding and design, and websites and apps. Its tagline is "Events for a more connected tomorrow." The quality bar is premium, Apple/Google level: considered, precise and tactile. No generic templates, no "AI slop".

## The logo: the "PhE" monogram
- The mark is round-capped monoline strokes of one constant width, plus **three dots** on the baseline. The dots sit under the P, under the h's terminal, and at the end of the E's bottom bar.
- **Use the master files. Never retrace or redraw the logo.** Master: `svg/phe-mark-primary.svg`, viewBox `0 0 438.99 159.84`. The geometry lives in `logo.json` and `logo-geom.js`.
- Exact geometry (SVG units):
  - Stroke 24 with round caps. Dot radius 12.75.
  - h stem centreline x = 187.24, running from y 12.37 to y 143.73.
  - h arch: an upper semicircle centred at (231.74, 113.59) with radius 44.5, from (187.24, 113.59) to the terminal at (276.24, 113.59). The arch and stem are one united outline.
  - h dot at (276.24, 147.09): the same x as the terminal.
  - E dot at (426.24, 147.09). The P is unchanged from the brand board.
- Concept: **People + Places = Experiences.** A circle (person) plus a capsule or pill (place) gives a capsule holding a circle, which reads as a toggle switched ON.
- The three dots are the brand's **animation device**: they drop, bounce, hop, breathe and land on the beat.

## Colour and type
- Violet `#2A0D6E` (primary) · Electric Blue `#2563EB` (accent: dots, highlights, CTAs) · Warm White `#F4F1EB` (neutral) · Night Ink `#1A1033` (text).
- Default colouring: strokes in Violet, dots in Electric Blue, on Warm White.
- Type: **Satoshi** is the intended face. Everything here uses **DM Sans 500** as a stand-in (in `fonts/`, SIL OFL), because Satoshi wasn't available.
- Contact: Akash Medishetty, **Chief Technology Officer**. All phone, email and web details are placeholders until confirmed.

## Rules from the client
- **Hero logo animation:** no purple or violet backgrounds, and no gradients, glows or soft blurs. Flat colour only (Warm White, Electric Blue, white).
- Violet full-bleed backgrounds are allowed in print, business cards and the guidelines.
- PhE should be prominent. Finishes (emboss, deboss, foil, die-cuts, painted edges) are welcome.
- Pattern language: pills, circles and dots (see guidelines pages 21–29).

## What's in this kit
| Path | What |
|---|---|
| `svg/`, `png/`, `pdf/`, `icons/` | All logo files: marks, lockups, app icon and favicons. `contact-sheet.png` shows them all on one page. |
| `logo.json`, `logo-geom.js`, `wordmark.json` | The master geometry every file is generated from |
| `code/` | The logo in code: an ES module (`phe-logo.js`), a classic-script build, types, a React component (`PheLogo.tsx`), CSS-only animation and an animated SVG. See `code/README.md`. |
| `animation/` | Logo animations A draw-drop, B dot-run and C people-places as live HTML (`player.html`), with renders in `animation/video/` (16:9, 9:16, 1:1) and sound in `animation/audio/` |
| `animation/hero/` | The hero logo film: source (`js/main.js`, canvas 2D), `play.html` to watch it live, and renders in `video/` (16:9 and 9:16, with sound) |
| `animation/43-worlds/` | Source of the 43 Worlds brand film. Rendering it needs the Lemo-Opuscar toolkit (MIT): https://github.com/lemomo-ai/lemo-opuscar |
| `guidelines/` | Brand guidelines PDF (47 pages, work in progress), plus signature business card mockups and print PDFs |
| `build/`, `fonts/` | The generators (`python build/build_all.py`) and the stand-in font |
| `README-logo.md` | Full logo and code documentation: clear space, minimum sizes, file list, swapping in Satoshi |

## Using it
- Web: `<img src="svg/phe-mark-twotone.svg">`. Animated: `import { mount } from './code/phe-logo.js'; mount(el, { variant: 'twotone' }).play('draw-drop')`.
- To view the HTML pages, start a local server in the kit folder (ES modules don't load from `file://`). For example, run `python3 -m http.server`, then open `/index.html`, `/animation/player.html` or `/animation/hero/play.html`.
- Render contract for the animation pages: each page exposes `window.DUR` (or `DURATION`) and `window.render(t)` (deterministic, t in seconds), and sets `window.READY` when loaded. Capture frames with any headless browser and encode with ffmpeg.
