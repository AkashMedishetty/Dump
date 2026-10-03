---
id: reaction-diffusion-ready
title: Ready — reaction-diffusion explorer
kind: tool
url: https://github.com/GollyGang/ready
demo: https://gollygang.github.io/ready/
author: The Ready Bunch (GollyGang)
license: GPL-3.0-or-later
license_notes: Code and contributed patterns are GPL-3+. Use as reference or tool; write our own shader for shipped work. Credits: https://gollygang.github.io/ready/Help/credits.html
pin: 7814c952dc93e75b87a08c69bb69b378ccd8ed91
category: [simulation-physics, generative-art]
tags: [reaction-diffusion, gray-scott, turing-patterns, cellular-automata, opencl, patterns, snowflakes]
stack: [C++, OpenCL]
runs_in: [desktop, gpu, cli]
fit: [living-floor, touchdesigner, synesthetic-room, mural-wall]
aliases: [Gray-Scott, Turing patterns, RD, continuous cellular automata, rdy]
hook: Stripes, spots and snowflakes growing out of equations.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0192
image: assets/IMG_0192.jpg
thumb: assets/thumbs/IMG_0192.jpg
added: 2026-10-03
status: verified
related: [differential-line, terrain-erosion-3-ways, webgl-fluid-simulation]
---

## What it is

A desktop program (with the `rdy` command-line tool) for exploring reaction-diffusion and other continuous cellular automata on 2D/3D grids and meshes, GPU-accelerated with OpenCL. It ships with a large library of named patterns. The reel's footage is simulation output computed with `rdy`, not screen recordings.

## How it works

The Gray-Scott model has two chemicals, A and B, on a grid:

```
dA/dt = Da·∇²A − A·B² + f·(1 − A)
dB/dt = Db·∇²B + A·B² − (k + f)·B
```

Small changes in feed `f` and kill `k` switch the result between spots, stripes, mazes, mitosis and coral. Ready lets you tune these live and also supports other formulas (Brusselator, FitzHugh–Nagumo, ...).

## Ideas for us

- **living-floor:** footsteps inject chemical B, so trails bloom into coral or leopard patterns that persist and evolve.
- TouchDesigner: two-texture GLSL feedback loop, which is trivial to implement. Use Ready to *find* good f/k values, then hard-code them.
- **mural-wall:** guests' drawings used as the seed mask.

## Notes

GPL: don't paste its code into client deliverables. The equations themselves are free to implement.
