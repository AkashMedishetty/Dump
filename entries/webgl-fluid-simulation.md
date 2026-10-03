---
id: webgl-fluid-simulation
title: WebGL Fluid Simulation — live swirling dye
kind: repo
url: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
demo: https://paveldogreat.github.io/WebGL-Fluid-Simulation/
author: Pavel Dobryakov (PavelDoGreat)
license: MIT
license_notes: The App Store app shown in the reel is a separate commercial product with separate image terms.
pin: a2d292931f19d9b3b9f564e23e6c32729d2121c3
category: [noise-shaders, simulation-physics]
tags: [fluid, stable-fluids, navier-stokes, webgl, vorticity, bloom, dye, touch-interaction]
stack: [JavaScript, WebGL, GLSL]
runs_in: [browser, gpu]
fit: [digital-doodles-wall, rhythm-battle, synesthetic-room, touchdesigner]
aliases: [Stable Fluids, Jos Stam, GPU fluid, Navier-Stokes WebGL]
hook: Every swirl is calculated live in the browser — draw a stroke and the colour flows.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0199
image: assets/IMG_0199.jpg
thumb: assets/thumbs/IMG_0199.jpg
added: 2026-10-03
status: verified
related: [ten-minute-physics, taichi-mpm, reaction-diffusion-ready, tileable-volume-noise]
---

## What it is

The famous single-page GPU fluid toy: drag across the screen and coloured dye swirls with vorticity, bloom and sun rays. It runs on phones too.

## How it works

Jos Stam's *Stable Fluids* on framebuffers, per frame:

1. **Splat:** pointer strokes add velocity and dye (gaussian splats).
2. **Advect:** dye and velocity are moved along the velocity field (semi-Lagrangian).
3. **Curl + vorticity confinement:** re-injects small swirls.
4. **Divergence → pressure (Jacobi iterations) → subtract gradient:** makes the flow incompressible.
5. **Display:** shading, bloom and sunrays post passes.

Config knobs: `SIM_RESOLUTION`, `DYE_RESOLUTION`, `DENSITY_DISSIPATION`, `VELOCITY_DISSIPATION`, `PRESSURE`, `PRESSURE_ITERATIONS`, `CURL`, `SPLAT_RADIUS`, `SPLAT_FORCE`, `SHADING`, `COLORFUL`, `BLOOM`, `SUNRAYS`.

## Ideas for us

- **digital-doodles-wall:** phone swipes inject dye into the shared wall.
- **rhythm-battle:** beats trigger splats; each team has its own colour; the dominant colour wins.
- **synesthetic-room:** crowd volume → `CURL` and splat force; quiet = high dissipation and calm.
- Drop-in background for any web installation (MIT, single file).

## Notes

The post's tuning order: (1) draw strokes → (2) colour moves with velocity → (3) pressure solve → (4) vorticity and lighting settings for mood.
