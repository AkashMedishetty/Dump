---
id: code-rendered-motion-video
title: Code-rendered motion video with Claude (the seek(t) pipeline)
kind: technique
url: https://github.com/abhishekgoyal17/JAVA/blob/main/docs/clause/opus_motion_video_guide.md
demo:
author: abhishekgoyal17 (guide author)
license:
license_notes: Guide aggregates other people's repos — check each repo's license.
pin:
category: [motion-video]
tags: [claude-code, headless-chrome, playwright, ffmpeg, canvas, svg, gsap, p5js, deterministic-rendering, storyboard, whisper, reels]
stack: [JavaScript, Node.js, HTML]
runs_in: [node, browser, cli]
fit: [reels-content]
aliases: [AI motion graphics, programmatic video, seek(t), frame-exact rendering, Opus motion video guide]
hook: Video where Claude writes code, not pixels — every frame is a pure function of time, so nothing flickers or drifts.
source: GitHub guide (shared by user, 2026-10-03)
source_ref: docs/clause/opus_motion_video_guide.md
image:
added: 2026-10-03
status: verified
related: [pdoom-video, opus-js-animations, claude-opus-video-motion-blur, agentic-motion-graphics, shipvideo, jankscan, distilbook, openmontage, claude-animation-base]
---

## What it is

A guide to making motion videos where the model writes **animation code** (HTML + Canvas/SVG/JS, often p5.js or GSAP), a headless browser renders it frame by frame, and ffmpeg encodes the result. Because it is deterministic code rather than diffusion, characters and brand elements stay identical from frame 1 to frame 500.

## How it works

```
brief → treatment/storyboard → animation code → headless Chrome seeks frame i (t = i/fps)
→ screenshot each frame → ffmpeg stitches frames + audio → .mp4
```

**Core rule:** the whole film is a pure function of time with no hidden state:

```js
function draw(ctx, t) { /* draw exactly what is on screen at t seconds */ }
window.seek = (t) => draw(ctx, t);
```

That makes rendering **parallel** (N Chrome workers), **resumable**, and frame-exact.

```bash
node render.mjs --frames=0:20 --workers=4      # render PNG frames
node render.mjs --encode --out=out/final.mp4   # ffmpeg frames + audio
```

**Workflow with Claude Code:**

1. Brief: topic, length, tone, aspect (9:16 Reels/Shorts, 16:9 YouTube).
2. Ask for a **treatment/storyboard first**, approve it, *then* the code.
3. Render a **contact sheet** of test frames before the full render.
4. Iterate with plain-language notes ("slow scene 2").

**Levels:**

- *Zero setup:* ask for a self-contained HTML animation, preview as an artifact, then screen-record it.
- *Local pipeline:* Node ≥ 22, Chrome, Playwright, ffmpeg (+ p5.js / p5.brush / GSAP).
- *Advanced:*
  - Whisper word timestamps and beat/onset analysis so cuts land on audio.
  - Audio from files, `yt-dlp`, Web Audio synthesis, or ElevenLabs/OpenAI TTS.
  - A planner agent writes a style guide while sub-agents build scenes.
  - Self-review of contact sheets.
  - three.js when 3D is needed.
  - WebGL post: grain, chromatic aberration, real motion blur via sub-frame accumulation.
  - QA the encoded MP4 with jankscan.

## Ideas for us

- **reels-content:** promo reels for every installation built from the *same* code as the installation visuals: same palette, same particles, same brand, frame-exact.
- Recreate the @index.opensource reel format (caption band + clips) as a reusable HTML template with `seek(t)`.
- Our installation web clients (Vite/React) could expose a `window.seek` debug mode to render perfect showcase videos.

## Notes

- **Hook line from the guide:** "AI video didn't get better — it stopped being AI video."
- Requirements recap: Claude Code + Opus, Node ≥ 22, Chrome/Chromium, ffmpeg, Python 3 + numpy, `yt-dlp`, optional `openai-whisper`.
- Shared via a link with tracking params; canonical URL above.
- **Corrections after checking every linked repo (2026-10-03):**
  - PDoomVideo has no license; the guide calls it "MIT-adjacent".
  - Motion Reel ’26 (SuhaasNv) and shipvideo also have no license, so they are reference-only.
  - shipvideo keeps videos in the OpenComputer workspace, not Vercel Blob.
  - jankscan's own benchmark catches only 47% of dropped frames and flags 25 of 40 clean videos.
  - DistilBook pricing has changed (now 10 free credits, $20/$50/$100 plans).
  - Everything else matched.
