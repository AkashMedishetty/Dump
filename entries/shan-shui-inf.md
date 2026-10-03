---
id: shan-shui-inf
title: Shan Shui Infinite — endless Chinese landscape scroll
kind: repo
url: https://github.com/LingDong-/shan-shui-inf
demo: https://lingdong-.github.io/shan-shui-inf/
author: Lingdong Huang
license: MIT
license_notes: Paintings referenced in the reel (Dwelling in the Fuchun Mountains, A Thousand Li of Rivers and Mountains) are public domain via Wikimedia Commons.
pin: 9f754d2b2e73495db7883d4d4055a7b0903b0454
category: [generative-art, procedural-generation]
tags: [landscape, infinite-scroll, svg, ink-painting, shan-shui, noise, procedural-illustration]
stack: [JavaScript, SVG]
runs_in: [browser]
fit: [mural-wall, synesthetic-room, living-floor]
aliases: [山水, Shan shui, generative Chinese painting]
hook: An endless Chinese landscape scroll painted entirely by code.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0191
image: assets/IMG_0191.jpg
thumb: assets/thumbs/IMG_0191.jpg
added: 2026-10-03
status: verified
related: [fishdraw, terrain-erosion-3-ways]
---

## What it is

A procedurally generated, infinitely scrolling *shan shui* (mountain-water) ink landscape in the browser, drawn as SVG. It was inspired by Song-dynasty hand scrolls.

## How it works

- Terrain silhouettes come from layered Perlin noise. Each mountain is built from strokes, texture dabs (cun) and shading washes.
- Trees, pavilions, boats, bridges and tiny figures are separate procedural generators placed along the terrain.
- The canvas is generated in chunks as you scroll, so it never ends, and a seed in the URL reproduces a scroll.

## Ideas for us

- **mural-wall:** a long projected scroll that slowly pans all night, seeded with the event name. Guests' drawings could be tucked in as tiny figures in the landscape.
- **synesthetic-room:** calm state = ink scroll; louder crowd = more mist and wind.
- An aesthetic reference: it shows how far "stroke-based" procedural drawing can go.

## Notes

Pure SVG DOM, so for huge walls you might rasterise chunks to canvas for performance.
