---
id: perastage
title: Perastage — free MVR/GDTF stage planning viewer & editor
kind: tool
url: https://github.com/PeramatoG/Perastage
demo: https://perastage.luismaperamato.com/
author: Luisma Peramato (PeramatoG)
license: GPL-3.0
license_notes:
pin: aa9603c2f325e9cd3d976e2e6df4dd0695050dfe
category: [stage-production]
tags: [mvr, gdtf, stage-plot, truss, hoists, 2d-plot, 3d-view, lighting-design, cross-platform]
stack: [C++]
runs_in: [desktop, cli]
fit: [event-stages]
aliases: [Perastage MVR viewer]
hook: Open an MVR stage file and review fixtures, trusses and hoists in 3D and 2D plans — free, cross-platform, scriptable.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [gdtf-mvr, blender-dmx, stage-truss-rigging-workflow]
---

## What it is

A desktop app for viewing, editing and exporting MVR stage files with GDTF fixture libraries. It shows a 3D view plus plan-focused 2D workflows for reviewing fixtures, **trusses, hoists**, objects and scene structure. It is deliberately *not* a real-time DMX visualiser.

## How it works

- Import/export MVR; maintain a personal GDTF library; fetch profiles from the GDTF Share API (free account).
- **Tools → Create from text:** generates elements from rider-style notes.
- Create, modify and distribute MVR elements from the **command line**, which makes it scriptable by an agent.
- Linux AppImage, Windows and macOS builds in Releases.

## Ideas for us

- A quick check of a lighting designer's rig before an event; produce 2D truss and hoist plans for riggers from the same MVR.
- Its "create from text" and CLI pair well with Claude: describe a stage → MVR draft.

## Notes

README read 2026-10-03. Actively developed (about 117 stars).
