---
id: hyperframes
title: HyperFrames — write HTML, render video (HeyGen)
kind: tool
url: https://github.com/heygen-com/hyperframes
demo: https://hyperframes.heygen.com/showcase
author: HeyGen
license: Apache-2.0
license_notes:
pin: 8c00ebad80c634f607e3a5283f8a0aa73e35f1dd
category: [motion-video, agent-skills]
tags: [html-to-video, deterministic-rendering, gsap, lottie, threejs, animejs, waapi, captions, tts, claude-code-plugin, cloud-render, lambda]
stack: [TypeScript, HTML, Node.js]
runs_in: [node, cli, claude-code, cloud]
fit: [reels-content, client-pitches, social-ops]
aliases: [HyperFrames CLI, hyperframes skills, /hyperframes, HeyGen HyperFrames]
hook: The most-used open framework for agent-made video — HTML, CSS and seekable animations in, deterministic MP4 out, with 21 agent skills.
source: skillry.dev Opus 5.5 gallery (shared by user, 2026-10-03)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [hyperframes-community-skills, remotion, agentic-motion-graphics, code-rendered-motion-video, openmontage, reelmimic, lemo-opuscar, onetake]
---

## What it is

An open-source framework (about 56k stars on 2026-10-03, 60.6k by 2026-10-14) for turning HTML, CSS, media and seekable animations into deterministic MP4s. You can run it from its CLI, from coding agents through its skills, or as the rendering core of hosted tools. Most of the Opus 5.5 videos in the skillry gallery list it in their stack.

## How it works

- **The composition contract** (`/hyperframes-core`): `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, determinism rules.
- **Animation adapters:** GSAP, Lottie, Three.js, Anime.js, CSS, WAAPI and TypeGPU, all driven seek-safe.
- **CLI loop:** `init` → `lint` → `check` → `snapshot` → `preview` → `render`, plus `cloud render` (HeyGen-hosted) and `lambda deploy/render` (AWS).
- **21 published skills.** The `/hyperframes` router picks a workflow:
  - `/product-launch-video` (from a URL)
  - `/faceless-explainer`
  - `/pr-to-video` (from a GitHub PR)
  - `/embedded-captions`
  - `/talking-head-recut`
  - `/motion-graphics` (under 10 s, can be a transparent overlay)
  - `/music-to-video` (beat-synced)
  - `/slideshow`
  - `/general-video`
  - `/remotion-to-hyperframes`
- **Domain skills:**
  - `/media-use`: BGM, SFX, images, icons, voice, LUTs; generates when the catalog misses.
  - `/hyperframes-audio`: voice carve, EQ/compression, automation, buses.
  - `/hyperframes-registry`: ready-made blocks and transitions.
  - `/figma`: import from Figma.

```bash
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
# or standalone core skills:
npx hyperframes skills update
```

## Ideas for us

- **reels-content:** `/music-to-video` with installation footage plus a track gives beat-synced promo cuts. `/embedded-captions` handles talking-head recaps from events.
- **client-pitches:** `/product-launch-video` pointed at a client's site gives an on-brand teaser in minutes.
- A natural engine for a CTX reel template: our `seek(t)` scenes become HyperFrames compositions.

## Notes

Verified 2026-10-03 against the README and skill tree. Requires Node ≥ 22. The `skills add` registry can lag `main`; use `npx hyperframes skills update` for the newest copies.

- **Re-seen 2026-10-14** as #1 in a "top 5 video skills" reel (Web Lab · AI Tools), next to onetake, gbro-collage-broll, ClaudeAnimationBase and Lemo-Opuscar. Re-pinned `main` at `8c00eba`; the reel showed 60.6k stars and 5.4k forks. ReelMimic and OpenMontage both build on it.
