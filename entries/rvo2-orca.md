---
id: rvo2-orca
title: RVO2 — ORCA collision avoidance for crowds
kind: library
url: https://github.com/snape/RVO2
demo: https://gamma.cs.unc.edu/RVO2/
author: Jur van den Berg, Stephen J. Guy, Jamie Snape, Ming C. Lin, Dinesh Manocha — UNC Chapel Hill
license: Apache-2.0
license_notes: Code Apache-2.0. README excerpts in the reel were UNC, CC BY-SA 4.0.
pin: 75822bba14462c2e872ca96423825017ecd24764
category: [crowds-agents, simulation-physics]
tags: [crowd-simulation, collision-avoidance, multi-agent, steering, swarm, navigation]
stack: [C++]
runs_in: [desktop]
fit: [living-swarm, memory-mosaic, living-floor]
aliases: [ORCA, Optimal Reciprocal Collision Avoidance, Reciprocal Velocity Obstacles, RVO, RVO2-3D, Python-RVO2]
hook: 250 agents cross a circle at the same time and nobody collides.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0185
image: assets/IMG_0185.jpg
thumb: assets/thumbs/IMG_0185.jpg
added: 2026-10-03
status: verified
related: [fullik-fabrik-ik, box2d]
---

## What it is

A reference implementation of ORCA, the standard algorithm for many agents moving to goals without colliding. The classic demo puts 250 agents on a circle and sends each to the opposite side; they swirl through the centre without touching.

## How it works

- Every agent has a position, radius, max speed and a **preferred velocity** (straight to its goal).
- For each nearby neighbour, ORCA builds a **half-plane of allowed velocities** that guarantees no collision within a time horizon τ, with each agent taking *half* the responsibility (reciprocity, which prevents oscillation).
- Each agent solves a tiny 2D linear program: the velocity closest to its preferred velocity that satisfies all the half-planes. If none is feasible, it takes the least-bad one.
- A k-d tree finds neighbours, so it scales to thousands of agents.

## Ideas for us

- **living-swarm:** creatures that flow around visitors (visitors become static or slow ORCA obstacles) and never clip through each other.
- **memory-mosaic alternative reveal:** each guest becomes a coloured agent whose goal is a pixel of the target image. The crowd assembles the picture without overlaps (the post's own question: give each agent a colour and destination).
- **living-floor:** avoid-the-feet particles.

## Notes

- Ports: RVO2-3D (C++), Python-RVO2 (Cython), RVO2-CS (C#/Unity), several JS ports. The core is small enough to port to a GLSL/compute pass with a grid neighbour search.
