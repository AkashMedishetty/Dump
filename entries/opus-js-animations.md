---
id: opus-js-animations
title: opus-js-animations — Claude Code skill that acts like a film director
kind: tool
url: https://github.com/klsoen/opus-js-animations
demo:
author: klsoen
license: MIT
license_notes:
pin: b20d25a6208f0796f0e094e3c04346b99f86d11e
category: [motion-video]
tags: [claude-code-skill, plugin, whisper, yt-dlp, elevenlabs, voiceover, treatment, reels, seek-purity, instagram-delivery]
stack: [JavaScript, Python, Node.js]
runs_in: [node, cli]
fit: [reels-content]
aliases: [Claude Code plugin video, director skill, Shaml, The Script of Me]
hook: The most installable option — a Claude Code plugin that briefs, listens, writes a treatment, then renders frame-exact MP4s.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, agentic-motion-graphics]
---

## What it is

A Claude Code skill and plugin that works like a film director. It holds five conversations before building anything, then writes the whole film as one JavaScript page and renders it frame by frame with your audio for Reels, TikTok, Shorts, X or YouTube. Example asks: *"Make a 20-second reel of this poem reading: [link]"*, *"An explainer on compound interest with a calm male voiceover (I have an ElevenLabs key)"*, *"A looping visualizer for this track, 16:9, generated music is fine"*.

## How it works

1. **Brief:** it reflects your brief back and measures any reference clip (length, cuts, style).
2. **Sound:** one of four routes: your file, a link via yt-dlp, music and effects generated with Web Audio, or an ElevenLabs/OpenAI voiceover.
3. **Listening:** length, loudness, pauses, sections, tempo and a spectrogram. Whisper aligns any voice, and lyrics or quotes are checked against the canonical text. It then reports "what I hear".
4. **Direction:** look, pacing, 2D or 3D (three.js), what a muted viewer must understand, formats, on-screen text.
5. **Treatment:** logline, central image, palette, and every scene timed to the audio. **Nothing is built until you say go.**

After that it builds, then self-checks:
- a purity test on every frame (`verify.mjs` proves `seek(t)` has no hidden state);
- contact sheets, frame strips, and 1:1 crops of faces and hands.

It renders a master plus an upload copy per platform (lossless frames, correct HD colour, no animated grain so platform re-encodes stay crisp) and gives you an upload checklist.

```
/plugin marketplace add klsoen/opus-js-animations
/plugin install opus-js-animations@opus-js-animations
```

**Requirements:**
- Node ≥ 22 (no `npm install` needed).
- Chrome or Chromium (`CHROME=/path`).
- ffmpeg.
- Python 3 + numpy, plus `openai-whisper` for voice alignment.
- yt-dlp (fetched automatically).
- Optional ElevenLabs/OpenAI key, read from the environment or `~/.config/opus-js-animations/keys.env`, never written into the project.

## Ideas for us

- The fastest path to trying the technique on a real CTX reel. Install it, then feed it installation footage audio.
- Read `references/` even without installing it:
  - `delivery.md`: why some Instagram uploads look sharp.
  - `styles.md`: a style menu.
  - `tiles-and-flocks.md`: WebGL2 instancing for thousands of elements, relevant to memory-mosaic and living-swarm.
  - `production.md`: minutes-long films with parallel agents.

## Notes

Verified 2026-10-03: README and the full `skills/opus-js-animations/` tree (SKILL.md, 13 reference docs, render/stills/verify scripts, `film-template.html`) match the guide. Young project (created 2026-09-24, few stars), so review `SKILL.md` before installing.
