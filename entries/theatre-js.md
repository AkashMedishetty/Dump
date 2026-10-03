---
id: theatre-js
title: Theatre.js — motion design editor for the web
kind: library
url: https://github.com/theatre-js/theatre
demo:
author: Theatre.js
license: Apache-2.0
license_notes:
pin:
category: [web-animation, motion-video]
tags: [keyframe-editor, sequence-editor, threejs, r3f, cinematics, studio-ui]
stack: [TypeScript]
runs_in: [browser]
fit: [synesthetic-room, reels-content]
aliases: [@theatre/core, @theatre/studio, @theatre/r3f]
hook: An After-Effects-style keyframe editor that runs in your page, for choreographing three.js scenes and DOM by hand.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [gsap]
---

## What it is

A visual sequence editor (`@theatre/studio`) you mount on your own page. Keyframe any value (three.js objects via `@theatre/r3f`, DOM, custom props) with curves, then ship the saved state with `@theatre/core`. Sequences can be scrubbed and set to a position, which suits deterministic rendering.

## Ideas for us

- Hand-choreograph camera moves for 3D installation shows, then render frame-exact.

## Notes

Last push 2024-08, so development has slowed; still usable. Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
