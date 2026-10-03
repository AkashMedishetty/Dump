---
id: liveportrait
title: LivePortrait — bring a portrait to life from a driving video
kind: library
url: https://github.com/KlingAIResearch/LivePortrait
demo:
author: Kuaishou / Kling AI Research
license: see repo (code MIT; some dependencies non-commercial)
license_notes: GitHub reports a custom license; the face detector (InsightFace) models are non-commercial. Check before client use.
pin:
category: [ai-video-generation, animation-rigging]
tags: [portrait-animation, face-reenactment, expression-transfer, anime-portraits, animals, realtime]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [avatar-arcade, memory-mosaic, reels-content]
aliases: [Kling LivePortrait, face retargeting]
hook: Animate any still face — photo, painting, anime character, pet — with the expressions and head motion from a driving video, near real-time.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [kalidokit, comfyui]
---

## What it is

Implicit-keypoint based portrait animation with stitching and retargeting (eyes and lips) control. It runs fast enough for near-real-time use on a good GPU, and has an animals mode. Widely integrated into ComfyUI.

## Ideas for us

- **memory-mosaic finale:** selfies that blink and smile in unison.
- **avatar-arcade:** a guest's face drives a painted or anime character.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
