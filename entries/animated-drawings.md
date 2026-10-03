---
id: animated-drawings
title: Animated Drawings (Meta) — animate a child's drawing
kind: library
url: https://github.com/facebookresearch/AnimatedDrawings
demo:
author: Meta AI Research (FAIR)
license: MIT
license_notes:
pin:
category: [animation-rigging, computer-vision]
tags: [drawing-to-animation, auto-rigging, skeleton, motion-retargeting, bvh, kids]
stack: [Python]
runs_in: [python, gpu]
fit: [digital-doodles-wall, mural-wall, memory-mosaic]
aliases: [AnimatedDrawings, sketch.metademolab.com]
hook: Photograph a hand-drawn figure; it finds the character, rigs a skeleton and makes it dance — the obvious engine for a doodle wall.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [kalidokit, unirig, rive]
---

## What it is

Code for *A Method for Animating Children's Drawings of the Human Figure*. The pipeline:
1. Detect the figure and segment it.
2. Estimate joint positions and build a 2D skeleton rig over the drawing's mesh.
3. Retarget BVH motion-capture clips (dance, walk, jump) onto it with ARAP-style deformation.

## Ideas for us

- **digital-doodles-wall / mural-wall:** guests draw a character on paper or a phone; it walks onto the shared wall and dances to the event music. This is the strongest single fit in the library for doodle installations.

## Notes

The repo is **archived** (read-only since 2025), so pin the commit and vendor it. Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
