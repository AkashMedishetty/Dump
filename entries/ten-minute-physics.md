---
id: ten-minute-physics
title: Ten Minute Physics — single-file physics demos
kind: guide
url: https://github.com/matthias-research/pages/tree/master/tenMinutePhysics
demo: https://matthias-research.github.io/pages/tenMinutePhysics/
author: Matthias Müller
license: MIT
license_notes: MIT notices are inside each demo file (e.g. 14-cloth.html lines 1–11). Check each file you reuse.
pin: 568d9a9040a5e44e9b737decc63f7cc4c546b2c5
category: [simulation-physics]
tags: [xpbd, position-based-dynamics, cloth, soft-body, fluids, flip, spatial-hashing, threejs, tutorial]
stack: [JavaScript, three.js, HTML]
runs_in: [browser]
fit: [digital-doodles-wall, mural-wall, rhythm-battle, touchdesigner]
aliases: [PBD, XPBD, Position Based Dynamics, Matthias Müller physics tutorials]
hook: Every demo from the YouTube channel is one self-contained HTML file — cloth, soft bodies, fluids in ~200 lines each.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0187
image: assets/IMG_0187.jpg
thumb: assets/thumbs/IMG_0187.jpg
added: 2026-10-03
status: verified
related: [webgl-fluid-simulation, box2d, taichi-mpm, origami-simulator]
---

## What it is

The companion code to Matthias Müller's *Ten Minute Physics* YouTube channel (he co-invented Position Based Dynamics). Each lesson is a standalone `NN-topic.html`, including interaction, XPBD, soft bodies, cloth (`14-cloth.html`), self-collision with spatial hashing, Eulerian and FLIP fluids, and more. Each has a PDF of the slides.

## How it works

- **XPBD:** predict positions from velocity, then repeatedly project constraints (distance, volume, bending) directly on positions, with a compliance term so stiffness doesn't depend on iteration count. Velocity = Δposition / dt.
- Spatial hashing gives cheap neighbour queries for collisions.
- Everything is plain JS with three.js for display, so it is easy to read and port.

## Ideas for us

- **digital-doodles-wall / mural-wall:** a cloth curtain or soft-body blobs that guests poke and drag from their phones.
- **rhythm-battle:** bass hits drive impulses into a soft-body mesh.
- The cleanest reference for porting physics into TouchDesigner GLSL or compute shaders.

## Notes

Demos run straight from the GitHub Pages link, with no build step. Great teaching material for new team members.
