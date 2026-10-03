---
id: paper-cut-animation
title: Paper-cut animation — how to get the cut-paper / diorama look in code
kind: technique
url:
demo:
author: Synthesis of the repos linked below
license: n/a (technique)
license_notes:
pin:
category: [motion-video, generative-art]
tags: [paper-cut, cut-paper, papercraft, diorama, stop-motion, collage, riso, halftone, paper-texture, parallax, paper-wipe]
stack: [JavaScript, Canvas, WebGL, GLSL]
runs_in: [browser, node]
fit: [reels-content, mural-wall, client-pitches, synesthetic-room]
aliases: [cut-out animation, papercut, kirigami look, paper collage, cardstock diorama, paper lightbox, 切り絵, 剪纸]
hook: Layered cardstock shapes with contact shadows, ragged cut edges, paper grain, held frames and paper-wipe cuts — a style code (or a video model) can hit reliably.
source: User request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [opus-js-animations, cardstock-diorama-myth, vox-editorial, animation-pipeline-riso, distilbook, hyperframes-community-skills, opentoonz, origami-simulator]
---

## What it is

Cut-paper animation looks like coloured paper shapes stacked in layers and moved under a camera, like stop-motion or a lit diorama. It's popular in reels, explainers and myth or folklore shorts, and has deep roots in Chinese paper-cutting (剪纸), Japanese kirie (切り絵) and Lotte Reiniger's silhouette films. It suits code well because every element is a flat shape.

## How it works

**Ingredients (each one is cheap):**
1. **Flat shapes, few colours:** a strict 3–5 colour palette, no gradients inside shapes (cardstock-diorama-myth enforces exactly three).
2. **Cut edges:** offset each path's outline with low-frequency noise so edges look scissored; add a 1–2 px lighter "core" edge where paper thickness shows.
3. **Depth = layers:** 4–8 planes with **soft contact shadows** (a blurred, offset, darkened copy of each layer onto the one below). Move the layers at different speeds for parallax, which reads as a diorama.
4. **Paper grain:** multiply a fibre texture or noise per layer; for print looks add **riso / halftone** (overprint multiply, misregistration, ink mottling) in a shader, as animation-pipeline does.
5. **Stop-motion timing:** hold poses "on twos" (12 fps steps inside a 24/30 fps film) and add tiny per-frame jitter in position and rotation. Smooth eases look wrong here.
6. **Transitions:** a paper sheet sliding over the frame (the "paper wipe") or a fold or tear. These also hide every cut.
7. **Lighting:** for "paper lightbox" scenes, light comes *through* the paper (backlit knockouts, glowing cut windows).
8. **Sound:** paper foley (rustle, slide, snip) sells it.

**Routes:**
- **Pure code:** opus-js-animations (its `styles.md` lists cut-paper stop-motion and paper lightbox; its *Shaml* demo is a medallion of 336 cut-paper pieces) or animation-pipeline (riso cut-paper shader).
- **Code + generated sprites:** vox-editorial (cut paper with scissored subjects, Python + ffmpeg) or vox-skill (paper collage in Remotion).
- **Generative video:** cardstock-diorama-myth (style key + Seedance clips + paper wipes).
- **No-code:** DistilBook's "cut paper collage" style, or the HyperFrames `vox-explainer` collage skill.
- **Hand animation:** OpenToonz plastic/cut-out rigging.

## Ideas for us

- **mural-wall:** guests' drawings are cut out (segmentation), given a paper edge and contact shadow, and dropped into a layered paper diorama that slowly parallaxes.
- **reels-content:** a CTX "paper" house style is cheap to keep consistent across many reels.
- **synesthetic-room:** a projected paper lightbox where crowd energy lights cut windows.

## Notes

Built from the READMEs of the linked repos (read 2026-10-03). Low-star paper-cut repos found but not added: Airpyk-98/epic-paper-cutout-animation (prompt system), cameronha/paper-collage-animation (Gemini + ffmpeg).
