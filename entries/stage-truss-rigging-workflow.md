---
id: stage-truss-rigging-workflow
title: Stage design, truss & rigging — workflow, tools and safety
kind: guide
url: https://gdtf-share.com
demo:
author: Synthesis (industry practice)
license: n/a
license_notes: Commercial tools named here are paid; manufacturer CAD libraries are free downloads with their own terms.
pin:
category: [stage-production]
tags: [truss, rigging, hoists, chain-motors, load-calculation, stage-design, previz, vectorworks, capture, depence, grandma3, unreal, safety]
stack: []
runs_in: [desktop]
fit: [event-stages, client-pitches]
aliases: [trussing, entertainment rigging, ground support, roof system, ANSI E1.2, EN 17206]
hook: How an event stage goes from concept to safe rig: 3D design with manufacturer truss models → MVR → lighting previz → rigging plot and load sign-off by a qualified rigger.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [gdtf-mvr, perastage, blender-dmx, virtual-mapper, blender-mcp]
---

## What it is

A map of the stage-design toolchain and the part that must not be improvised: truss and rigging loads.

## How it works

**1. Concept and 3D design.** Model the venue, stage, set and screens. Use free 3D/CAD models and load tables from truss makers (Prolyte, Global Truss, Eurotruss, Tomcat, Area Four Industries...) so dimensions and allowable loads are real.
- **Industry tools (paid):** Vectorworks Spotlight (CAD + rigging plots), Capture, Depence, WYSIWYG, grandMA3 3D; Unreal Engine for high-end previz and virtual production.
- **Free/open:** Blender (+ BlenderDMX, + Blender MCP), Perastage for MVR review.

**2. Interchange.** Export the rig as **MVR** with GDTF fixtures, so the lighting desk, visualiser and content team (TouchDesigner via td-gdtf) all share one rig.

**3. Rigging plot.** Hang points, motor/hoist positions and capacities, truss spans and types, bridles, and point loads (fixtures + cable + screens + dynamic factors). Perastage shows trusses and hoists from MVR, and Vectorworks Spotlight produces formal plots.

**4. Load calculation and sign-off.** Truss load tables give allowable uniformly-distributed and point loads per span. Hoists need rated working-load limits plus a safety factor. Roof or ceiling points need venue structural approval. **This must be done or checked by a competent rigger or structural engineer.** Relevant standards include ANSI E1.2 (aluminium truss and towers), EN 17206 (stage machinery safety), and local regulations.

## Ideas for us

- For CTX installations that hang screens, projectors or sensors: model them on manufacturer truss in Blender, export MVR, review in Perastage, and hand the plot to the venue's rigger.
- Previz content plus lights plus truss in one scene for pitches (BlenderDMX renders, Virtual Mapper for projection).
- Let Claude draft the layout (Blender MCP / Perastage CLI). **Never** let an AI or an unreviewed calculator decide loads.

## Notes

Written from general industry knowledge (2026-10-03) and not verified per tool. Open-source truss load calculators on GitHub are tiny unreviewed projects (0–1 stars) and are deliberately not listed as tools.
