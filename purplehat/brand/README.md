# PurpleHat Events: PhE logo deliverables

Open **`index.html`** to see everything: the logos on light and dark, the four animations playing live, and the code demos.

The logo is the "PhE" monogram: round-capped strokes of one constant width, plus three dots on the baseline. The dots sit under the P's stem, under the h's arch, and at the end of the E's shortened bottom bar. The concept is *people + places = experiences*: a pill plus a circle makes a pill holding a circle. Pills and circles are the pattern language, and the dots are the animation device.

| | |
|---|---|
| Units | stroke 24 · dot r 12.75 · stroke-to-dot gap 31.92 (centre to centre) · mark 438.99 × 159.84 |
| Colours | primary `#2A0D6E` · accent `#2563EB` · neutral `#F4F1EB` |
| Clear space | X = two dot diameters (51 units, 32% of the mark height) on every side |
| Minimum size | Mark: 120 px or 20 mm wide. Stacked lockup: 160 px or 30 mm. Horizontal lockup: 360 px or 60 mm. Smaller than that, use the P monogram (favicon). |
| Wordmark | **DM Sans 500, a stand-in for Satoshi Medium.** Swap instructions are below. |

## What's where

| Folder | Contents |
|---|---|
| `svg/` | 29 production SVGs. Each has a tight `viewBox`, a `<title>`, outlined artwork (no live text or strokes) and no transforms. **Marks:** primary, twotone (accent dots), reversed and twotone-reversed (on primary, with clear space as padding), black, white, accent, and `phe-mark-stroked.svg` (editable centre lines with round caps). **Lockups:** `primary` (stacked), `horizontal`, `stacked` (two-line), `pill`, each in primary, `-reversed`, `-white` and `-black`. The primary lockup keeps the short names `phe-lockup-{reversed,white,black}.svg`. **Also:** app icon (full bleed, plus a rounded version for presentations), favicon, and the clear-space and minimum-size spec sheets. |
| `png/` | Transparent PNGs at @1x, @2x and @4x of the key marks and lockups. 1x means one logo unit per pixel, so the mark is 451 × 160 px. |
| `pdf/` | Vector PDFs: the mark (primary, reversed, twotone) and the stacked, horizontal and reversed lockups. |
| `icons/` | `favicon.ico` (16/32/48), `favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` and `site.webmanifest` |
| `code/` | The logo in code: an ES module, a classic-script build, types, a React component and CSS-only animation. See `code/README.md`. |
| `animation/` | The scene pages (`draw-drop`, `dot-run`, `people-places`, `idle`, each exposing `window.render(t)`), `player.html`, `video/` (24 MP4s), `alpha/` (transparent A), `audio/` and `strips/` |
| `contact-sheet.png` | The whole SVG set on one page |
| `logo.json`, `logo-geom.js`, `wordmark.json` | The geometry every file is generated from |
| `build/` | The generators (see Rebuilding) |
| `fonts/DMSans.ttf` | The stand-in wordmark face (SIL OFL) |

### Website head snippet

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

## Animations

| | Length | What happens |
|---|---|---|
| **A · Draw + drop** | 5 s | The strokes draw on along their centre lines in sequence. The three dots drop in from above the frame and bounce onto the baseline, one per beat at 150 bpm. Then the wordmark slides up. |
| **B · Dot run** | 5 s | One dot bounces in from the left and touches down under the P, the h and the E. Each touch-down leaves a dot and sprouts that letter's strokes. The runner itself becomes the E's dot. |
| **C · People + places** | 6 s | A pill (people) and a circle (places) slide together. The circle hops into the pill and switches it on: the *experiences* toggle. The toggle morphs into the E's top bar and its knob becomes the E's dot. The rest of the mark draws on, the P and h dots land on the beat, and the knob drops last. |
| **Idle** | 4 s loop | The dots breathe, one after another. It loops seamlessly for screens and web headers. |

The files in `animation/` are as follows:

- **`video/`:** every animation at 1920×1080, 1080×1920 and 1080×1080, 30 fps, H.264 (High, yuv420p, CRF 16), on neutral (`_light`) and on primary (`_dark`). A, B and C carry AAC stereo audio. Idle is silent.
- **`alpha/`:** A with transparency for editors. ProRes 4444 `.mov` (10-bit with alpha, PCM audio) and VP9 `.webm` with alpha (Opus audio). There are two versions: `primary-ink` (dark logo, for light footage) and `light-ink` (neutral logo, for dark footage).
- **`audio/`:** the sound for each animation as 48 kHz `.wav` and `.m4a`, at −16 LUFS integrated with a true peak of about −3 dBTP. The `*.cues.json` files are the sync points the sound was built from.
- **`strips/`:** one frame strip per animation.

**Sound design.** Each dot landing is a CC0 marimba note (VCSL) with a soft body "pop". The landings rise P → h → E through a G-major triad. The bounces are ghost notes. The strokes get soft, filtered whooshes. The wordmark gets a vibraphone and hand-chime sign-off over a quiet, warm pad. Everything is synthesised or CC0, with no licence obligations.

All the motion comes from one set of functions: `PRESETS` in `code/phe-logo.js`. The web logo, the React component, the CSS keyframes and the videos therefore move identically. To change a beat, edit the preset and rebuild.

## Swapping the wordmark to Satoshi

Fontshare couldn't be reached from the build machine, so the wordmark is outlined from **DM Sans 500** (opsz 14, tracking −1%). To switch:

1. Download Satoshi from fontshare.com (it's free for commercial use under the Fontshare licence). Put `Satoshi-Medium.otf` (or the variable `Satoshi-Variable.ttf`) in `fonts/`.
2. In `build/brand.json`, set `"font": "fonts/Satoshi-Medium.otf"` and `"variations": {}`. For the variable file, use `{"wght": 500}`.
3. Run `python build/build_all.py`, plus `--video` to re-render the animations.

Every lockup SVG, PNG and PDF, `code/phe-logo.js`, the React component and the animations will pick up the new outlines. Lockup sizes are computed from the font's own cap height and ink width, so the stacked wordmark still spans the mark exactly. Kerning is applied through HarfBuzz when `uharfbuzz` is installed.

## Rebuilding

```bash
python build/build_all.py            # geometry, SVGs, code/, PNG/PDF/icons, contact sheet (about 1 min)
python build/build_all.py --video    # + sound, 24 MP4s, alpha, strips (about 10 min)
```

| Step | What it does |
|---|---|
| `build/gen_logo.py` | Turns `build/fit.json` (the stroke model fitted to the client's artwork) into `logo.json`, `logo-geom.js` and `wordmark.json` |
| `build/build_svg.py` | Builds `svg/` and `build/layouts.json` (the lockup layouts) |
| `build/build_code.mjs` | Refreshes `code/` (data block, global build, CSS keyframes, animated SVG) |
| `build/export.mjs` | Renders `png/`, `icons/` and `pdf/` through headless Chromium |
| `build/build_video.mjs` | Writes the cue lists, then calls `build/audio.py` for the sound, then renders frame by frame and encodes with ffmpeg |

The build needs these tools:

- **Python:** numpy, shapely, fonttools and pillow. Add uharfbuzz for kerning.
- **Node 18+**
- **ffmpeg**
- **Chromium and playwright-core.** Set their paths in `build/browser.mjs`, or through the `CHROME` and `PW_CORE` environment variables.
- **The CC0 sampler**, only for the sound. Set its path with `LEMO_ROOT`. Without it, `audio.py` falls back to pure numpy synthesis.

### Geometry note

The origin is the top-left of the mark's ink box. The P's dot is slightly wider than its stem (r 12.75 against a half-stroke of 12), so the stem's left edge sits at x = 0.75 and the mark is 438.99 units wide. An earlier export clipped that 0.75 in its viewBox; it has been corrected here.

### Correction v2: the h and the E (current master)

The master is `svg/phe-mark-primary.svg` and the other SVGs, built by `build/gen_logo.py` from the spec below. The pre-correction script is kept as `build/gen_logo.v1.py` for reference. Units are SVG units, and the master viewBox is `0 0 438.99 159.84`.

- **h stem:** centreline x = 187.24, from y = 12.37 to y = 143.73. Stroke 24, round caps.
- **h arch:** an upper semicircle with centre (231.74, 113.59) and centreline radius 44.5. It runs from (187.24, 113.59), on the stem's centreline, to the terminal at (276.24, 113.59).
- **One h outline:** the stem and arch are united into a single outline. The arch's start cap sits wholly inside the stem, so there is no bulge at the shoulder. In `logo-geom.js` the h-arch part's fill has the stem cut out, so the parts never overlap.
- **h dot:** centre (276.24, 147.09), the same x as the terminal.
- **E:** the E and its dot are shifted 12 units left with their shape unchanged. The E dot centre is (426.24, 147.09).
- **P:** unchanged.
