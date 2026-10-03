---
id: vpype
title: vpype — Swiss-army knife for plotter vector graphics
kind: tool
url: https://github.com/abey79/vpype
demo: https://vpype.readthedocs.io/
author: Antoine Beyeler & contributors
license: MIT
license_notes:
pin: e593ff05c2b13e48be2b3aa10e1c8d71c1b21dc0
category: [vector-plotter]
tags: [pen-plotter, svg, hpgl, line-optimization, axidraw, cli, pipeline]
stack: [Python]
runs_in: [cli, python]
fit: [merch-takeaway]
aliases: [vsketch, plotter pipeline]
hook: One CLI pipeline to read, clean, optimise and lay out any SVG for a pen plotter.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0186
image: assets/IMG_0186.jpg
thumb: assets/thumbs/IMG_0186.jpg
added: 2026-10-03
status: verified
related: [ln-3d-vector-line-art]
---

## What it is

A command-line pipeline for plotter-ready vector graphics. You chain commands in one line, for example `vpype read in.svg linemerge linesort reloop linesimplify layout a4 write out.svg`.

## How it works

- Commands operate on layers of polylines: `read`, `linemerge` (join touching lines), `linesort` (shortest pen-up travel), `linesimplify`, `reloop`, `splitall`, `layout` / `scale` / `rotate`, `write` (SVG or HPGL).
- A plugin system adds generators and effects; `vsketch` is the companion sketching framework.
- A viewer (`show`) previews the result, including pen-up travel.

## Ideas for us

- **merch-takeaway:** the last step for any generated line art (ln, stippling, fishdraw, differential-line) before an AxiDraw prints a guest's take-home.
- Cut plot time at live events: `linesort` often halves the drawing time.

## Notes

`pip install vpype[all]`.
