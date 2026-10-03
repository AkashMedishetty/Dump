---
id: cogvideox
title: CogVideoX — open text/image-to-video (Zhipu)
kind: library
url: https://github.com/zai-org/CogVideo
demo:
author: Zhipu AI / Tsinghua (zai-org)
license: Apache-2.0 (code)
license_notes: Model weights for 5B use the CogVideoX license; check terms.
pin:
category: [ai-video-generation]
tags: [text-to-video, image-to-video, open-weights, diffusers]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content]
aliases: [CogVideo, CogVideoX-5B]
hook: One of the first strong open video models, well supported in diffusers and ComfyUI.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [wan-video, open-sora]
---

## What it is

CogVideoX 2B/5B text-to-video and image-to-video models with diffusers pipelines and fine-tuning code (LoRA).

## Ideas for us

- A good base for fine-tuning a house style on our own footage.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
