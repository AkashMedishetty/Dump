---
id: taichi-mpm
title: Taichi — GPU physics in ~100 lines of Python (MPM)
kind: library
url: https://github.com/taichi-dev/taichi
demo: https://docs.taichi-lang.org/
author: Yuanming Hu & the Taichi community
license: Apache-2.0
license_notes: The README code illustration (fractal_code.png) has separate image terms, not confirmed.
pin: v1.7.4
category: [simulation-physics, noise-shaders]
tags: [mpm, mls-mpm, snow, sand, jelly, fluids, gpu, python-dsl, jit, particles]
stack: [Python]
runs_in: [python, gpu]
fit: [living-floor, touchdesigner, reels-content, synesthetic-room]
aliases: [Taichi Lang, MLS-MPM, mpm88, mpm99, mpm128, Material Point Method, GAMES 201]
hook: Water, jelly and snow colliding — from about a hundred lines of Python on the GPU.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0197
image: assets/IMG_0197.jpg
thumb: assets/thumbs/IMG_0197.jpg
added: 2026-10-03
status: verified
related: [ten-minute-physics, webgl-fluid-simulation, terrain-erosion-3-ways]
---

## What it is

A Python-embedded language that JIT-compiles kernels to CUDA, Vulkan or Metal. Its famous examples, `mpm88.py`, `mpm99.py` and `mpm128.py` (shown in the reel, about 122 lines of code), simulate water, elastic jelly and snow interacting, using the Material Point Method.

## How it works

MLS-MPM loop each substep:

1. **P2G:** particles scatter mass and momentum (plus stress from their deformation gradient) to a background grid.
2. **Grid update:** divide by mass to get velocity, add gravity, apply boundary conditions.
3. **G2P:** particles gather the new velocity and an affine field (APIC), then update position and deformation gradient. Snow plasticity clamps the singular values.

Taichi's `@ti.kernel` makes the per-particle and per-cell loops run in parallel on the GPU automatically.

## Ideas for us

- **living-floor:** a sand or snow field that guests' tracked feet push around (Taichi sidecar → Spout/NDI or shared texture into TouchDesigner).
- **reels-content:** offline high-res renders of crowd-coloured materials colliding.
- Rapid prototyping of any custom simulation before porting to GLSL.

## Notes

- `pip install taichi`, then `ti example mpm128`.
- Yuanming Hu's GAMES 201 course notes: https://yuanming.taichi.graphics/
