---
id: ola
title: OLA — Open Lighting Architecture
kind: tool
url: https://github.com/OpenLightingProject/ola
demo:
author: Open Lighting Project
license: LGPL/GPL (mixed)
license_notes:
pin:
category: [stage-production]
tags: [dmx, art-net, sacn, rdm, usb-dmx, gateway]
stack: [C++, Python]
runs_in: [desktop, cli]
fit: [event-stages, touchdesigner]
aliases: [Open Lighting Architecture, olad]
hook: "The travel adaptor for the lighting industry": a daemon that bridges DMX protocols and USB interfaces, with APIs.
source: Research for stage design / rigging request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [gdtf-mvr, blender-dmx]
---

## What it is

A Linux/macOS daemon (`olad`) plus libraries (C++, Python, JSON/HTTP) that convert between Art-Net, sACN/E1.31, USB DMX widgets, RDM and more.

## Ideas for us

- A Raspberry Pi DMX node for small installations, driven from our Node or Python servers.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
