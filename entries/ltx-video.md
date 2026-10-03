---
id: ltx-video
title: LTX-Video — fast real-time-ish video generation (Lightricks)
kind: library
url: https://github.com/Lightricks/LTX-Video
demo:
author: Lightricks
license: Apache-2.0 (code)
license_notes: Code Apache-2.0; model weights have their own LTXV open-weights license. Check revenue limits.
pin:
category: [ai-video-generation]
tags: [text-to-video, image-to-video, fast, keyframe-conditioning, video-extension]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content, synesthetic-room]
aliases: [LTXV, LTX-2]
hook: A DiT video model built for speed — generates clips faster than playback on high-end GPUs, with keyframe and extension control.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [wan-video, comfyui]
---

## What it is

It supports multiple-keyframe conditioning, forward/backward extension and video-to-video, with distilled variants for very fast inference. Integrated in ComfyUI.

## Ideas for us

- Its speed makes semi-live generative visuals plausible: pre-generate variations during an event from crowd prompts.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
