# PurpleHat Events: everything we built (cloud sessions, 3–31 October 2026)

Everything below sits in this folder (`purplehat/`). Rendered videos are in `videos/`. Code that renders with the Lemo-Opuscar toolkit is noted (see `README.md` for Mac setup).

## 1. The PhE identity (current brand): `brand/`
The client's new logo is the **PhE monogram**. It has round-capped monoline strokes, three dots on the baseline, a dot added at the end of the E, and the corrected h (v2).

| Path | What |
|---|---|
| `brand/BRIEF.md` | **Brief for designers and agents**: logo spec, colours, type, rules, file map. Start here. |
| `brand/README.md` | Full logo and code documentation (clear space, minimum sizes, file list, regeneration, swapping in Satoshi) |
| `brand/svg/`, `png/`, `pdf/`, `icons/`, `contact-sheet.png` | 29 production SVGs (marks and lockups in every colourway, app icon, favicon, spec sheets), PNG @1x/@2x/@4x, vector PDFs, favicons and the web manifest |
| `brand/logo.json`, `logo-geom.js`, `wordmark.json` | The master geometry. Master viewBox `0 0 438.99 159.84`. |
| `brand/build/` | Generators: `python build/build_all.py` (geometry → SVG/PNG/PDF/icons/code), `build_video.mjs` (logo animation videos), `gen_logo.py` (geometry v2, h and E correction) |
| `brand/code/` | **Logo in code**: `phe-logo.js` (ES module: `svgString`, `mount`, `animate`, `drawCanvas`, `pose`), `phe-logo.global.js`, `phe-logo.d.ts`, `PheLogo.tsx` (React), `phe-logo.css` (CSS-only animation), `phe-logo-animated.svg` |
| `brand/animation/` | Logo animations A draw-drop, B dot-run, C people-places and the idle loop (HTML, `player.html`). `video/` holds 9 MP4s (3 animations × 16:9, 9:16, 1:1, light), re-rendered with the v2 logo. `audio/` holds sound. |
| `brand/motion-hero/` | **Hero logo film v2** (16 s, canvas 2D, 2.5D camera, liquid dots, motion blur, flat colour, no gradients, no violet backgrounds). Use `play.html` to watch it live. `mix.py` is the score. `v1/` holds the previous versions. |
| `brand/guidelines/` | **Brand guidelines**, 47 pages (`PurpleHat-Brand-Guidelines.pdf`/`.html`), generated from `guidelines/src/` (`node src/build.mjs all && node src/render.mjs`). Also `BASIC-GUIDELINES.md`. |
| `brand/guidelines/cards/` | Business cards. **Signature** cards: Monolith (violet, blind-debossed PhE, blue foil dots), Window (capsule die-cut onto a blue core) and Ripple, each with print PDFs (ink, deboss/emboss, foil and die plates) and mockups. Alternates B and C are here too. |
| `brand/guidelines/{stationery,social,slides}/` | Letterhead, envelope, email signature, badge, lanyard, ticket, tags, 9 social templates, slide templates |
| `brand/guidelines/src/patterns.mjs` | 9 full-page pattern systems: Toggle field, Ripple, Stroke·gap·dot, Constellation, Monogram, Lanes, Halftone capsule, Supergraphic, Orbit |
| `brand/guidelines/src/capsule.mjs` | The capsule (pill + person) device: proportions, states, frames, chips, stage, entrance-arch and installation-pod scenes |
| `brand/accent-study/`, `guidelines-accent-{yellow,green}/` | Accent comparison of Electric Blue, Sunburst Yellow and Pastel Mint. **Decision: Electric Blue stays.** |

## 2. Brand films
| Video (`videos/`) | Source | What |
|---|---|---|
| `PurpleHat-PhE-Hero-Motion-{16x9,9x16}.mp4` | `brand/motion-hero/` | Hero logo animation v2, 16 s |
| `PurpleHat-43-Worlds-PhE-{16x9,9x16}.mp4` | `films/worlds2/` | **43 Worlds**: 75 s, 43 art styles, one PhE mark carried through every cut; v2 logo, Warm White end card |
| `PurpleHat-43-Worlds-{16x9,9x16}.mp4` | `films/worlds/` | The same film with the old four-lens logo |
| `PurpleHat-Standby-{16x9,9x16}.mp4` | `films/standby/` (`TREATMENT.md`) | **STANDBY**: 40 s dark-keynote film; 2,400 messages, one call, STANDBY → GO |
| `PurpleHat-Anatomy-Showreel-{16x9,9x16}.mp4`, `-ShowCall-*` | `anatomy-pilot/`, `anatomy-figures/` | **Anatomy** showreel: the 7 services as figure scenes (arrivals, brand shop, living floor, plenary, request, show call) |
| `PurpleHat-sting-16x9.mp4` | `sting/` | Logo sting (2D) for the earlier logo |
| `PurpleHat-3D-sting{,-v2}.mp4` | `b3d/` (`scene.py`, Blender 4.2 Cycles) | 3D logo sting for the earlier logo |
| `PurpleHat-FromAbove-animatic-share.mp4` | `anime/`, `assets/` | "From Above" anime-style spot animatic, built from the GPT image set and the image and motion briefs (`assets/PurpleHat-AnimeSpot-*Brief.pdf`) |
| — | `films/scripts.md` | Three Thai-ad-style story film scripts (e.g. "Small Event") |
| — | `reel/` | Reel-mimic experiments and audio synthesis (`anatomy_synth.mjs`, `anime_synth.mjs`) |

## 3. Earlier logo exploration (before the client's PhE board)
| Path | What |
|---|---|
| `decks/PurpleHat-Identity.pdf`, `.pptx` | The logo concept pitch deck: the hat-seam mark, refinements and concept variations |
| `export/`, `deck-gen/`, `phe-deck/` | Deck and concept generators and renders for that deck |
| `misc/purplehat-mark.html`, `purplehat-hat-trick.html`, `logo-*.png`, `mark-*.png` | Seam-mark studies |

## 4. Tools and helpers
| Path | What |
|---|---|
| `tools/` | Shot and sequence capture helpers, Python libraries, and `collect-mac-videos.sh` (gathers every PurpleHat video on the Mac into `~/Downloads/PurpleHat-Videos`, plus the book frames) |
| `misc/` | One-off fix scripts and render shell scripts used in the cloud (absolute cloud paths; see README) |

## 5. Elsewhere
- **Idea Library** (this repo's `entries/`, `index.html`, `library.json`): added during the sessions, including video-generation repos, reference styles and installations.
- **Not included, rebuildable:** render frame sequences, still dumps, raw pre-master renders, Python virtualenvs, `node_modules`, the 241 MB all-videos zip and the 56 MB full animatic. Everything except the master animatic regenerates from the code here.
