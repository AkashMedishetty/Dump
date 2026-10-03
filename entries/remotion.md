---
id: remotion
title: Remotion — make videos programmatically with React
kind: library
url: https://github.com/remotion-dev/remotion
demo: https://www.remotion.dev
author: Remotion (Jonny Burger et al.)
license: Remotion License (source-available)
license_notes: Free for individuals and small companies; larger companies need a paid company license. Check remotion.dev/license before client work.
pin:
category: [motion-video]
tags: [react, video, programmatic-video, lambda, captions, player]
stack: [TypeScript, React]
runs_in: [node, cloud]
fit: [reels-content, client-pitches]
aliases: [Remotion Lambda, @remotion/player]
hook: The React way to make video — components plus useCurrentFrame(), rendered locally or on Lambda.
source: skillry.dev Opus 5.5 gallery (shared by user, 2026-10-03)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [remotion-agent-skills, hyperframes, openmontage, short-video-maker]
---

## What it is

A framework (about 62k stars) where a video is a React component tree. `useCurrentFrame()` and `interpolate()` drive everything, so frames are deterministic. It renders via headless Chrome + ffmpeg locally, on AWS Lambda, or plays live in `@remotion/player`.

## Ideas for us

- Our installation clients are already React; Remotion lets the same components become promo videos.
- Used inside OpenMontage and short-video-maker.

## Notes

Metadata checked 2026-10-03; README not reviewed. **License is not OSI.** Confirm our company tier before using it commercially.
