---
id: agentic-motion-graphics
title: agentic-motion-graphics — code-to-video skill on HyperFrames
kind: repo
url: https://github.com/siyuanfeng636-cpu/agentic-motion-graphics
demo:
author: siyuanfeng636-cpu
license: MIT
license_notes: Depends on HeyGen's HyperFrames CLI (separate project/terms) and optional paid TTS (OpenAI, ElevenLabs).
pin: a0f146b3f618942d57e45d34faac194d90254453
category: [motion-video]
tags: [gsap, whisper, hyperframes, synthesized-music, sfx, bpm-grid, html-css-svg, tts, claude-code-skill, saas-launch-video, explainer]
stack: [JavaScript, GSAP, Python]
runs_in: [node, python, cli]
fit: [reels-content]
aliases: [HyperFrames CLI, HeyGen HyperFrames, faster-whisper, whisper.cpp]
hook: A skill that turns a URL, paper or proposal into a GSAP motion video — Whisper word timing, synthesized 120 BPM score, HyperFrames render.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, openmontage, opus-js-animations]
---

## What it is

An agent skill (`SKILL.md` + helper scripts + prompt templates + a boilerplate project) for making commercial motion videos without a video editor. The README is part English, part Chinese. It was inspired by Moritz Kremb's "Opus 5.5 solved motion graphics" workflow.

## How it works

Six steps:

1. **Research:** read the source. For a reference video, `scripts/contact_sheet.py` makes a frame grid the model can "watch".
2. **Script:** write `scripts/script.json` with each scene's narration, on-screen text, layout and SFX cues.
3. **Voiceover:** `scripts/tts_engine.py` (OpenAI `tts-1-hd` / `gpt-4o-mini-tts` or ElevenLabs), then ffmpeg trims silences and speeds up 1.05–1.1×.
4. **Alignment:** `scripts/timing_aligner.py` (whisper.cpp / faster-whisper) writes word-level `timing.json`.
5. **Build:** `index.html` with GSAP timelines bound to `timing.json`; `scripts/synth_sfx.py` synthesizes a 120 BPM music bed and UI sounds with numpy/scipy.
6. **Check and render:** `npx hyperframes lint`, `npx hyperframes snapshot --time 1.0,2.5,4.0` (for visual self-review), `npx hyperframes render`, then ffmpeg normalizes to −14 LUFS.

It covers five archetypes with prompt templates: SaaS product launch, article/paper explainer cartoon, longform→vertical shortform, personalized client proposal video, and animated presentation.

## Ideas for us

- **Personalized proposal video** is a direct fit for CTX pitches: a client's brand plus our installation concept, animated with milestones.
- The `script.json` schema plus word-level `timing.json` is a clean contract worth copying for our own reel template.
- Synthesized SFX on a BPM grid pairs with our `_shared/sound.ts` procedural audio approach.

## Notes

- Verified 2026-10-03 (README, SKILL.md, file tree). The guide's summary is accurate.
- It is installed as `~/.agents/skills/agentic-motion-graphics` (the Antigravity convention). For Claude Code, copy it to `~/.claude/skills/` instead.
- Very new (created 2026-09-25), and the scripts haven't been run by us.
