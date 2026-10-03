---
id: jankscan
title: jankscan — find stutter in a rendered video before posting
kind: tool
url: https://github.com/stas4000/jankscan
demo:
author: stas4000
license: MIT
license_notes: One Python file, standard library plus the ffmpeg binary.
pin: 0a9f06c31b29552ae4aadff49030b58f8b826076
category: [motion-video]
tags: [qa, frame-analysis, stutter, ffmpeg, render-validation, ci]
stack: [Python]
runs_in: [cli, python]
fit: [reels-content, touchdesigner]
aliases: [render QA, stutter detection, dropped frame detection]
hook: Decodes the actual MP4 (not the source) and flags held, jumped and frozen frames — a CI gate for code-rendered video.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, claude-opus-video-motion-blur]
---

## What it is

A QA pass for rendered video. A stuttering file probes as healthy (duration, fps and codec all look fine), so jankscan decodes the frames themselves and reports:

- `held`: a frame repeated while its surroundings move (a dropped render).
- `jump`: a frame that moves about 2× as far as its neighbours (a skipped frame).
- `freeze`: the longest run of repeated frames during motion.

```bash
python3 jankscan.py video.mp4
python3 jankscan.py renders/        # every mp4/mov/webm/mkv in a folder
python3 jankscan.py video.mp4 --json
```

The exit code is 1 when any video stutters, so it works as a CI or render-script gate.

## How it works

ffmpeg decodes every frame to 64×36 grayscale with no frame-rate conversion. For each pair of frames, jankscan takes the mean absolute change and compares it with the median change of the 12 surrounding frames:
- near zero inside steady motion = held;
- 1.6×–2.8× = jump;
- more than that = a cut.

## Ideas for us

- Run it on every exported reel and on TouchDesigner screen captures from installations before posting.

## Notes

The author's own benchmark (40 real videos, one planted fault each) shows real limits. The guide didn't mention them:

- Found the planted **repeated** frame in 26 of 36 (72%).
- Found the planted **dropped** frame in 17 of 36 (47%).
- **Flagged 25 of the 40 untouched videos**: some real stutter, some legitimate jumps like counters or hard cuts.

Treat its output as timestamps to inspect, not a pass/fail verdict. It runs in about 2.6 s per video on one core. Verified 2026-10-03; very new (created 2026-09-25).
