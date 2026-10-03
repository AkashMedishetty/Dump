---
id: tileable-volume-noise
title: TileableVolumeNoise — 3D noise for volumetric clouds
kind: library
url: https://github.com/sebh/TileableVolumeNoise
demo:
author: Sébastien Hillaire (with weirdfoo)
license: MIT
license_notes: Worley function credited to Marc-Andre Loyer in code. The cloud raymarcher in the reel was by Xity, not part of the repo.
pin: 1f879a26b89aaa4b5a7f112f14ec149d08057661
category: [noise-shaders]
tags: [clouds, volumetric, raymarching, perlin-worley, worley, 3d-texture, frostbite, sky]
stack: [C++]
runs_in: [desktop, gpu]
fit: [synesthetic-room, touchdesigner, reels-content]
aliases: [Perlin-Worley noise, Frostbite clouds, Physically Based Sky Atmosphere and Cloud Rendering, Nubis]
hook: The noise textures behind Frostbite's sky and cloud talk — tileable 3D noise you raymarch into clouds.
source: Instagram @index.opensource (curated by @hyun2xyz)
source_ref: IMG_0188
image: assets/IMG_0188.jpg
thumb: assets/thumbs/IMG_0188.jpg
added: 2026-10-03
status: verified
related: [webgl-fluid-simulation, mandelbulber2]
---

## What it is

A small C++ collection of functions that generate **tileable** 3D noise volumes (Perlin, Worley/cellular, and Perlin-Worley). It is the code from the Frostbite team's SIGGRAPH 2016 talk *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite*.

## How it works

- **Tileable:** the noise wraps at the volume borders, so a 128³ texture repeats seamlessly across the sky.
- **Shape texture (≈128³ RGBA):** R = Perlin-Worley (billowy, connected), G/B/A = Worley FBM at increasing frequencies.
- **Detail texture (≈32³):** higher-frequency Worley that erodes the cloud edges.
- At render time, a raymarcher samples density = remap(shape, detail erosion, coverage and height gradient), then applies Beer-Lambert absorption plus a phase function for silver linings. This is the same recipe as Guerrilla's Horizon Zero Dawn clouds.

## Ideas for us

- **synesthetic-room:** a raymarched cloud ceiling; crowd energy raises coverage and storminess, and quiet thins it to wisps.
- TouchDesigner: bake the volumes once to a 3D texture (Texture 3D TOP), then raymarch in a GLSL TOP.
- Slow-motion cloud plates for reels.

## Notes

Generate offline (C++), save as a texture, then load it anywhere. The generation step doesn't need to run live.
