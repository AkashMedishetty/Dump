---
id: virtual-mapper
title: Virtual Mapper — preview projection mapping on a 3D stage
kind: tool
url: https://github.com/baku89/VirtualMapper
demo:
author: Baku Hashimoto
license: MIT
license_notes:
pin: 052239503681890e5c51ca805ab3f4f1ee922f6c
category: [stage-production]
tags: [projection-mapping, previz, syphon, spout, fbx, stage-model, openframeworks]
stack: [C++, openFrameworks]
runs_in: [desktop]
fit: [event-stages, touchdesigner, client-pitches]
aliases: [VirtualMapper]
hook: Load the stage as FBX, stream your After Effects/VDMX/TD output over Syphon/Spout, and see it projected on the 3D set in real time.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [blender-dmx, gdtf-mvr]
---

## What it is

A previz utility for non-planar video (3D mapping, stage screens, installations). Meshes named `screen*` (with UVs) receive the live texture, `guide*` meshes are guides, everything else is the stage, and imported cameras can be toggled.

## Ideas for us

- Preview TouchDesigner content on the actual venue model before load-in, and screen-record it for client sign-off.

## Notes

README read 2026-10-03. Last release 2017 (v2.3.1, macOS and Windows), so it may need older OS support. Browser alternative for simple quad mapping: glowbox/maptasticjs.
