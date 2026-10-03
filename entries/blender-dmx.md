---
id: blender-dmx
title: BlenderDMX — design and render stage lighting in Blender
kind: tool
url: https://github.com/open-stage/blender-dmx
demo: https://blenderdmx.eu
author: open-stage (Hugo Aboud, vanous & contributors)
license: GPL-3.0
license_notes:
pin: 8a6076d8509c2eda16eb022894617302ff621049
category: [stage-production, fractals-3d]
tags: [blender, dmx, gdtf, mvr, lighting-previz, art-net, sacn, osc, psn, renders]
stack: [Python, Blender]
runs_in: [desktop]
fit: [event-stages, reels-content, client-pitches, synesthetic-room]
aliases: [Blender DMX, blenderdmx.eu]
hook: A free lighting visualiser inside Blender: import GDTF fixtures and MVR rigs, drive them by DMX (Art-Net/sACN) or keyframes, render pitch-quality stage images.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [gdtf-mvr, perastage, blender-mcp, qlcplus]
---

## What it is

A Blender add-on (4.2+, tested to 5.0, available as an Extension) for lighting designers. Fixtures come from GDTF Share; MVR scenes import and export via pymvr. It can be driven live from a console or software over DMX networks and OSC/PSN (per its website), or animated in Blender.

## Ideas for us

- **client-pitches:** photoreal stage concept renders (Cycles/Eevee) with real fixture models before a show is sold.
- Combine with Blender MCP so Claude can lay out truss, fixtures and looks from a brief.
- Preview programmed looks from QLC+ in the 3D venue.

## Notes

README read 2026-10-03. Docs/FAQ at blenderdmx.eu.
