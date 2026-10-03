---
id: framepack
title: FramePack — long videos on a 6 GB laptop GPU
kind: library
url: https://github.com/lllyasviel/FramePack
demo:
author: Lvmin Zhang (lllyasviel, ControlNet author)
license: Apache-2.0
license_notes:
pin:
category: [ai-video-generation]
tags: [image-to-video, long-video, low-vram, next-frame-prediction]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content]
aliases: [frame packing, next-frame-section prediction]
hook: Image-to-video that compresses frame context to a fixed size, so it can generate minute-long clips on modest GPUs.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [hunyuan-video, wan-video]
---

## What it is

A next-frame(-section) prediction network that packs past frames into a fixed-length context, so cost doesn't grow with video length. Anti-drifting sampling keeps quality stable. Built on HunyuanVideo weights, with a simple desktop GUI.

## Ideas for us

- Animate a still (event poster, installation photo) into a long ambient loop on our own hardware.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
