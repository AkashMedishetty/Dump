---
id: onetake
title: onetake — one-take motion films where every beat grows out of the last
kind: skill
url: https://github.com/feitangyuan/onetake
demo: https://onetakemotion.com
author: Patrick (feitangyuan, @paojiaofty)
license: PolyForm Noncommercial 1.0.0
license_notes: NOT open source for business use. "Free for noncommercial use only" (PolyForm Noncommercial 1.0.0). PurpleHat client or brand work is commercial, so don't run it for paid work without a commercial licence ("onetake Pro" via onetakemotion.com). The film source code isn't included in the cases. Learning the technique is fine; reuse of its code for commercial work is not.
pin: 415758128aa45cc54340df40d8109363447f582e
category: [motion-video, agent-skills]
tags: [one-take, continuity, carry, launch-video, product-film, feature-demo, camera, motion-blur, deterministic-rendering, oracle, ui-rebuild, foley]
stack: [JavaScript, Python, Canvas]
runs_in: [claude-code, browser, python]
fit: [client-pitches, reels-content]
aliases: [ohmymotion, onetake Pro, one continuous take, carry score]
hook: Launch films with no cuts. At every boundary something on screen survives and becomes the next beat, and a measuring "oracle" fails any film that reads like a slideshow.
source: Instagram reel "Web Lab · AI Tools" (top-5 video skills, #2)
source_ref: IMG_onetake-reel (Instagram reel, Oct 2026)
image: assets/IMG_onetake-reel.jpg
thumb: assets/thumbs/onetake.jpg
added: 2026-10-14
status: verified
related: [hyperframes, code-rendered-motion-video, claude-opus-video-motion-blur, lemo-opuscar]
---

## What it is

A Claude agent skill for product launch films, teasers and feature demos made as **one continuous take**. Nothing *replaces* the previous shot. A prompt bar opens into the app window, the window reflows into the phone, a bar collapses into a line that shoots across and becomes the next film's grid. It ships 11 case films with breakdowns (concept, beat sheet, numbers, what was rejected and why), but not their source.

## How it works

- **The boundary is the design unit.** At every beat change, name what carries across and how it transforms (opens into, collapses into, pushes through, folds into the lockup).
- **One camera, never a cut:**
  - It leads the subject by a beat, whips to where the next thing lands, and floats like a hand-held operator.
  - It shakes on impact, then holds dead still, because rests make the moves land.
- **Continuity oracle:** `probe.py` records what's on screen each frame, finds the boundaries and scores what carried. Their own examples went from 0.00 (perfect rhythm, still a slideshow, rejected) to 0.75 and 0.83 (accepted). The oracle also fails uniform shot lengths, no stillness, clipped audio, fast moves without motion blur, and subjects leaving the frame.
- **Finish:**
  - The product UI is rebuilt in HTML on the camera's plane, so the camera can fly into it at any zoom.
  - About 38 measured moves, each a pure function of time.
  - Real motion blur: captures across a 180° shutter, averaged in linear light.
  - Foley placed from the film's own events, in one reverb, ducking the music.
  - Deterministic seek. Drafts at 1080p30, finals at 4K60.

## Ideas for us

- **Steal the rule, not the code:** "something must carry across every boundary" is exactly what our animatic lacked. Apply the carry test to our own HyperFrames and Anatomy reels, for example a cap panel that becomes the stage truss that becomes the LED wall.
- **The motion-blur method** (shutter captures averaged) matches what we already do in our renders; keep it.
- **Client launch films** (an app or installation reveal): only with a commercial licence from the author. Otherwise build the same idea with HyperFrames (Apache-2.0).

## Notes

- **Verified 2026-10-14:** read the README (English) and LICENSE (PolyForm Noncommercial 1.0.0 with "free for noncommercial use only"), and listed `cases/`, `gallery/` and `looks/`. Pinned `main` at `4157581` (2026-10-12). The reel showed about 2.1k stars and 133 forks; not checked via the API.
- **Licence red flag:** of the five tools in this reel, this is the only one we can't use for paid work as-is.
- The thumbnail is a crop of the reel screenshot (the GitHub page only). No repo media is copied because of the non-commercial licence.
- Not tried by us yet.
