---
id: terrain-erosion-3-ways
title: Three Ways of Generating Terrain with Erosion
kind: repo
url: https://github.com/dandrino/terrain-erosion-3-ways
demo:
author: Daniel Andrino
license: MIT
license_notes: Code MIT. Elevation maps from USGS (credited in the original project). ML examples by the author.
pin: 58cdebf74bf9b0b08de61187fbd0ecebd4bb2386
category: [procedural-generation, simulation-physics]
tags: [terrain, erosion, heightmap, hydraulic-erosion, gan, river-networks, landscape, numpy]
stack: [Python, NumPy, TensorFlow]
runs_in: [python]
fit: [living-floor, touchdesigner, synesthetic-room]
aliases: [hydraulic erosion, procedural terrain, heightmap generation]
hook: Realistic eroded landscapes three ways — simulate water, learn from real elevation data, or grow river networks.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0184
image: assets/IMG_0184.jpg
thumb: assets/thumbs/IMG_0184.jpg
added: 2026-10-03
status: verified
related: [reaction-diffusion-ready, taichi-mpm]
---

## What it is

A well-written comparison of three ways to make heightmaps that *look eroded*, with Python code and rendered shaded-relief images for each.

## How it works

1. **Simulation:** start from noise, then run a grid-based hydraulic erosion loop. Rain adds water, water flows downhill, picks up sediment where it is fast and drops it where it slows, and evaporates. The reel shows the simulation converging ("iteration 716 / 716").
2. **Machine learning:** a GAN trained on real USGS elevation tiles generates new terrain that already has erosion features.
3. **River networks:** generate a drainage network first, then derive the terrain heights from it, so the valleys are correct by construction.

Each output is rendered as a hillshaded map with hypsometric tints (water blue, green lowlands, white peaks).

## Ideas for us

- **living-floor:** a projected topographic island; footsteps add rain locally so visitors literally erode the land over the night.
- TouchDesigner sand / ecosystem builds: port the hydraulic step to GLSL feedback TOPs (height + water + sediment in RGBA).
- Contour-line version of the heightmap for plotter merch.

## Notes

The simulation code is plain NumPy, so it is easy to port to GLSL or Taichi for real-time use.
