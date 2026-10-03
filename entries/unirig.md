---
id: unirig
title: UniRig — one model to auto-rig any 3D mesh
kind: library
url: https://github.com/VAST-AI-Research/UniRig
demo:
author: VAST AI Research / Tsinghua
license: MIT
license_notes:
pin:
category: [animation-rigging, ai-video-generation]
tags: [auto-rigging, skeleton, skinning-weights, 3d-characters, animals, siggraph]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [avatar-arcade, reels-content]
aliases: [automatic rigging, SIGGRAPH 2025 UniRig]
hook: Feed it any 3D model — human, animal, creature, object — and it predicts a skeleton and skinning weights, ready to animate.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [trellis-image-to-3d, blender-mcp, animated-drawings]
---

## What it is

A SIGGRAPH 2025 method that uses an autoregressive transformer to generate the skeleton topology and then predicts skin weights. Works on diverse shapes, not just humanoids.

## Ideas for us

- Pipeline: generate a creature mesh (TRELLIS or Hunyuan3D) → rig with UniRig → animate in Blender (Blender MCP) → export GLB for an installation.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
