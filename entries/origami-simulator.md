---
id: origami-simulator
title: Origami Simulator — paper folding in the browser
kind: tool
url: https://github.com/amandaghassaei/OrigamiSimulator
demo: https://origamisimulator.org/
author: Amanda Ghassaei
license: MIT
license_notes: Code MIT. Individual crease patterns and media have their own terms; real-paper foldability not guaranteed.
pin: 7855983
category: [simulation-physics, geometry-algorithms]
tags: [origami, folding, crease-pattern, gpu-simulation, webgl, fold-format, stl-export]
stack: [JavaScript, WebGL, three.js]
runs_in: [browser]
fit: [mural-wall, reels-content, merch-takeaway]
aliases: [origami simulation, crease pattern simulator, FOLD]
hook: A flat sheet of paper folds itself into a crane, right in the browser.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0196
image: assets/IMG_0196.jpg
thumb: assets/thumbs/IMG_0196.jpg
added: 2026-10-03
status: verified
related: [ten-minute-physics]
---

## What it is

A WebGL app that loads a crease pattern (SVG or FOLD) and simulates the sheet folding up. A slider controls the fold percentage, and a strain heatmap shows where the paper would stretch. Results export as STL, OBJ or FOLD.

## How it works

Based on Ghassaei, Demaine & Gershenfeld, *Fast, Interactive Origami Simulation using GPU Computation* (OSME 2018):

- The sheet is a triangle mesh with **axial (bar) constraints** to keep edge lengths, **crease constraints** (torsional springs that drive the dihedral angle towards target fold × percentage), and **face constraints** to keep triangles from shearing.
- All constraints are solved in parallel on the GPU every frame, so even complex patterns fold in real time.

## Ideas for us

- **Brand reveal:** a flat logo sheet folds into a 3D mark on the big screen.
- **mural-wall:** a guest's drawing is texture-mapped onto the sheet, then folds into a crane that flies into a flock.
- **reels-content:** the fold animation as a transition.
- Export STL for printable keepsakes.

## Notes

The crease-pattern library is large; check the terms of each pattern before using it commercially.
