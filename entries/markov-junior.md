---
id: markov-junior
title: MarkovJunior — rewrite rules that grow mazes and buildings
kind: repo
url: https://github.com/mxgmn/MarkovJunior
demo:
author: Maxim Gumin (mxgmn)
license: MIT
license_notes: Code MIT. Demo images and other assets may have separate terms. Voxel renders in the reel were made with MagicaVoxel.
pin: 42aaf24bcf54ae164fba49c0a59348297904a676
category: [procedural-generation]
tags: [rewrite-rules, markov-algorithm, mazes, voxels, dungeons, buildings, probabilistic-programming]
stack: [C#, XML]
runs_in: [desktop]
fit: [mural-wall, reels-content, living-floor]
aliases: [Markov algorithms, MazeBacktracker, MagicaVoxel, rewrite grammar]
hook: A few rewrite rules can grow mazes, rivers, dungeons and whole voxel buildings.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0201
image: assets/IMG_0201.jpg
thumb: assets/thumbs/IMG_0201.jpg
added: 2026-10-03
status: verified
related: [wave-function-collapse]
---

## What it is

A probabilistic programming language where programs are XML lists of **rewrite rules** on 2D or 3D grids. Combined, a handful of rules like `RBB=GGR` produce mazes, caves, rivers, dungeons and multi-storey voxel architecture.

## How it works

- A rule `A=B` finds pattern A in the grid and replaces it with B (a Markov algorithm).
- Nodes control application: `one` (apply one random match), `all` (all non-overlapping matches), `prl` (parallel), `sequence` / `markov` (ordering), plus fields, path-finding, convolution and embedded WFC.
- Example `MazeBacktracker`: a red "head" cell carves through black, leaving green corridors, and backtracks when stuck.
- 3D outputs export as `.vox` files for rendering in MagicaVoxel.

## Ideas for us

- **mural-wall:** watching a maze or city *grow* rule by rule is mesmerising. Show the process live, coloured by guest teams.
- **living-floor:** a maze grows under visitors' feet and reroutes around them.
- **reels-content:** voxel building growth timelapses.

## Notes

Sister project to WaveFunctionCollapse (same author). Rules are tiny, so it is easy to port core matching to JS for a web version.
