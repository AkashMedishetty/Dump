---
id: wave-function-collapse
title: WaveFunctionCollapse — grow images from a tiny example
kind: repo
url: https://github.com/mxgmn/WaveFunctionCollapse
demo:
author: Maxim Gumin (mxgmn)
license: MIT
license_notes: Code MIT. Input samples, tiles and README art by Maxim Gumin are OUTSIDE the MIT license — make our own tiles.
pin: de7d22e705e816b62b4d613199d0463820fcaef3
category: [procedural-generation]
tags: [wfc, constraint-solving, tiles, pixel-art, level-generation, texture-synthesis, entropy]
stack: [C#]
runs_in: [desktop]
fit: [mural-wall, memory-mosaic, digital-doodles-wall]
aliases: [WFC, wave function collapse, overlapping model, simple tiled model, texture synthesis]
hook: From one tiny example image, it grows a whole new picture that follows the same local rules.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0200
image: assets/IMG_0200.jpg
thumb: assets/thumbs/IMG_0200.jpg
added: 2026-10-03
status: verified
related: [markov-junior, terrain-erosion-3-ways]
---

## What it is

The algorithm that generates new bitmaps or tile maps that look locally like a small input sample. It is used in Townscaper-style towns, Bad North, Caves of Qud and countless level generators.

## How it works

1. **Learn:** *overlapping model*: cut every N×N pattern from the sample and record frequencies and which patterns may overlap. *Simple tiled model*: use given tiles plus adjacency rules.
2. **Wave:** every output cell starts as a superposition of all patterns.
3. **Observe:** pick the cell with the lowest Shannon entropy and collapse it to one pattern, weighted by frequency.
4. **Propagate:** remove now-impossible patterns from neighbours, rippling outwards (arc consistency).
5. Repeat until everything is collapsed. On contradiction, restart (or backtrack).

## Ideas for us

- **mural-wall / digital-doodles-wall:** a guest draws a tiny 8×8 pixel sample on their phone, and the wall grows a whole tapestry from it.
- Generative tile backgrounds that change per event but stay on-brand (feed it brand-colour samples).
- **memory-mosaic:** layout constraints for non-grid mosaics.

## Notes

The visual "collapse" process (low-entropy cells resolving first) is beautiful to show live, not just the result. JS ports exist (e.g. kchapelier/wavefunctioncollapse).
