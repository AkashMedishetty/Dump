---
id: gdtf-mvr
title: GDTF & MVR — open standards for fixtures and whole stage rigs
kind: technique
url: https://github.com/mvrdevelopment/spec
demo: https://gdtf-share.com
author: GDTF group (MA Lighting, Robe, Vectorworks + industry); DIN SPEC
license: open specification
license_notes: Spec repo has no LICENSE file; the formats are published as DIN SPEC 15800 (GDTF) and DIN SPEC 15801 (MVR).
pin:
category: [stage-production]
tags: [gdtf, mvr, fixtures, dmx, stage-plot, interchange, truss, hoists, previz]
stack: [XML, 3D models]
runs_in: [desktop]
fit: [event-stages, touchdesigner, synesthetic-room]
aliases: [General Device Type Format, My Virtual Rig, DIN SPEC 15800, DIN SPEC 15801, GDTF Share, pymvr, pygdtf]
hook: One file describes a moving light (GDTF); another describes the whole rig — truss, hoists, fixtures, video, addresses (MVR). Every serious lighting tool reads them.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [perastage, blender-dmx, td-gdtf, open-fixture-library, stage-truss-rigging-workflow]
---

## What it is

- **GDTF** (`.gdtf`, a zip of XML plus 3D models) describes a fixture: geometry, beams, DMX modes and channels, physical data (weight, power).
- **MVR** (`.mvr`) describes a scene: positioned trusses, hoists, fixtures (referencing GDTFs), video screens, scenery, layers and patch.

Together they let a stage design move between CAD (Vectorworks), visualisers (Capture, Depence, grandMA3, Blender DMX), consoles and our own tools without being redrawn.

## How it works

- Fixture files come from **GDTF Share** (manufacturer-uploaded, free account).
- **Libraries:** `pymvr` / `pygdtf` (Python, open-stage), `libMVRgdtf` (C++ reference), and MomentFactory's Omniverse MVR/GDTF→USD converter.
- **MVR-xchange** also defines live sharing of MVR between apps on a network.

## Ideas for us

- Make MVR the single source of truth for event stages. The designer exports MVR → Perastage for review → BlenderDMX for renders → TouchDesigner (td-gdtf) for content previz with the real fixture positions.
- Generate our installation-space MVRs programmatically (pymvr) from venue measurements.

## Notes

Spec repo and BlenderDMX/Perastage READMEs read 2026-10-03.
