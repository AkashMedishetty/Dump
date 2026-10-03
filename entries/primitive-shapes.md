---
id: primitive-shapes
title: primitive — images rebuilt from simple shapes
kind: tool
url: https://github.com/fogleman/primitive
demo: https://primitive.lol
author: Michael Fogleman
license: MIT
license_notes: Input masterpieces in the reel were public domain.
pin: 0373c216458be1c4b40655b796a3aefedf8b7d23
category: [generative-art, geometry-algorithms]
tags: [image-approximation, hill-climbing, triangles, svg, gif, optimization, stylization]
stack: [Go]
runs_in: [cli, desktop]
fit: [memory-mosaic, mural-wall, merch-takeaway, reels-content]
aliases: [Primitive Pictures, geometric image reproduction, primitive.js]
hook: It repaints any picture using only simple shapes, added one at a time.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0193
image: assets/IMG_0193.jpg
thumb: assets/thumbs/IMG_0193.jpg
added: 2026-10-03
status: verified
related: [d3-delaunay-voronoi, ln-3d-vector-line-art]
---

## What it is

A CLI that approximates an image with N geometric primitives (triangles, rectangles, ellipses, circles, rotated rects, Bézier curves, polygons). It outputs PNG, SVG, or a GIF of the build-up.

## How it works

1. Start with a canvas filled with the image's average colour.
2. For each new shape: try random candidates, then **hill-climb** (mutate position, size and angle) to minimise RMSE between the canvas and the target. The best shape's colour is solved analytically.
3. Add the winner, then repeat. Each shape is the single best improvement available.

`primitive -i in.png -o out.svg -n 200 -m 1` (m: 0 combo, 1 triangle, 2 rect, 3 ellipse, 4 circle, 5 rotated rect, 6 beziers, 7 rotated ellipse, 8 polygon).

## Ideas for us

- **memory-mosaic alternative:** the wall rebuilds the target image shape by shape live, one shape per guest submission.
- **merch-takeaway:** a guest selfie turned into a 150-triangle poster; Bézier mode plotted with a pen.
- **reels-content:** the build-up GIF is satisfying content on its own.

## Notes

Browser ports exist (e.g. primitive.js); it is easy to reimplement with WebGL for scoring candidates.
