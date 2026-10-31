# Brief: re-make the 43 Worlds film with the new PurpleHat logo

Project folder (all paths below are inside it):
`/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/films/worlds2`

## What the film is
A 75 s brand film for PurpleHat Events (an events / MICE / experiential company in Hyderabad). It walks through
43 "worlds", each drawn in a different art style (the 43 Lemo-Opuscar styles), each world an event PurpleHat
could run. ONE thing is carried across every cut: the PurpleHat logo, always at the same place and size on screen,
redrawn in each world's own material (gold leaf, glyph density, cut paper, toy bricks, neon, glass...).
Transitions open from the logo. The film already exists with the OLD logo (a ring of four lenses). The client has
changed the logo; your job is to convert your worlds to the NEW logo, and make each world look great with it.

## The new logo: "PhE" monogram
- Round-capped strokes, constant stroke width, plus THREE DOTS sitting on the baseline: under the P's stem,
  under the h's arch, and at the end of the E's (shortened) bottom bar. The client wants the dots used as the
  brand's animation device: they can drop in, bounce, pulse, travel, land on beats.
- Brand colours: primary ink violet `#2A0D6E`, accent electric blue `#2563EB`, neutral warm white `#F4F1EB`.
  Default rule in every world: the five strokes in the world's main ink/material, the three dots in that world's
  accent (where the world allows a colour; brand blue is the natural accent, but use the world's own idiom — gold in
  art deco, red seal in ink wash, phosphor in CRT, etc.).
- Concept from the brand board: "people + places = experiences" (pill + circle = a pill containing a circle).
  Pills and circles are the brand's pattern language; you may use them in backgrounds where it suits a style.
- See it: `/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/svg/phe-mark-twotone.svg`
  and the API test sheet `kittest.png` in the project folder.

## The kit API (kit.js) — already written, DO NOT EDIT kit.js / film.js / timeline.js / index.html
`M = { x, y, R }` is the logo placement (same for every world). The logo is drawn **3.2·R wide and ~1.14·R tall**,
centred on (x, y). (The old mark was a circle of radius R, i.e. 2R wide and 2R tall: the new one is wider and
flatter, so anything you placed at M.x ± 1.3–2·R horizontally may now collide with the logo — re-compose.)
- `fillMark(g, M, main, acc, {only, shadow})` fill the logo; strokes get `main`, dots get `acc`. `only` = part indices.
- `strokeMark(g, M, col, lw, acc)` outline (silhouette) of every part, `lw` in screen px.
- `lineMark(g, M, col, lw=null, acc=null, only=null)` the logo drawn along its centre lines (null lw = true stroke width).
- `inMark(g, M, (g, k) => {...})` draw in logo units (0..LW=438.99, 0..LH=159.84, stroke width STROKE=24); `k` = px per unit.
  Inside it `markPaths()` gives 8 filled Path2D outlines and `markLines()` 8 centre-line Path2D (dots = small circles).
- Parts: 0 P · 1 h-stem · 2 h-arch · 3 E-top · 4 E-bowl · 5 dot-P · 6 dot-h · 7 dot-E. `isAcc(k)` true for dots; `ACC=[5,6,7]`.
  `LOGO.parts[k]` has `.kind` ('stroke'|'dot'), `.pts` (centre-line points, logo units), `.cx .cy .r` for dots, `.bbox`.
- `markHit(x, y)` (logo units) / `markHitScreen(M, sx, sy)` → part index or -1. `markCells(M, step, jitter, seed)` → grid
  cells inside the logo `[{x,y,k,i,j}]` (screen px) — for pixel / brick / ASCII / mosaic worlds.
- `markTourPts(M, n)` → one continuous tour of all centre lines `[[x,y,k],...]` (screen px) for "drawn" worlds
  (one line, whiteboard, pen). `partLinePts(M, k)` → centre line of one part (screen px).
- `anchor(M, k)` → screen [x,y] of a part's centre (for labels/leaders/callouts). `partBox(M, k)` → [x0,y0,x1,y1].
- `toScreen(M, x, y)` / `toLogo(M, sx, sy)`; `logoScale(M)`; `halfW(M)` = 1.6R; `halfH(M)` ≈ 0.57R.
- REMOVED from the old kit (do not use): `ARC_DIR`, `lensMid`, `markTour`, `markOutlinePts`, `MARK_SVG`. Code that hatched
  "along the lens" must now follow the part's centre line (`partLinePts`) or simply hatch inside each part's clip.
- Other kit helpers are unchanged: paper, tex, canvas, grainOver, vignette, poly, rr, circle, wobble, track, twos, fbm, vn2,
  hash, mulberry, easing (ss, eio, eo, ei, back, seg, clamp, lerp), rgb, hex, mix.

## Rules for every world
1. The logo is visible and READABLE as "PhE" from the **first frame** of the world (t = 0 local, and during the incoming
   transition, t is slightly negative) to the last. A world may draw it on/assemble it, but most of it must already be
   there at t = 0 (the old film's lesson: if the logo vanishes at a cut, the carried thread snaps).
2. Draw the logo in the world's own material and idiom — not a flat sticker on top. Dots = the accent, and give the dots a
   little life where it fits (a drop, a bounce, a pulse, a twinkle) — the client wants the dots to be the animation hero.
3. Keep each world's character, scene and story beat (it's the same film, same timing, same music). Re-compose the scene
   around the wider logo so nothing important collides with it.
4. Deterministic only: no Date.now(), no Math.random() (use mulberry/hash). Same frame → same pixels.
5. Performance: a frame should render in well under ~300 ms. Cache expensive things with `K.tex(...)`.
6. Only edit YOUR file(s). If you truly need a kit addition, write a local helper in your own file instead.

## How to test (render stills and LOOK at them)
```bash
L=/home/user/lemomo-ai/lemo-opuscar; F=/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/films/worlds2
cd $L && PLAYWRIGHT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node core/render/still.mjs $F 9.6 10.5 11.3 --out $F/st-<you>
# vertical format too:
cd $L && PLAYWRIGHT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node core/render/still.mjs $F 10.5 --size 1080x1920 --out $F/st-<you>-v
# contact sheet:
$L/.venv/bin/python $L/core/render/sheet.py $F/sheet-<you>.jpg $F/st-<you>/t_*.jpg --cols 4 --w 640
```
Then open the jpg with the Read tool and judge it honestly against the style. The tool exits on any page error — fix those.
While other agents are converting other files at the same time, frames near slot boundaries draw the neighbouring world too and
may error because the neighbour is not converted yet: test inside your slots (≥ 0.3 s from each boundary) until the end;
use a unique `--out` folder name so you never collide with another agent.

World slots (number, function, seconds): 01 darkKeynote 0–3.5 · 02 hologram 3.5–5.5 · 03 asciiCrt 5.5–7.5 · 04 blueprint 7.5–9.5 ·
05 artDeco 9.5–11.5 · 06 stainedGlass 11.5–13.5 · 07 paperLantern 13.5–15.5 · 08 shadowPuppet 15.5–17.5 · 09 papercut 17.5–19.5 ·
10 woodcut 19.5–21.5 · 11 engraving 21.5–23.5 · 12 silentFilm 23.5–25.5 · 13 spyTitles 25.5 · 14 silkscreen 26.5 · 15 risograph 27.5 ·
16 dossier 28.5 · 17 swiss 29.5 · 18 pictogram 30.5 · 19 gameShow 31.5 · 20 microgame 32.5 · 21 rubberHose 33.5 · 22 midcentury 34.5 ·
23 scifiToon 35.5 · (13–23 are 1 s each) · 24 celAnime 36.5 · 25 pixelRpg 37.5 · 26 hd2d 38.5 · 27 lowpoly 39.5 · 28 isoInfo 40.5 ·
29 brickToy 41.5 · 30 paperPopup 42.5 · 31 screencast 43.5 · 32 dataviz 44.5 · 33 whiteboard 45.5 · 34 crayonBook 46.5 (24–34 are 1 s each) ·
35 inkWash 47.5–51.5 · 36 watercolor 51.5–53.5 · 37 urbanSketch 53.5–55.5 · 38 ukiyoe 55.5–57.5 · 39 tiltShift 57.5–59.5 ·
40 impasto 59.5–61.5 · 41 backrooms 61.5–63.5 · 42 oneLine 63.5–65.5 · 43 glassProduct 65.5–75 (logo hero for ~3 s, then the end card overlays it).

## Report back (your final message)
Which worlds you converted, anything you could not make work, and the path of one contact sheet (16:9) and one vertical still.
