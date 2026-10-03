---
id: comfyui
title: ComfyUI — node-graph engine for image & video diffusion
kind: library
url: https://github.com/Comfy-Org/ComfyUI
demo:
author: Comfy Org
license: GPL-3.0
license_notes: GPL-3.0: fine to run as a service; don't embed its code in closed client software.
pin:
category: [ai-video-generation]
tags: [node-graph, diffusion, workflows, api, video-models, image-models, controlnet]
stack: [Python]
runs_in: [python, gpu, desktop]
fit: [reels-content, memory-mosaic, touchdesigner]
aliases: [Comfy, ComfyUI API]
hook: The hub that runs every open image and video model (Wan, Hunyuan, LTX, LivePortrait, Flux...) as shareable node workflows, with an API.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [wan-video, liveportrait, pixelle-video]
---

## What it is

A node-based GUI and backend (about 136k stars) for diffusion pipelines. Workflows are JSON graphs that can be queued over a local HTTP/WebSocket API, so other apps (TouchDesigner, our Node servers, Pixelle-Video) can call them.

## Ideas for us

- An event-side generative server: the installation sends a prompt or selfie to a ComfyUI workflow and gets stylised frames back.
- Pixelle-Video and many short-video engines use it as their backend.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
