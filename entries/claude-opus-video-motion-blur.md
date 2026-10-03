---
id: claude-opus-video-motion-blur
title: Motion Reel ’26 — real motion blur & lens pass in WebGL2
kind: repo
url: https://github.com/SuhaasNv/claude-opus5.5-video
demo: https://github.com/SuhaasNv/claude-opus5.5-video/blob/claude/adoring-meitner-fupr6r/out/showreel.mp4
author: SuhaasNv
license: none (all rights reserved)
license_notes: No LICENSE file, so read and learn from it but don't copy code. Default branch is claude/adoring-meitner-fupr6r (a Claude Code working branch), not main.
pin: 3d206c022de36bab67076af0e6fd1d3d9f333aa9
category: [motion-video, noise-shaders]
tags: [motion-blur, webgl2, chromatic-aberration, film-grain, bpm-sync, shutter, lens-effects, deterministic-rendering, kinetic-type, procedural-audio, showreel]
stack: [JavaScript, WebGL2, Python]
runs_in: [browser, node, gpu]
fit: [reels-content, touchdesigner, rhythm-battle]
aliases: [claude-opus5.5-video, sub-frame accumulation, 180 degree shutter]
hook: A 15-second 1080p60 showreel where every frame and every sound is code — real 180° shutter blur, lens warp, grain, numpy score.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, jankscan]
---

## What it is

*Motion Reel ’26*: a 15 s, 1080p60 motion-design showreel with no After Effects, stock or samples. It uses a Canvas2D + WebGL2 renderer, a numpy synth and ffmpeg. It works through nine scenes, each showing off a technique:

1. Spring physics with squash and stretch.
2. Kinetic type with an iris match-cut through the "O".
3. A beat-wave grid of shapes.
4. 3,200 closed-form particles (galaxy, Fibonacci sphere, torus knot).
5. An extruded block field.
6. Product-UI motion.
7. GLSL liquid chrome that refracts the type.
8. A 9-cut montage that re-shoots earlier scenes.
9. A seamless loop back to frame 0.

## How it works

- **Pure functions of time:** each scene is `draw(ctx, t)`, so frames render in any order. The montage "re-shoots" earlier moments simply by calling those scenes with an old `t`.
- **Real motion blur:** 8 sub-frames across a 180° shutter per output frame, accumulated in a half-float WebGL2 target and resolved with dither (7,200 sub-frames total).
- **Lens pass** (`src/gl.js`): impact-driven chromatic aberration, barrel warp, flash, vignette, per-frame PCG-hash grain.
- **Camera energy:** one impact envelope drives shake, zoom punch and lens warp, so every hit reads in both picture and sound.
- **On the grid:** 120 BPM; cuts land on beats and exact frame boundaries; the shutter leads each frame so none straddles a cut.
- **Score** (`tools/soundtrack.py`): oscillators and filtered noise only (kicks, claps, sidechained bass, risers, a glass shatter), each placed at its visual event's timestamp.

```bash
python3 tools/soundtrack.py
node tools/render.mjs --workers 4 --samples 8
node tools/render.mjs --stills 2.1,6.5,14.3     # QA stills
```

## Ideas for us

- Apply the sub-frame accumulation trick to TouchDesigner offline renders.
- **rhythm-battle:** one "impact envelope" driving shake, zoom and lens warp on every beat hit.
- Sound placed at visual-event timestamps pairs with our `_shared/sound.ts` procedural audio.

## Notes

Verified 2026-10-03: every technical claim in the guide matches the README. The guide didn't mention that it is a showreel or that there is no license.
