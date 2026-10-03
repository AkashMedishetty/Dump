---
id: functional-emotions-video
title: Functional Emotions — painted music video with a GPU brushstroke renderer
kind: repo
url: https://github.com/ledbetterljoshua/functional-emotions-video
demo:
author: Joshua Ledbetter (directing Claude Opus 5.5)
license: MIT (code)
license_notes: The song, lyrics and audio in assets/ are not covered by the MIT license.
pin: b34c20a4f8f64ee87079a2ae2fdedf2cf1990a49
category: [motion-video, noise-shaders]
tags: [music-video, painterly, brushstrokes, webgl2, instancing, flow-field, boil, storyboard, subagents, demucs, whisper, lyric-alignment]
stack: [JavaScript, WebGL2, Python]
runs_in: [browser, node, gpu]
fit: [reels-content, mural-wall, synesthetic-room]
aliases: [paint.js, painted renderer]
hook: Every frame repainted by about 60,000 instanced GPU brushstrokes that sample an underpainting, follow edges and flow fields, and "boil" like hand-painted animation.
source: Found alongside claude-paint (GitHub search), 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [pdoom-video, claude-paint, p5-brush, code-rendered-motion-video]
---

## What it is

A 6-minute painted music video made by Claude Opus 5.5 in Claude Code. A first, lyric-video attempt was rejected. Chapter I was directed as the reference, then seven sub-agents painted chapters II–VIII in parallel from `ANIMATION_GUIDE.md`, reviewed on contact sheets. `STORYBOARD.md` has 168 shots.

## How it works

**Renderer (`js/paint.js`):**
- Each shot draws a flat Canvas2D **underpainting** plus an additive **light layer**.
- The GPU repaints the underpainting with about 60k instanced, textured strokes in three size layers. Each stroke samples its colour from beneath and aligns to local edges; in flat areas it follows a flow field.
- Strokes re-roll a few times per second ("boil"), and whip pans smear strokes along the motion.
- The light layer gets bloom, then canvas weave, grain and vignette.

**Timing:**
- Each frame is a pure function of song time.
- A beat grid plus word-level lyric timing drive the cuts.
- Demucs separates the vocals, Whisper transcribes them in chunks, and Needleman–Wunsch alignment matches them to the real lyrics.

```bash
open index.html                               # plays live in the browser
node check.mjs out/sheet.jpg 30 101.5 218.3   # contact sheet at given times
node render.mjs 0 372.7 out/video.mp4 6       # 1080p, 6 parallel pages
```
Use the real GPU (`--use-angle=metal` on macOS). Software GL is about 20× slower. A full render takes about 10 minutes on an M5 Pro.

## Ideas for us

- **Steal the stroke renderer idea for installations:** any live scene (particles, camera feed, guests) as the underpainting, repainted in real time as brushstrokes. That gives a painterly mural-wall or synesthetic-room look at 60 fps.
- The direction notes in the README are a good template for directing Claude on reels: short shots, one action each, the camera always moving, hits on the beat.

## Notes

README read 2026-10-03.
