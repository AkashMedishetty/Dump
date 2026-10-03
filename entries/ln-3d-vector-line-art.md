---
id: ln-3d-vector-line-art
title: ln — 3D scenes rendered as vector lines
kind: library
url: https://github.com/fogleman/ln
demo:
author: Michael Fogleman
license: MIT
license_notes: README images only appear in project-page excerpts.
pin: 12e6c6e7445909f817f1b8d5581be4255ffa1437
category: [vector-plotter, fractals-3d]
tags: [pen-plotter, svg, hidden-line-removal, line-art, 3d-to-2d, go]
stack: [Go]
runs_in: [cli, desktop]
fit: [merch-takeaway, reels-content]
aliases: [The 3D Vector Graphics Library, hidden line rendering]
hook: The scenes are 3D, but the output isn't pixels — it's clean vector paths a pen plotter can draw.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0186
image: assets/IMG_0186.jpg
thumb: assets/thumbs/IMG_0186.jpg
added: 2026-10-03
status: verified
related: [vpype, primitive-shapes, fishdraw]
---

## What it is

A Go library that renders 3D scenes (spheres, cubes, cylinders, CSG, height functions, triangle meshes/STL) as 2D **polylines** instead of pixels. Hidden lines are removed properly, so the result is a drawing, not a shaded image.

## How it works

- Each shape provides its own set of 3D paths: outlines, latitude/longitude lines, hatching, stripes. For example, a sphere returns lat/long rings and a cube returns its edges or texture stripes.
- Paths are chopped into small segments; each segment's midpoint is ray-cast against the scene to test visibility, and occluded segments are dropped.
- Visible paths are projected with the camera and exported as SVG or PNG.

## Ideas for us

- **merch-takeaway:** a guest's 3D-scanned or avatar mesh rendered as line art and pen-plotted on the spot.
- Monochrome "engraving" look for reels or posters of our installation spaces.
- Combine with **vpype** to optimise plot order and lay out the page.

## Notes

The approach (generate paths per shape → cull by visibility → project) is easy to reproduce in JS with three.js raycasting if we need it in the browser.
