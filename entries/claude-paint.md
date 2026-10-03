---
id: claude-paint
title: claude-paint — Claude paints with a physical oil-paint simulator
kind: repo
url: https://github.com/aliceisjustplaying/claude-paint
demo: https://stillwet.art
author: alice (pseudonym)
license: MIT (code); CC BY 4.0 (paintings, logs, texts)
license_notes:
pin: 1856f035d92a49eb985faf21405ffd94a5ad52b2
category: [generative-art, simulation-physics]
tags: [oil-paint, paint-simulation, kubelka-munk, bristles, pigment-mixing, rust, lua, ai-painter, painterly]
stack: [Rust, Lua]
runs_in: [desktop, cli]
fit: [mural-wall, merch-takeaway, reels-content, synesthetic-room]
aliases: [stillwet.art, easel, Teaching claudes to paint]
hook: A Rust oil-paint simulator — bristles, wet paint that levels and dries, Kubelka–Munk pigment mixing — and an easel Claude paints at, one stroke at a time.
source: User shared names, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [p5-brush, functional-emotions-video, claude-animation-base]
---

## What it is

A physically simulated oil-painting studio for AI painters. The `paint` crate models a primed linen canvas, a bristle brush that carries wet paint, paint that levels and dries on a clock, cracks, and layers combined optically with Kubelka–Munk. Colours come only from piles mixed with a palette knife from named tubes. The `easel` crate is a live Lua session over that engine, which Claude uses to paint like a painter: mix, load, stroke, wait for layers to dry. Finished works and live studios are shown at stillwet.art.

## How it works

- **Optics, not RGB:** each pigment has absorption and scattering coefficients, and Kubelka–Munk theory computes how mixed and layered paint reflects light. That's why mixes go muddy or glow the way real oils do (blue + yellow really makes green).
- **Bristles:** a brush is many simulated bristles depositing and picking up wet paint, so strokes have ridges, drag and smear.
- **Time:** paint dries on a clock, so painting wet-on-wet versus waiting changes the result.
- **Paintings are replayable logs:** every painting is a log of easel commands, and renders are regenerated rather than stored. Paintings are run in "rounds", with a studio viewer showing painters working live or replayed.

```sh
cargo build --release -p easel
cargo test --workspace
```
Read `notes/easel_guide.md` (how to paint) and `notes/research/` (sourced notes on paint physics).

## Ideas for us

- **mural-wall / synesthetic-room:** a live "the room is painting" installation, where crowd input decides what Claude paints next and the canvas dries over the evening.
- **merch-takeaway:** a print of the night's painting, with its replayable stroke log as a timelapse reel.
- Kubelka–Munk mixing is the trick to steal for any digital paint effect (it is also used in the Mixbox pigment library).

## Notes

README read 2026-10-03. The README carries a "keep out of training data" benchmark canary, so treat the repo as reference material. Paintings and logs are CC BY 4.0: credit "alice / stillwet.art" if shown.
