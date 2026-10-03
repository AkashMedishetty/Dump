---
id: shapeshifter
title: Shape Shifter — SVG path-morphing icon animation tool
kind: tool
url: https://github.com/alexjlockwood/ShapeShifter
demo: https://shapeshifter.design
author: Alex Lockwood
license: Apache-2.0
license_notes:
pin: 0fe06cfd7a37b45e4b548ef806a1d40fd67a7a61
category: [web-animation]
tags: [path-morphing, svg, icon-animation, animated-vector-drawable, android, spritesheet, shape-morph]
stack: [TypeScript, Angular]
runs_in: [browser]
fit: [client-pitches, reels-content, mural-wall]
aliases: [ShapeShifter, shapeshift, AnimatedVectorDrawable, path morph]
hook: Morph one SVG shape into another cleanly — it makes two paths "compatible" (same points and commands) and exports SVG, spritesheets or Android animations.
source: User shared name, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [gsap, lottie-web, anime-js]
---

## What it is

A web app (about 4k stars, actively maintained, created 2016) for building icon animations, especially **path morphs** (play to pause, menu to back arrow, logo to logo). It exports standalone SVGs, SVG spritesheets, and Android `AnimatedVectorDrawable`.

## How it works

To morph shape A into shape B, both SVG paths must have the **same number and type of drawing commands** in a matching order. Design tools hide this, so Shape Shifter lets you:
- add or remove points without changing a path's look, and drag them along the path;
- reverse or shift the start point and split subpaths so the points pair up sensibly;
- auto-fix paths to be compatible, then preview the in-between states on a timeline;
- convert unsupported primitives (circles, etc.) into curve commands.

The same logic underlies GSAP MorphSVG and flubber-style interpolation.

## Ideas for us

- Brand logo morphs for event intros and reels (client logo → CTX mark → event title).
- Morphing icons in our phone-side join and conduct UIs.
- **mural-wall:** morph a guest's simplified doodle outline into a target shape.

## Notes

README read 2026-10-03. Other repos named "shapeshift" that are *not* this: anishfn/shapeshift (a text input that morphs into UI), shapeshift/web (crypto exchange), jquery.shapeshift (a draggable grid).
