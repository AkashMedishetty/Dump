---
id: d3-delaunay-voronoi
title: d3-delaunay + Delaunator — Voronoi & Delaunay in JS
kind: library
url: https://github.com/d3/d3-delaunay
demo: https://observablehq.com/@mbostock/voronoi-stippling
author: Mike Bostock / Observable; Vladimir Agafonkin / Mapbox
license: ISC
license_notes: d3-delaunay ISC, Delaunator ISC, robust-predicates Unlicense. ISC copies must keep the copyright + permission notice.
pin: v6.0.4 (d3-delaunay), v5.0.0 (delaunator)
category: [geometry-algorithms, generative-art]
tags: [voronoi, delaunay, stippling, lloyd-relaxation, cells, mosaic, nearest-neighbour]
stack: [JavaScript]
runs_in: [browser, node]
fit: [memory-mosaic, mural-wall, living-floor, merch-takeaway]
aliases: [Voronoi diagram, Delaunay triangulation, weighted Voronoi stippling, Secord stippling, Lloyd's algorithm]
hook: Give it a set of points and it carves the space between them into cells.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0182
image: assets/IMG_0182.jpg
thumb: assets/thumbs/IMG_0182.jpg
added: 2026-10-03
status: verified
related: [primitive-shapes, differential-line]
---

## What it is

`d3-delaunay` computes the Delaunay triangulation of a point set and its dual, the Voronoi diagram, very fast. It is built on **Delaunator** (Mapbox), which uses **robust-predicates** for exact orientation tests so degenerate inputs don't break it.

## How it works

- `Delaunay.from(points)` → triangles; `.voronoi([x0, y0, x1, y1])` → clipped cells.
- `cellPolygon(i)` / `cellPolygons()` for drawing; `delaunay.find(x, y)` gives the nearest site in roughly O(1) when walking from the last result, which makes hover and hit-testing cheap.
- **Weighted Voronoi stippling** (Adrian Secord, 2002): scatter points, compute Voronoi, move each point to its cell's centroid *weighted by image darkness*, repeat (Lloyd relaxation). Points crowd into dark areas, which gives a stipple drawing of the image. The reel shows "iteration 31" of this converging.

## Ideas for us

- **memory-mosaic:** organic Voronoi cells instead of a square grid; each guest face clipped to a cell, sites relaxed towards the target image's darkness so the mosaic *is* a stipple of the target.
- **living-floor:** one site per tracked foot or person, so the cells reshape as people move; cell borders become the light lines.
- **merch-takeaway:** stipple a guest's selfie and pen-plot it (pipe through vpype).
- Cheap nearest-neighbour lookup for any interaction (which particle or tile is under the finger).

## Notes

- Secord 2002 paper: https://www.cs.ubc.ca/labs/imager/tr/2002/secord2002b/
- Delaunator: https://github.com/mapbox/delaunator · robust-predicates: https://github.com/mourner/robust-predicates
