---
id: white-box-cartoonization
title: White-box Cartoonization (CVPR 2020)
kind: library
url: https://github.com/SystemErrorWang/White-box-Cartoonization
demo:
author: Xinrui Wang & Jinze Yu
license: no license file
license_notes: No LICENSE file; the README restricts commercial use. Reference only.
pin:
category: [ai-video-generation, generative-art]
tags: [cartoonization, style-transfer, photo-to-cartoon, surface, structure, texture]
stack: [Python, TensorFlow]
runs_in: [python, gpu]
fit: [memory-mosaic, reels-content]
aliases: [Learning to Cartoonize]
hook: Photo/video to cartoon by separately modelling surface, structure (superpixels) and texture — tunable, not a black box.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [animegan-v3]
---

## What it is

It decomposes images into a surface representation (smooth colour regions), a structure representation (superpixel flat colours) and a texture representation (high-frequency lines), and learns to cartoonise each. Weights let you dial the style.

## Ideas for us

- A classic, well-understood method for stylising event footage.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
