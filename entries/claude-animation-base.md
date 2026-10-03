---
id: claude-animation-base
title: ClaudeAnimationBase — starter kit for hand-painted Claude animations
kind: repo
url: https://github.com/JohnHeibel/ClaudeAnimationBase
demo:
author: John Heibel
license: MIT
license_notes: Code is MIT. The Clawd character is Anthropic's Claude Code mascot; swap in our own character for client or brand work.
pin: 0ac8bf2b31942376cb6b8c4074715595d512acd2
category: [motion-video, animation-rigging]
tags: [template, starter, p5js, p5-brush, character-animation, contact-sheet, headless-chrome, ffmpeg, claude-code, clawd]
stack: [JavaScript, p5.js, Node.js]
runs_in: [node, browser]
fit: [reels-content]
aliases: [Clawd, p5.brush animation kit]
hook: The cleaned-up, MIT-licensed template distilled from PDoomVideo — a rigged character, 31 emotions and a guide the model follows.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [pdoom-video, code-rendered-motion-video]
---

## What it is

A small starter kit for animating a hand-painted character with p5.js + p5.brush and Claude Opus 5.5. It is built from the PDoomVideo code plus the author's analysis of what the model did well and badly. It includes the Clawd character (views, 31 acted emotions, eyes, mouths, hats, emotes, dances) and a guide the model reads before animating.

## How it works

Open the repo in Claude Code and ask, e.g. *"Read ANIMATION_GUIDE.md, then make a 15-second video of Clawd trying to catch a butterfly."* The model then:

1. Storyboards first.
2. Builds shot by shot.
3. Renders contact sheets to check its own work.
4. Writes `out/video.mp4`.

The guide's rules include: handmade, alive, one piece, no text, always transitions, something happens in every scene, and a consistent medium of brush strokes, flat 2D and boiling linework.

- `src/core.js`: painting, timing, motion helpers, camera, light, paper.
- `src/timeline.js`: shots, loops and the brush-wipe transition.
- `src/config.js`: length and tempo.
- `src/scenes/`: your video goes here.
- `render.mjs`: contact sheets, frame strips, crops, stills and MP4.

```bash
npm install
node render.mjs --clip --out=out/video.mp4     # renders the 11 s demo
```

Open `studio.html` in Chrome to scrub; add `?loop=emotions` or `?loop=views` to see the model sheets.

## Ideas for us

- Fork it as the base for a CTX "reel kit": replace Clawd with our own character or brand mark, and keep the timeline, contact-sheet and render tooling.
- The author's tip: higher reasoning effort makes scenes more extravagant and detailed (the test videos used xhigh).

## Notes

- Without a dedicated GPU, p5.brush watercolour fills render at seconds per frame. Ask the model to avoid them on integrated graphics.
- Linux flags: `--soft-gl` (no GPU), `--gpu-angle=gl-egl` or `vulkan` (headless NVIDIA); `node gpu_probe.mjs` shows which renderer you get.
- Verified 2026-10-03 against the README and file tree.
