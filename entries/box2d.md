---
id: box2d
title: Box2D — 2D physics engine for games
kind: library
url: https://github.com/erincatto/box2d
demo: https://box2d.org/
author: Erin Catto
license: MIT
license_notes: Reel added its own pyramid + 20-level scene and paper-texture rendering on top.
pin: 956ce4e
category: [simulation-physics]
tags: [rigid-body, physics-engine, stacking, collisions, games, wasm]
stack: [C]
runs_in: [desktop, browser]
fit: [digital-doodles-wall, mural-wall, avatar-arcade, rhythm-battle]
aliases: [Box2D v3, Planck.js, box2d-wasm]
hook: The 2D physics engine for games — things fall, stack and crash, with very stable piles.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0194
image: assets/IMG_0194.jpg
thumb: assets/thumbs/IMG_0194.jpg
added: 2026-10-03
status: verified
related: [ten-minute-physics, rvo2-orca]
---

## What it is

The classic 2D rigid-body engine (behind Angry Birds, Limbo and countless others). Version 3 is a C rewrite with a "soft step" solver, SIMD and multithreading, so it can run very large stacks and piles stably.

## How it works

- Broad phase (dynamic AABB tree), then narrow-phase contact manifolds, then a constraint solver for contacts and joints (revolute, prismatic, weld, mouse, ...).
- v3's soft-step solver uses sub-stepping plus soft constraints, which keeps tall pyramids standing and avoids jitter.
- Bodies sleep when at rest, so big scenes stay cheap.

## Ideas for us

- **digital-doodles-wall:** submitted doodles become physical bodies that rain down, pile up and get knocked over.
- **avatar-arcade:** tracked silhouettes or hands as kinematic bodies batting objects around.
- **rhythm-battle:** each team's energy spawns blocks; the taller tower wins.

## Notes

Web: box2d3 WASM builds, or Planck.js (pure-JS v2 port). Matter.js is simpler but less stable for big stacks.
