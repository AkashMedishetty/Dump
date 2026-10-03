---
id: tooncrafter
title: ToonCrafter — generative cartoon in-betweening
kind: library
url: https://github.com/Doubiiu/ToonCrafter
demo:
author: Jinbo Xing et al. (CUHK / Tencent AI Lab)
license: Apache-2.0
license_notes: Code Apache-2.0; check the model weights card for usage terms.
pin:
category: [ai-video-generation, animation-rigging]
tags: [anime, inbetweening, interpolation, keyframes, sketch-guided, cartoon]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content]
aliases: [cartoon interpolation, SIGGRAPH Asia 2024]
hook: Give it two anime keyframes and it generates the in-between frames, with optional sketch guidance.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [anidoc, opentoonz, story-diffusion]
---

## What it is

A video diffusion model adapted to cartoons. It interpolates between start and end frames with large motions and occlusions (where classic optical-flow in-betweening fails), and can follow a rough sketch of the intended motion.

## Ideas for us

- Turn a few hand-drawn or AI-made key poses into a fluid anime-style loop for reels or intros.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
