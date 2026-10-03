---
id: opus-video-skills
title: opus-video-skills — one Claude skill per video style (painted, kinetic reel)
kind: skill
url: https://github.com/tuzhechen2005/opus-video-skills
demo:
author: tuzhechen2005
license: custom / not stated (NOASSERTION)
license_notes: GitHub cannot identify the license; read the LICENSE file before reuse.
pin: 59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1
category: [agent-skills, motion-video]
tags: [painted-animation, watercolor, kinetic-typography, showreel, karaoke-lyrics, p5-brush, threejs, procedural-music, claude-code-plugin]
stack: [JavaScript, p5.js, three.js, Python]
runs_in: [claude-code, node]
fit: [reels-content, client-pitches]
aliases: [painted-animation skill, kinetic-reel skill]
hook: Installable Claude Code skills for two complete video styles — watercolour cartoon with character acting, and a kinetic-type portfolio reel — no generative models.
source: Found alongside claude-paint (GitHub search), 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [claude-animation-base, opus-js-animations, p5-brush, claude-opus-video-motion-blur]
---

## What it is

Each skill teaches Opus 5.5 to make a whole video in one style, covering storyboard, animation, review, music and encode. All imagery and music are procedural code; frames are pure functions of time, rendered in headless Chrome and encoded with ffmpeg.
- **painted-animation:** p5.js + p5.brush watercolour and ink cartoon with an expression and acting library. Music videos are cut to the measured beat, and lyric videos get word-by-word karaoke subtitles.
- **kinetic-reel:** condensed display type plus HUD micro-type over three.js layers (particle terrain, liquid marble, chrome knot, a particle cloud that condenses into a shape), with shape-continuity transitions and a score synthesised from the same timeline.

## How it works

```
/plugin marketplace add tuzhechen2005/opus-video-skills
/plugin install painted-animation@opus-video-skills
/plugin install kinetic-reel@opus-video-skills
```
Then, for example: "Make a 60-second kinetic-type reel of my three projects from this résumé." Requires Node, Chrome and ffmpeg (and Python + numpy for tempo detection).

## Ideas for us

- **kinetic-reel** is close to a CTX portfolio/showreel out of the box: feed it our installation list.
- Its "new style = new skill folder + template + example" contract is a good pattern for a CTX house-style skill.

## Notes

README read 2026-10-03. Very new (created 2026-09-26).
