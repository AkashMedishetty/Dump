---
id: sceneflow
title: SceneFlow — script-to-screen sync for AI filmmakers
kind: tool
url: https://github.com/taruma/SceneFlow
demo: https://sceneflow.taruma.my.id
author: Taruma Sakti Megariansyah (taruma)
license: MIT
license_notes:
pin: b1c8c100b8e392892b11fb2970d8e31d26bf9373
category: [motion-video, ai-video-generation]
tags: [screenplay, prompt-adherence, ai-film-evaluation, cue-timeline, gemini, video-review, storyboard]
stack: [TypeScript, React]
runs_in: [browser]
fit: [reels-content, client-pitches]
aliases: [Auteur Script, script-to-screen]
hook: Plays a video alongside its script and lights up each line — dialogue, camera, VFX, transitions — as it appears, to judge whether AI footage followed the prompt.
source: User shared names, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [wan-video, functional-emotions-video, opus-js-animations]
---

## What it is

A browser tool that syncs a screenplay (or its structured "Auteur Script" format with 5-part staging metadata) to a video and highlights in real time which instructions are on screen. It's built to evaluate prompt adherence in AI-generated video: missed elements, camera drift, continuity breaks.

## How it works

- **Cues** link script segments to timestamps, in 8 colour-coded types: dialogue, action, camera, shot, audio, VFX, transition, environment. There is a colour-blind-safe palette mode.
- Cues are written by hand in a 3-panel edit workstation, or generated with a multimodal model. It ships a ready Gemini sync prompt and a JSON schema for one-click structured cue generation.
- The display is a multi-track DAW-style timeline with a smooth rAF-driven clock and a playhead fixed at 35% so upcoming cues are visible. Nudges of ±0.1 s / ±0.5 s, loop previews, and per-type timing buffers.
- Projects are portable JSON (versionable). The source video is a YouTube link.

## Ideas for us

- **QA for generated or code-rendered reels:** write the storyboard as an Auteur Script, then check the render against it shot by shot. It works for our `STORYBOARD.md`-style pipelines too.
- Client review: show a client the script and the cut side by side.

## Notes

README read 2026-10-03. "SceneFlow" is also a computer-vision term (3D motion estimation); this entry is the filmmaking tool.
