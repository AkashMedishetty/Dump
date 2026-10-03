---
id: td-gdtf
title: td-gdtf — load GDTF fixtures into TouchDesigner
kind: tool
url: https://github.com/matthewwachter/td-gdtf
demo:
author: Matthew Wachter
license: MIT
license_notes:
pin: 77ca404c5dfe8d5fc737d84de69ab2104d6d4428
category: [stage-production]
tags: [touchdesigner, gdtf, fixtures, previz, dmx]
stack: [Python, TouchDesigner]
runs_in: [touchdesigner]
fit: [touchdesigner, event-stages, synesthetic-room]
aliases: [TouchDesigner GDTF]
hook: A TouchDesigner component that reads GDTF fixture profiles, so TD scenes can previsualise and drive real lights.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [gdtf-mvr, blender-dmx]
---

## What it is

A TouchDesigner component for loading GDTF fixture profiles (geometry and DMX modes).

## Ideas for us

- In our TD builds, place real fixture models in the room and drive them from the same audio-reactive network that drives the projections.

## Notes

README checked 2026-10-03 (one line). Last push 2023, so test against current TD builds.
