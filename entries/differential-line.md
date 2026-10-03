---
id: differential-line
title: Differential Line — growing, folding curves
kind: repo
url: https://github.com/inconvergent/differential-line
demo: https://inconvergent.net/generative/differential-line/
author: Anders Hoff (inconvergent)
license: MIT
license_notes: Code MIT. The author's imagery/GIFs/site footage have separate, unconfirmed reuse terms. Reel simulations rendered by Xity from pinned code.
pin: d951ed459a99fd87713b8b5a2aee06685119c007
category: [generative-art, simulation-physics]
tags: [growth, differential-growth, coral, brain, closed-curve, spatial-hashing, pen-plotter]
stack: [Python]
runs_in: [python]
fit: [collective-heartbeat, mural-wall, merch-takeaway, living-floor]
aliases: [differential growth, inconvergent]
hook: One closed line keeps growing and folds like a brain or a coral.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0198
image: assets/IMG_0198.jpg
thumb: assets/thumbs/IMG_0198.jpg
added: 2026-10-03
status: verified
related: [reaction-diffusion-ready, d3-delaunay-voronoi, vpype]
---

## What it is

Anders Hoff's classic **differential growth** simulation: a single closed loop of points that keeps lengthening and has to fold to fit, producing brain-coral and lettuce-edge forms.

## How it works

Every step:

1. **Attraction:** each node is pulled towards its two neighbours on the line (keeps it smooth).
2. **Rejection:** each node is pushed away from any other node within radius *r*, found with a spatial hash grid (stops self-intersection).
3. **Growth:** insert new nodes by splitting edges, either at random or weighted by curvature. The reel compares the two side by side; curvature priority gives more even folding.

Starting from an open line or an arc instead of a circle gives different families of shapes.

## Ideas for us

- **collective-heartbeat:** each new heartbeat that joins inserts nodes, so the room's shared line visibly grows all night.
- **merch-takeaway:** plot the final loop. It is a single continuous line, which is perfect for pens.
- **mural-wall:** seed the loop from a guest's drawn outline.

## Notes

Simple to port to JS or GLSL (spatial hash + three forces). Watch the O(n) growth and cap node counts for real-time.
