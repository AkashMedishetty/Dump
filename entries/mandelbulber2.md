---
id: mandelbulber2
title: Mandelbulber2 — 3D fractal explorer & renderer
kind: tool
url: https://github.com/buddhi1980/mandelbulber2
demo: https://mandelbulber.com
author: Mandelbulber Team
license: GPL-3.0
license_notes: Program GPL-3.0; bundled examples CC BY 4.0. Rendered output is yours.
pin: 109fd69ae62f81ef199575d201a7f381fa5a5744
category: [fractals-3d, noise-shaders]
tags: [fractals, mandelbulb, mandelbox, menger-sponge, raymarching, distance-estimator, opencl, flythrough]
stack: [C++, Qt, OpenCL]
runs_in: [desktop, gpu]
fit: [synesthetic-room, reels-content, touchdesigner]
aliases: [Mandelbulb, Mandelbox, 3D fractal renderer, distance estimation raymarching]
hook: Shapes with detail at every scale — fly through 3D fractals and render them like film.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0195
image: assets/IMG_0195.jpg
thumb: assets/thumbs/IMG_0195.jpg
added: 2026-10-03
status: verified
related: [tileable-volume-noise]
---

## What it is

A desktop app for exploring and rendering 3D fractals: Mandelbulb, Mandelbox, Menger sponge, Kaleidoscopic IFS and hundreds of hybrid formulas. It has lighting, volumetrics, depth of field, keyframe and flight animation, and OpenCL GPU rendering.

## How it works

- Each fractal formula has a **distance estimator**, a function giving a safe distance to the surface. Sphere-tracing (raymarching) steps along rays by that distance until it hits the surface.
- Hybrid fractals alternate formulas per iteration, which gives endless variety.
- The keyframe and flight path tools export frame sequences for film-quality renders.

## Ideas for us

- **synesthetic-room / LED backdrops:** pre-rendered infinite-zoom loops cut to the music.
- **reels-content:** "detail at every scale" fly-through as transition material.
- Copy a formula's distance estimator into a GLSL TOP in TouchDesigner for live, audio-reactive fractals.

## Notes

GPL applies to the program, not to images you render with it.
