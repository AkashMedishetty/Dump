---
id: wan-video
title: Wan 2.2 — open video generation models (Alibaba)
kind: library
url: https://github.com/Wan-Video/Wan2.2
demo:
author: Alibaba Tongyi Wan team
license: Apache-2.0
license_notes:
pin:
category: [ai-video-generation]
tags: [text-to-video, image-to-video, speech-to-video, character-animation, moe, open-weights]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [reels-content, client-pitches]
aliases: [Wan2.1, Wan2.2, Wan-Animate, Wan-S2V]
hook: The leading open-weight video models — text/image-to-video, speech-to-video and character animation/replacement, Apache-2.0.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [comfyui, hunyuan-video, ltx-video, framepack, cogvideox, open-sora]
---

## What it is

A family of diffusion video models: T2V/I2V (MoE architecture), a 5B model that fits consumer GPUs, Wan-S2V (audio-driven talking or singing), and Wan-Animate (animate a character image with a reference performance, or replace a person in a video). Integrated in ComfyUI.

## Ideas for us

- Generate B-roll or stylised sequences for reels; Wan-Animate to put a brand mascot through a real performance.

## Notes

Heavy GPU needs for the large models; use ComfyUI or a cloud GPU. Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
