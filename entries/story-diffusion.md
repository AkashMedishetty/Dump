---
id: story-diffusion
title: StoryDiffusion — consistent characters across images and video
kind: library
url: https://github.com/HVision-NKU/StoryDiffusion
demo:
author: HVision-NKU (Nankai University)
license: Apache-2.0
license_notes:
pin:
category: [ai-video-generation, animation-rigging]
tags: [character-consistency, comics, storyboard, manga, long-video, consistent-self-attention]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content, client-pitches]
aliases: [Consistent Self-Attention, NeurIPS 2024]
hook: Keeps the same character across a whole comic or storyboard, then animates between panels.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [tooncrafter]
---

## What it is

Consistent Self-Attention shares features across a batch of images so a character's face and outfit stay identical across panels (comic or manga pages). A motion predictor then makes transition videos between them.

## Ideas for us

- Fast storyboard frames with a fixed mascot for pitches; comic-style recap posts.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
