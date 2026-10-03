---
id: vox-editorial
title: vox / vox-editorial — cut-paper editorial explainer skills
kind: skill
url: https://github.com/jaredcassoutt/vox-editorial
demo:
author: Jared Cassoutt
license: none (all rights reserved)
license_notes: No LICENSE file.
pin: f394e925f7ccbd6df3e6b3403fcb260194bbece3
category: [agent-skills, motion-video]
tags: [paper-cut, paper-collage, halftone, editorial, explainer, remotion, ffmpeg, edge-tts, narration-clock, vertical-video]
stack: [TypeScript, React, Remotion, Python]
runs_in: [claude-code, node, python]
fit: [reels-content, social-ops]
aliases: [vox-skill, Vox-style explainer]
hook: Two Claude skills that turn a researched topic into a narrated editorial film in paper-collage or cut-paper style, free to run.
source: GitHub search for paper-cut animation, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [paper-cut-animation, hyperframes-community-skills, remotion]
---

## What it is

- **vox-skill (Remotion):** paper collage, halftone cut-outs and an offset red marker stroke. Charts, documents and seals are drawn in code; public-domain portraits are lifted with the macOS Vision framework and halftoned.
- **vox-editorial (Python + ffmpeg):** cut paper on saturated grounds with generated "scissored" subject sprites, at 1080×1920.

## How it works

**"The narration is the clock":** the voiceover (free Edge neural TTS) is generated first, and every scene length and animation cue comes from its word boundaries. Change the voice and the film re-times itself. A synthesised documentary-style music bed is sidechain-ducked under the voice.

## Ideas for us

- Explainer reels about how our installations work, in a consistent editorial paper style, at near-zero cost.

## Notes

README read 2026-10-03. Very small project (7 stars).
