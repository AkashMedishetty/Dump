---
id: animation-pipeline-riso
title: animation-pipeline — code-made music videos in riso cut-paper style
kind: repo
url: https://github.com/bishpls/animation-pipeline
demo:
author: bishpls
license: none (all rights reserved)
license_notes: No LICENSE file. Third film is an unofficial Clawd fan work.
pin: 73acbef6713d80f10ddf8d8f401a7a47b4f1a0cb
category: [motion-video, noise-shaders]
tags: [paper-cut, riso, halftone, saul-bass, title-sequence, kinetic-type, letterpress, elevenlabs-music, subagents, webgl-shader]
stack: [JavaScript, WebGL, GLSL]
runs_in: [browser, node]
fit: [reels-content]
aliases: [OPEN ALL NIGHT, WORDS ARE FOSSILS, HELLO, WORLD!]
hook: Films where a WebGL shader prints every frame as mid-century cut paper on four riso inks — misregistration, halftones, paper grain.
source: GitHub search for paper-cut animation, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [paper-cut-animation, functional-emotions-video, pdoom-video]
---

## What it is

A base for making films with Claude Code, with three finished works.
- *OPEN ALL NIGHT*: a 93 s cut-paper title sequence in the style of Saul Bass / *Catch Me If You Can*, on four riso inks.
- *WORDS ARE FOSSILS*: 86 s vertical, letterpress look.
- *HELLO, WORLD!*: a J-pop style piece.

## How it works

- **Picture:** riso simulation in a shader. Blue, fluorescent pink, yellow and black inks with overprint multiply, halftone tints, misregistration, ink mottling and paper grain. "Light is paper": lit windows and neon are knockouts.
- **Type:** variable-font glyph outlines (fontkit) animated per glyph.
- **Sound:** sign clicks and hum are synthesised from the same schedule the picture draws.
- **Song:** ElevenLabs Music. The best of seven takes was chosen by beat-grid fit, seam analysis, speech-to-text intelligibility and blind Gemini rankings (Borda count). Word timestamps print lyrics on their sung syllable.
- **Process:** storyboard → slate animatic → five parallel sub-agents against one craft guide → review passes (contact sheets, strips, crops, seam checks).

## Ideas for us

- The riso overprint shader is a strong, cheap house look for event posters that animate into reels.

## Notes

README read 2026-10-03.
