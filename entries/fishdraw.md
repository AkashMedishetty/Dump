---
id: fishdraw
title: fishdraw — procedural fish drawings
kind: repo
url: https://github.com/LingDong-/fishdraw
demo: https://fishdraw.glitch.me/
author: Lingdong Huang
license: MIT
license_notes: Reel: local execution and video by Xity.
pin: a514372de1d05b4aa32a9e35aadec9a5299689a2
category: [generative-art, vector-plotter]
tags: [procedural-creatures, pen-plotter, svg, seeded-random, illustration, scientific-illustration]
stack: [JavaScript]
runs_in: [browser, node]
fit: [living-swarm, merch-takeaway, mural-wall]
aliases: [procedural fish, generative fish]
hook: None of these fish have ever existed — every one is drawn from a seed, as plotter-ready lines.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0189
image: assets/IMG_0189.jpg
thumb: assets/thumbs/IMG_0189.jpg
added: 2026-10-03
status: verified
related: [shan-shui-inf, ln-3d-vector-line-art, vpype]
---

## What it is

Lingdong Huang's generator for imaginary fish in the style of old natural-history engravings. It outputs polylines (SVG, or a plotter-friendly format) from a random seed, so the same seed gives the same fish.

## How it works

- Fish anatomy is parameterised (body outline curve, fins, tail type, eye, scale and stripe patterns), and each parameter is drawn from a seeded PRNG.
- Every part is constructed as vector strokes, including hatching and scale textures, so there are no pixels anywhere.
- Hidden parts are clipped so overlapping fins read correctly in line art.

## Ideas for us

- **living-swarm / mural-wall:** every guest gets *their* fish, seeded by their name, which swims into a shared aquarium wall (the post literally asks "what name would you draw?").
- **merch-takeaway:** plot the guest's fish on a postcard with their name as the specimen label.
- Pattern sheets and wallpaper for branded spaces.

## Notes

Same author as shan-shui-inf; both are good references for "seeded procedural illustration" generally.
