---
id: pdoom-video
title: PDoomVideo — full music video built by Claude in code
kind: repo
url: https://github.com/JohnHeibel/PDoomVideo
demo: https://youtu.be/8j-hR4fJywU
author: John Heibel
license: none (all rights reserved)
license_notes: No LICENSE file in the repo, so default copyright applies — read and learn from it, don't copy code. The guide's "MIT-adjacent" claim is wrong. The song is a third-party track (credited in the README). The reusable, MIT-licensed version is ClaudeAnimationBase.
pin: fa546a38092e75f2b079e6a86d6abc54dd525d17
category: [motion-video]
tags: [music-video, p5js, p5-brush, storyboard, subagents, headless-chrome, ffmpeg, worked-example, clawd]
stack: [JavaScript, p5.js, Node.js]
runs_in: [node, browser]
fit: [reels-content]
aliases: [I'm Upping My P(doom), P(doom) video, studio.html, ANIMATION_GUIDE]
hook: The most transparent end-to-end example — a 156.6-second music video, storyboard to render, all in the repo.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, claude-animation-base]
---

## What it is

The source for the music video *I'm Upping My P(doom)*. Claude Opus 5.5 made it in Claude Code in two generations, and every file in the repo was written by the model. The only human direction was "use the Clawd character" and "give each lyric interesting visuals and transitions". Created 2026-09-22; about 1.7k stars when checked.

## How it works

- `studio.html`: the page every frame is painted in, with p5.js + p5.brush.
- `src/ch/c01_lab.js` … `c09_finale.js`: nine chapter files, one per section of the song.
- `src/`: shared code (`clawd.js`, `cast.js`, `props.js`, `lyrics.js`, `timeline.js`, `core.js`).
- `STORYBOARD.md`: Opus's shot-by-shot plan, written after the first generation once it was told to use brush strokes and make every scene transition into the next.
- `ANIMATION_GUIDE.md`: the style and code brief Opus wrote for the sub-agents it ran in parallel.
- `legacy/`: the first generation (Opus 5.5 at Medium effort), kept for comparison.
- `render.mjs`: paints frames in headless Chrome (resumable), then muxes in `assets/pdoom.mp3` with ffmpeg.

```bash
npm install
node render.mjs --frames=0:156.6 --workers=4   # → out/frames (resumable)
node render.mjs --encode --out=out/pdoom.mp4
```

Needs Node, Google Chrome and ffmpeg; pass `--chrome=<path>` if Chrome isn't in the default location.

## Ideas for us

- Copy the **STORYBOARD.md + ANIMATION_GUIDE.md** pattern for any multi-scene piece. The guide is what keeps parallel sub-agents visually consistent.
- Compare `legacy/` with the final version to see what the second pass (storyboard first, brush medium, forced transitions) improved.

## Notes

Verified 2026-10-03 against the README and file tree at the pinned commit. Everything the guide described is present, including the nine `src/ch/` files.
