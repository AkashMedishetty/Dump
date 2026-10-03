---
id: tapnet-tapnext
title: TAPNet / TAPIR / TAPNext — track any point in video
kind: model
url: https://github.com/google-deepmind/tapnet
demo: https://deepmind-tapir.github.io/
author: Google DeepMind
license: Apache-2.0
license_notes: Apache-2.0 for code and linked pretrained checkpoints. Footage in the reel was CC0 (Wikimedia Commons).
pin: 730cda1c730877cfedbe01bf87fb1cadb78a565d
category: [computer-vision]
tags: [point-tracking, optical-flow, rotoscoping, video-analysis, pytorch, jax, overlays]
stack: [Python, JAX, PyTorch]
runs_in: [python, gpu]
fit: [reels-content, touchdesigner]
aliases: [Tracking Any Point, TAP-Vid, TAPIR, BootsTAP, TAPNext, TAPNext++]
hook: Pick any pixel in a video and it follows that exact point to the end — even through occlusion.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0183
image: assets/IMG_0183.jpg
thumb: assets/thumbs/IMG_0183.jpg
added: 2026-10-03
status: verified
related: [glowjam-depth-relight]
---

## What it is

DeepMind's repo for the "Tracking Any Point" family: the TAP-Vid benchmark plus the TAPIR, BootsTAP and TAPNext trackers. The reel features the newest tracker, TAPNext++. You give it query points (x, y, frame) and it returns each point's trajectory and visibility in every frame.

## How it works

- **TAPIR:** per-frame matching of the query feature against every frame to get a rough track, then iterative temporal refinement using local correlations. Online (causal) variants exist for live streams.
- **TAPNext:** treats tracking as next-token prediction over video frames, which keeps it causal and lets it run frame by frame.
- Outputs are per-point (x, y) tracks plus an occlusion flag, so you can draw trails, dot grids or attach graphics.

## Ideas for us

- **reels-content:** "data-viz on footage" overlays: dense rainbow dot grids that ride on a dancer, horse or crowd (the cheetah and octopus shots in the reel).
- Track points on event footage to pin labels or particles onto performers in post, without manual rotoscoping.
- Possible live use: an online TAPIR on a GPU box sends tracks to TouchDesigner over OSC. Check latency first.

## Notes

- GPU recommended; Colab notebooks are in the repo.
- Credit the footage separately from the code (the reel credits each Wikimedia clip).
