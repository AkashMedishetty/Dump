---
id: trellis-image-to-3d
title: TRELLIS — image to 3D asset (Microsoft)
kind: library
url: https://github.com/microsoft/TRELLIS
demo:
author: Microsoft Research
license: MIT
license_notes:
pin:
category: [ai-video-generation, fractals-3d]
tags: [image-to-3d, text-to-3d, gaussian-splat, mesh, glb, asset-generation]
stack: [Python, PyTorch]
runs_in: [python, gpu]
fit: [avatar-arcade, living-swarm, touchdesigner]
aliases: [Structured 3D Latents, Hunyuan3D-2]
hook: One image in, a textured 3D asset out (mesh, Gaussian splats or radiance field) — fast character and prop creation.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [unirig, blender-mcp]
---

## What it is

Structured 3D latents (CVPR 2025 spotlight) decode to GLB meshes, 3D Gaussians or radiance fields from a single image or text prompt. **Alternative:** Tencent's Hunyuan3D-2 (https://github.com/Tencent-Hunyuan/Hunyuan3D-2, about 15k stars, Tencent community license) for high-res textured meshes.

## Ideas for us

- Guest drawing → 3D creature: sketch → (image model cleanup) → TRELLIS mesh → UniRig rig → swims in living-swarm.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
