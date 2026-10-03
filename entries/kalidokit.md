---
id: kalidokit
title: Kalidokit — face, pose and hand tracking to avatar rigs
kind: library
url: https://github.com/yeemachine/kalidokit
demo:
author: yeemachine
license: MIT
license_notes:
pin:
category: [animation-rigging, computer-vision]
tags: [vtuber, mediapipe, face-tracking, pose, blendshapes, vrm, live2d, webcam]
stack: [TypeScript]
runs_in: [browser]
fit: [avatar-arcade, living-swarm]
aliases: [VTuber rig, mediapipe to vrm]
hook: Turns MediaPipe face, pose and hand landmarks into rig rotations and blendshapes for VRM and Live2D avatars — webcam VTubing in the browser.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [three-vrm, pixi-live2d-display, fullik-fabrik-ik]
---

## What it is

A small calculator library: feed it MediaPipe or TF.js landmarks and get back bone rotations (`Pose.solve`, `Hand.solve`) and face blendshapes (`Face.solve`: eye blink, mouth shapes, head rotation). Apply them to a three-vrm model or a Live2D model.

## Ideas for us

- **avatar-arcade:** guests puppet an anime-style VRM avatar on the big screen with just a webcam, no suits or markers.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
