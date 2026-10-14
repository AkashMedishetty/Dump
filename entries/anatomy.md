---
id: anatomy
title: Anatomy — Claude skill that explains an idea by building it as a working isometric machine
kind: skill
url: https://github.com/wheresryan22/anatomy
demo: https://skills.wheresryan.sh/anatomy
author: Ryan (wheresryan22)
license: MIT
license_notes: Skill, kit and examples are MIT (© 2026 Ryan). The examples depict real products (e.g. a Raptor 2 engine); keep client figures to our own objects or generic machines.
pin: e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f
category: [agent-skills, web-animation]
tags: [isometric, interactive, explainer, svg, webgl, shader, 3d, claude-code-skill, react, technical-illustration, exploded-view, zero-dependency]
stack: [JavaScript, TypeScript, SVG, WebGL, React]
runs_in: [claude-code, browser, node]
fit: [client-pitches, event-stages, reels-content, social-ops]
aliases: [/anatomy, "npx skills add wheresryan22/anatomy", isometric explainer, anatomy skill, ox8erlin]
hook: Ask Claude to explain something and it invents a physical machine whose working IS the idea, then draws it as a precise interactive isometric figure you can hover apart.
source: Instagram @ox8erlin (reel offering the repo via an "anatomy" comment)
source_ref: IMG_anatomy-reel (Instagram reel, Oct 2026)
image: assets/IMG_anatomy-reel.jpg
thumb: assets/thumbs/anatomy.jpg
added: 2026-10-14
status: verified
related: [hairline, claudedesignskills, anthropic-skills, code-rendered-motion-video]
---

## What it is

A Claude Code skill (it also works in OpenCode, Codex and Antigravity) that turns an explanation into a working object. Ask it to explain a token-bucket rate limiter and it might invent a machine of coins and a hopper. A cache key becomes a pin-tumbler lock that only turns when every pin matches. It then builds that object from dozens of small, shaded isometric parts in a framed card, with a title, a hint and a live readout. The figure moves calmly under the pointer and keyboard; hover a Raptor engine and it comes apart into 11 assemblies. Output is a standalone HTML page, a single SVG, or React/Next.js components.

## How it works

- **Workflow in `SKILL.md`:** collect the true numbers, invent the object, write a parts list, plan the scene, build the geometry once with the kit, paint back to front, frame it, make it move, then verify like a critic.
- **Kit (`kit/`, zero dependencies):** an isometric camera, solids with four-tone shading, a parts library, lathe (round parts), tubes and cables, and a card and page wrapper. Every number shown comes from the same small model that moves the parts.
- **Three figure kinds:**
  - **SVG** (the core).
  - **SVG + WebGL:** a shader canvas sits between a back and a front SVG in the same camera, for fire, exhaust, water, caustics, glow and steam.
  - **3D (beta):** moving parts are re-projected and re-shaded each frame (dials, fingers, falling pieces).
- **Verification:**
  - `kit/audit.mjs` proves that nothing passes through anything, every end sits on a mount, and the depth order is right.
  - Headless-Chrome scripts take screenshots, close-ups and slowed contact sheets, and reject lines that end in mid-air.
  - The skill tells Claude to read every PNG it makes.
- **Examples (built pages committed):** a dial indicator (about 300 lines), a 1984 desk computer you can type on, an arcade cabinet (240 solids), a Raptor engine test stand, a ripple tank with WebGL caustics, a turning dial in 3D, and two React production figures.
- **Install:** `npx skills add wheresryan22/anatomy -g -a claude-code`, then `/anatomy explain how … works, interactive`.

## Ideas for us

- **Pitch decks and proposals (client-pitches):** explain how an installation works as a machine. The Living Floor's sensor grid, Collective Heartbeat's pulse-to-light chain, or the PhotoBooth print pipeline become interactive exploded views on a proposal page, instead of a flowchart.
- **Event stages (event-stages):** isometric "how the stage is built" figures, with a truss, LED wall, hoists and a FOH desk that come apart on hover. These suit production meetings and client walk-throughs.
- **Reels and social:** screen-record a figure coming apart as a clean, premium explainer clip. It's the restrained, Apple-like look Akash has asked for, not glowing AI shapes.
- **PurpleHat website:** one figure per service. With its sister library Hairline (which we already have), it gives a coherent line-art language.
- **Our own brand:** try `/anatomy` on the PurpleHat cap: four panels on a crown frame that lift apart on hover, with a readout showing panel count and seams.

## Notes

- **Verified 2026-10-14:** read the README, LICENSE (MIT), CHANGELOG (v1.1.0 released 2026-10-12, Antigravity support in Unreleased) and the repo layout. Pinned `main` at `e6600ff` (2026-10-13). The reel showed about 7.0k stars and 502 forks; not checked via the API (not available in this session).
- The thumbnail is the repo's own README image of the Raptor 2 example (MIT), not the reel. The reel screenshot stays local.
- **Limits (from the README):** it isn't a chart library, and it draws machines, instruments, tools and furniture, not people or exact maps. Ideas with no mechanism come out weaker.
- It needs Node 20.10+ and Chrome or Chromium for the self-checks. The skills CLI copies about 10 MB, examples included.
- The reel gated the link behind "comment anatomy"; the repo is public, so that isn't needed.
- Not tried by us yet.
