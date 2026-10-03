---
id: hyperframes-community-skills
title: HyperFrames community skills — ink films, 3D captions, paint-on
kind: skill
url: https://github.com/heygen-com/hyperframes-community-skills
demo:
author: HeyGen + community
license: Apache-2.0
license_notes: Community skills can run commands, call services or spend money; review each SKILL.md before installing (the repo itself warns about this).
pin:
category: [agent-skills, motion-video]
tags: [ink-animation, p5js, 3d-captions, paint-on, handwriting, strudel, music-visualizer, explainer, collage]
stack: [HTML, JavaScript, p5.js]
runs_in: [claude-code, node]
fit: [reels-content]
aliases: [p5-paint-animation, vox-explainer, camera-3d-captions, day-in-my-life, session-story, prod-by-claude]
hook: Eight one-off HyperFrames skills — hand-drawn ink films, paint-on animations, captions orbiting a speaker in 3D.
source: skillry.dev Opus 5.5 gallery (shared by user, 2026-10-03)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [hyperframes, p5-brush]
---

## What it is

Community-maintained skills for HyperFrames that are too specific for the curated set. Each one installs on its own.

## How it works

- `p5-paint-animation`: text, photos and short clips → deterministic p5.js handwriting, paint-on and "living painting" animations.
- `camera-3d-captions`: captions placed in 3D around a talking head, with a moving camera, hero words behind the speaker and a ring of words in front.
- `vox-explainer`: 60–90 s collage-style explainers from a topic, document or link.
- `day-in-my-life` / `session-story`: hand-drawn ink films made from your own Claude Code history.
- `prod-by-claude`: a Strudel live-coding track becomes a 1080² video where each code token lights up on its note.
- `duo` (foldable-phone comparison plates), `x-posting-license` (an animated ID card for an X profile).

```bash
npx skills add heygen-com/hyperframes-community-skills --list
npx skills add heygen-com/hyperframes-community-skills --skill p5-paint-animation
```

## Ideas for us

- `p5-paint-animation` for "living painting" reels of installation photos. It fits the ink and painterly direction (see shan-shui-inf).
- `camera-3d-captions` for speaker clips from events we run.

## Notes

Verified 2026-10-03 (README + skill list). The default branch is `master`.
