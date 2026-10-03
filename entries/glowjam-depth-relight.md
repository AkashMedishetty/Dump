---
id: glowjam-depth-relight
title: Glow Jam — depth-map relighting for After Effects
kind: tool
url: https://github.com/hyun2xyz/Glowjam
demo: https://hyun2.cloud
author: hyun2xyz
license: MIT
license_notes: Public repo is MIT. The full native AE source is not included. Depth model Distill-Any-Depth has its own terms.
pin: 1cbaae598e1fecd37296d4b529385bca02ee4e9b
category: [vfx-post, computer-vision]
tags: [relighting, depth-map, after-effects, monocular-depth, glow, footage]
stack: [After Effects, Python]
runs_in: [after-effects, desktop]
fit: [reels-content]
aliases: [GlowJam, Distill-Any-Depth, AI relighting]
hook: Relight ordinary footage in After Effects using AI depth maps — glow that wraps around real geometry.
source: Instagram @index.opensource (by @hyun2xyz — the curator's own project)
source_ref: IMG_0190
image: assets/IMG_0190.jpg
thumb: assets/thumbs/IMG_0190.jpg
added: 2026-10-03
status: verified
related: [tapnet-tapnext]
---

## What it is

A relighting and glow workflow for After Effects (Windows + macOS) that estimates per-frame depth from plain footage with the **Distill-Any-Depth** model, then uses that depth to place light and glow *in* the scene, not just over it.

## How it works

- A monocular depth model (Distill-Any-Depth) turns each frame into a depth map.
- Inside AE, depth drives light falloff, glow masks and fog, so light can sit between the subject and the background.

## Ideas for us

- **reels-content:** cinematic relit edits of our installation footage (light blooming from the projection onto guests).
- The same idea works live: a monocular depth model on the camera feed in TouchDesigner gives depth-aware projection effects without a depth camera.

## Notes

- Tutorial: https://youtu.be/DVa2WBMxnhg
- Model: https://huggingface.co/xingyang1/Distill-Any-Depth · Research: https://distill-any-depth-official.github.io/
