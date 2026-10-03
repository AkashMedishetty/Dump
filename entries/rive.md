---
id: rive
title: Rive — interactive animation with state machines & bones
kind: library
url: https://github.com/rive-app/rive-wasm
demo:
author: Rive
license: MIT (runtime)
license_notes: Runtimes are MIT; the Rive editor is a commercial product (free tier).
pin:
category: [web-animation, animation-rigging]
tags: [state-machine, bones, mesh-deformation, interactive-character, vector, wasm]
stack: [C++, WASM, JavaScript]
runs_in: [browser]
fit: [avatar-arcade, digital-doodles-wall, living-swarm]
aliases: [Rive runtime, @rive-app/canvas, rive state machine]
hook: Design an interactive, rigged 2D character in the Rive editor; the open runtime plays it and reacts to inputs live.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [lottie-web, dragonbones, spine-runtimes]
---

## What it is

Rive is an editor plus open-source runtimes (web/WASM, iOS, Android, Unity, Unreal...). Characters are vector meshes with **bones and mesh deformation**, driven by **state machines** whose inputs (booleans, numbers, triggers) you set from code. That makes it ideal for characters that react.

## Ideas for us

- **avatar-arcade:** a mascot whose state-machine inputs are wired to tracked pose or phone input.
- Living-swarm creatures as rigged Rive files reacting to proximity.

## Notes

Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
