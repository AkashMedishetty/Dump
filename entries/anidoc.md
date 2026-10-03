---
id: anidoc
title: AniDoc — automatic colouring of anime line art
kind: library
url: https://github.com/robbyant-research/AniDoc
demo:
author: AniDoc authors (CVPR 2025)
license: Apache-2.0
license_notes:
pin:
category: [ai-video-generation, animation-rigging]
tags: [anime, line-art, colorization, character-reference, sketch-to-animation]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content]
aliases: [line art colorization, CVPR 2025]
hook: Colour an entire sequence of anime line art from one coloured character reference — and in-between from sparse sketches.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [tooncrafter, opentoonz]
---

## What it is

It uses video diffusion with correspondence matching to the reference character design, so colours stay consistent across frames. It can also interpolate from sparse sketch keyframes.

## Ideas for us

- Hand-drawn line animation (OpenToonz) → AniDoc colour pass → anime-style clip in a fraction of the ink-and-paint time.

## Notes

Repo moved to robbyant-research org. Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
