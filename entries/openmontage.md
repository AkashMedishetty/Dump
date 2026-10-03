---
id: openmontage
title: OpenMontage — open-source agentic video production system
kind: tool
url: https://github.com/calesthio/OpenMontage
demo:
author: calesthio
license: AGPL-3.0
license_notes: AGPLv3 — fine for internal production use; modifying and offering it as a network service obliges source release. Each provider (Veo, Kling, ElevenLabs, ...) has its own terms and costs.
pin:
category: [motion-video, vfx-post]
tags: [agentic-video, remotion, hyperframes, gsap, ffmpeg, tts, piper, whisperx, pipelines, claude-code, stock-footage, budget-control]
stack: [Python, Node.js, React, Remotion]
runs_in: [python, node, cli]
fit: [reels-content]
aliases: [Backlot, Remotion, agentic video production]
hook: Agentic video studio for coding agents — 12 pipelines from research to final render, with budget caps and quality gates.
source: User link (2026-10-03)
source_ref: https://github.com/calesthio/OpenMontage
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video, agentic-motion-graphics, opus-js-animations, distilbook]
---

## What it is

A production system that coding agents (Claude Code via `CLAUDE.md`, Cursor, Copilot, Codex, Windsurf) drive with natural language to make complete videos: research, script, assets, edit and compose. It mixes code-rendered motion (Remotion, HyperFrames/GSAP) with optional AI generation (Veo, Kling, Runway, FLUX, ...) and free stock archives.

## How it works

- **Three knowledge layers:**
  - Capabilities: `tools/` registry (100+ tools) and `pipeline_defs/` YAML manifests.
  - Methodology: `skills/` Markdown files.
  - Domain knowledge: external documentation packs.
- **12 pipelines:** Animated Explainer, Animation & Motion Graphics, Avatar Spokesperson, Cinematic, Clip Factory, Documentary Montage, Hybrid, Localization & Dub, Podcast Repurposing, Screen Demo, Talking Head, Character Animation.
- **Every pipeline runs the same stages:** `research → proposal → script → scene_plan → assets → edit → compose`.
- **Scored provider selection:** 7 dimensions (task fit, quality, control, reliability, cost, latency, continuity) with an audit trail.
- **Quality gates:** human approvals, pre-compose validation, and post-render self-review (ffprobe, frame sampling, audio silence/clipping checks, subtitle checks).
- **Budget governance:** cost estimate up front, per-action approval threshold ($0.50 default), spend caps.
- **Zero-cost path:** Piper TTS, Pexels/Unsplash/Pixabay/Archive.org/NASA stock, Remotion and FFmpeg.
- **Backlot:** a live production board (`python -m backlot open`).

```bash
git clone https://github.com/calesthio/OpenMontage.git && cd OpenMontage
make setup          # Python 3.10+, Node 18+, FFmpeg required
cp .env.example .env  # all API keys optional
```

## Ideas for us

- **reels-content:** the Clip Factory and Hybrid pipelines could turn raw installation footage into platform-specific cuts (Reels/TikTok/LinkedIn output profiles are built in).
- Steal ideas even without adopting it: the **stage contract** (proposal and scene_plan approvals before spending), the budget gates, and the post-render self-review checklist.
- Pairs with the code-rendered approach: use it to orchestrate, and our own `seek(t)` HTML scenes for brand-exact motion.

## Notes

- AGPL: keep it as an internal tool; don't embed it in client products.
- Demo films in the repo include "The Last Banana" (60 s animated short, reported $1.33 cost).
