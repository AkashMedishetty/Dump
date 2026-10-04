---
id: hairline
title: Hairline — isometric line figures that answer the pointer (+ a skill to draw new ones)
kind: library
url: https://github.com/lucasmarkes/hairline
demo: https://hairline.lucasmarkes.com
author: Lucas Marques (lucasmarkes)
license: MIT
license_notes: Library and the hairline-create skill are both MIT, so client and commercial use are fine; keep the copyright notice.
pin: c3692e0c797956268847d843949f79714b6f7a41
category: [web-animation, agent-skills]
tags: [isometric, line-art, svg, interactive, pointer, hover, springs, react, shadcn, claude-code-skill, illustration, zero-dependency]
stack: [TypeScript, SVG, React]
runs_in: [browser, claude-code]
fit: [client-pitches, social-ops, reels-content, touchdesigner]
aliases: [hairline-create, "@lucasmarkes/hairline", isometric line figures, npx skills add lucasmarkes/hairline]
hook: Nineteen elegant isometric line drawings (a laptop, a vault, a turntable…) that react to the mouse, plus a Claude skill that draws new ones from a one-line idea.
source: Instagram reel (tech-explainer creator; handle not visible in the screenshot)
source_ref: IMG_hairline-reel (Instagram reel, Oct 2026)
image: assets/IMG_hairline-reel.jpg
thumb: assets/thumbs/hairline.jpg
added: 2026-10-04
status: verified
related: [claudedesignskills, anthropic-skills, gsap, roughjs, rive]
---

## What it is

A small zero-dependency library of 19 isometric line figures drawn in thin strokes: a tray of cards, a field of pillars, a laptop, a phone in layers, a vault, a turntable and more. Each one reacts to the mouse: pillars rise under the pointer, a laptop lid opens with the pointer's height, a vault dial turns. It works in React (`<Terrain />`) or any web page (`terrain(element)`). It also ships a Claude Code skill, `hairline-create`: give it an idea ("a sales funnel") and it designs a new figure in the same style as one self-contained HTML file.

## How it works

- **Drawing:** a tiny isometric projection kernel draws rounded solids as SVG strokes. Plates are filled with the background colour so near objects hide far ones; there are no colours, glows or shadows. The only highlight is one stroke switching from grey to bright.
- **Motion:** two clocks. Picking an item uses a 700 ms ease-out tween; following the pointer uses a spring (k 100, c 18). Motion staggers outward from the pointer by distance (30–60 ms per step), and every figure has a designed rest pose, never flat.
- **Performance:** all figures share one `requestAnimationFrame` loop that sleeps off-screen and when nothing moves; reduced motion is respected.
- **Options:** `intensity` (0–1), `theme` (auto/light/dark), `label` and `onRead`. Six CSS custom properties re-colour it.
- **Skill** (`npx skills add lucasmarkes/hairline`, then `/hairline-create <idea>`): it offers 2–3 concepts, writes one figure file against a fixed kernel, then checks it against ten written rules. A Playwright script takes eight test pictures on one sheet and the agent answers twelve questions about them before handing over. The ten rules are a great motion-design checklist in their own right.

## Ideas for us

- **Client pitches and proposals:** one figure per service on our website or pitch pages. For example, a stage rising for event management, a laptop for websites and apps, a "turntable" of venue blocks for MICE. Restrained, Apple-like, and it reacts as clients scroll.
- **PurpleHat brand system:** recolour it to our palette (`--hairline-hi` lavender, plate = brand ink) and ask the skill for custom figures: a cap whose four panels lift apart on hover, a run-of-show timeline, a truss rig.
- **Event screens and kiosks:** a pointer-reactive figure on a touch kiosk at registration desks. Map touch or a tracked hand position to the "pointer"; it's just SVG, so it works in any browser screen.
- **Reels:** screen-record the figures for clean tech B-roll in explainer reels; the "pull a layer apart" figures (Exploded, Phone) suit "how we build it" content.
- **TouchDesigner:** render a figure in a Web Render TOP and drive it with OSC-fed positions.

## Notes

- **Verified 2026-10-04:** read the README, LICENSE (MIT, © 2026 Lucas Marques), CHANGELOG (v0.2.0, 2026-10-03, added 13 figures) and `skills/hairline-create/SKILL.md` and `rules.md`. Pinned `main` at `c3692e0` (2026-10-03). Stars were not checked (GitHub API not available in this session).
- The reel shows the site's Skill page with `npx skills add lucasmarkes/hairline`, which matches the README.
- It's a style with strong opinions (monochrome strokes only). Brand colour comes in through the CSS variables, not fills.
- Not tried by us yet.
