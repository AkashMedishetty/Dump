---
id: lemo-opuscar
title: Lemo-Opuscar — 43 film styles for code-made short films (Claude Code plugin)
kind: skill
url: https://github.com/lemomo-ai/lemo-opuscar
demo: https://lemomo-ai.github.io/lemo-opuscar/
author: Lemomo / LemoLab (@lemomo_ai)
license: MIT
license_notes: Code and style prompts are MIT (© 2026 LemoLab). The demo films feature Clawd, Anthropic's Claude Code mascot, and some restyle real Best Picture films (OPUSCAR 98); use our own characters and stories for client work.
pin: fdc46d7f0e20cc953a71d56241a92d1b4cb7298e
category: [motion-video, agent-skills]
tags: [short-film, style-library, style-prompts, claude-code-plugin, canvas, webgl, frame-by-frame, tts, original-music, storyboard, isometric, cel-anime, watercolor, keynote, no-video-model]
stack: [JavaScript, Node.js, Python, Canvas, WebGL]
runs_in: [claude-code, node, python]
fit: [reels-content, client-pitches, social-ops]
aliases: [Lemo Opuscar, OPUSCAR 98, lemolab, "claude plugin install lemo-opuscar@lemolab"]
hook: A Claude Code plugin with 43 directed film styles (watercolor to 80s cel anime to dark tech keynote); name a style and a story and the agent directs, draws, scores and mixes a short film entirely in code.
source: Instagram reel "Web Lab · AI Tools" (top-5 video skills, #5)
source_ref: IMG_lemo-opuscar-reel (Instagram reel, Oct 2026)
image: assets/IMG_lemo-opuscar-reel.jpg
thumb: assets/thumbs/lemo-opuscar.jpg
added: 2026-10-14
status: verified
related: [claude-animation-base, hyperframes, reelmimic, code-rendered-motion-video, opus-video-skills, pdoom-video]
---

## What it is

A library of 43 film styles, each a `STYLE.md` plus a demo short film made entirely in code by Claude Opus 5.5, with no video model and no stock footage. You install it as a Claude Code plugin, pick a style, bring your own story, and the agent works like a small studio: script, storyboard (optional), frame-by-frame canvas and WebGL rendering, original music from free sample libraries, text-to-speech narration and mixing. The showpiece, *OPUSCAR 98* (6:31), redraws all 98 Best Picture winners in 98 styles, and all 98 style prompts are public as JSON.

## How it works

- **Three guides the agent reads:**
  - `DIRECTOR.md`: story, sound, rhythm, camera, performance, self-checks.
  - `TECHNIQUE.md`: frame-by-frame rendering, voice, music, mixing.
  - `styles/<style>/STYLE.md`: the look and sound; the story is yours.
- **Install:** `claude plugin marketplace add lemomo-ai/lemo-opuscar` then `claude plugin install lemo-opuscar@lemolab`. On first use it downloads its library to `~/lemo-opuscar`, and each film is built in the folder you start from.
- **One question round up front:** your topic, whether you have your own voice, music or material, and whether to stop once for a storyboard in the real style.
- **Style families:**
  - Hand-drawn & painting
  - East Asian traditions
  - Print & printmaking
  - Graphic & type
  - Information & keynote (dataviz, isometric infographic, dark tech keynote, hologram HUD, glass product)
  - Cartoon & anime (rubber hose, 80s cel anime, sci-fi toon, mid-century)
  - Games (pixel RPG, HD-2D, low-poly island, brick toy) and more
- **Specs:** 30–60 minutes and "a fair amount of tokens" per film. Default 1920×1080 at 24 fps. Needs Node 20+, ffmpeg and Python 3.11+. Styles are tuned for Opus 5.5.

## Ideas for us

- **PurpleHat anime spot:** the `cel-anime-80s` style with our "From Above" story and Anu's character sheet is a no-GPU route to real motion. Test it next to ReelMimic's anime-cel engine.
- **Service films:** `dark-keynote` and `glass-product` for premium Apple-like launch pieces (an installation reveal); `iso-infographic` pairs with our Anatomy figures; `blueprint` for stage and rig builds.
- **Client pitches:** a fast way to show the same story in three looks (watercolor, risograph, keynote) before choosing a direction.
- **Reels:** style prompts from OPUSCAR 98's JSON as a mood library when briefing.

## Notes

- **Verified 2026-10-14:** read the README (English), LICENSE (MIT, © 2026 LemoLab) and the `styles/` folder. It has 44 style folders plus `_template`, against "43" in the README. Pinned `main` at `fdc46d7` (2026-10-13). The reel showed about 1.9k stars and 204 forks; not checked via the API.
- The thumbnail is the repo's own OPUSCAR 98 poster (MIT). It features Clawd, Anthropic's mascot.
- The author says other models may not reproduce the styles; it's built around Opus 5.5.
- Not tried by us yet.
