---
id: fullik-fabrik-ik
title: fullik — FABRIK inverse kinematics (JS)
kind: library
url: https://github.com/lo-th/fullik
demo:
author: lo-th
license: MIT
license_notes: JS port of Caliko (Java, MIT, FedUni). Algorithm from Aristidou & Lasenby 2011.
pin: 3f22da98a0fa0051416b20077af5142aec3dfc2e
category: [animation-rigging, geometry-algorithms]
tags: [inverse-kinematics, fabrik, procedural-animation, tentacles, robot-arm, creatures, threejs]
stack: [JavaScript, three.js]
runs_in: [browser]
fit: [avatar-arcade, living-swarm, touchdesigner]
aliases: [FABRIK, Forward And Backward Reaching Inverse Kinematics, Caliko, IK solver]
hook: Chains of bones that reach for a target — creatures, robot arms and lines that follow your hand.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0181
image: assets/IMG_0181.jpg
thumb: assets/thumbs/IMG_0181.jpg
added: 2026-10-03
status: verified
related: [rvo2-orca, ten-minute-physics]
---

## What it is

A JavaScript (three.js) port of the Caliko FABRIK library: 2D and 3D inverse-kinematics chains with joint constraints, multiple connected chains, and fixed or free bases. It lets any chain of segments point its tip at a target without matrices or Jacobians.

## How it works

FABRIK (Aristidou & Lasenby, *Graphical Models* 73(5), 2011) is iterative and purely positional:

1. **Backward pass:** snap the end effector onto the target, then walk back towards the root, placing each joint on the line to the next joint at exactly its bone length.
2. **Forward pass:** pin the root back to its base and walk outwards again, re-applying bone lengths.
3. Repeat until the tip is within tolerance (usually a few iterations). Joint constraints (hinge/cone limits) are applied by projecting each bone back into its allowed range during the passes.

It is cheap enough to run hundreds of chains per frame.

## Ideas for us

- **avatar-arcade:** drive avatar limbs from tracked hand or pose keypoints so arms bend naturally.
- **living-swarm:** creatures with IK tentacles or legs that reach for the nearest visitor.
- "Lines that follow your hand": many short chains rooted on a wall edge, all targeting the tracked hand position (the post's "creatures, robot arms, line drawings that follow a hand").
- TouchDesigner: the algorithm is ~40 lines, so it is easy to port into a Script CHOP or GLSL.

## Notes

- Paper: Aristidou, A. & Lasenby, J. (2011) *FABRIK: A fast, iterative solver for the Inverse Kinematics problem*.
- Java original: https://github.com/FedUni/caliko (pin 478786d670f0f1b77461dc1dfc8710b2bc498b2c).
