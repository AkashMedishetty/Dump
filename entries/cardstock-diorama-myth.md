---
id: cardstock-diorama-myth
title: Cardstock Diorama Myth — Claude skill for cut-paper myth shorts
kind: skill
url: https://github.com/sadekxD/cardstock-diorama-myth
demo: https://tryunsora.com
author: sadekxD
license: none (all rights reserved)
license_notes: No LICENSE file. Generation runs on the paid Unsora MCP (nano-banana-pro images, seedance-2.0 video, ElevenLabs v3 voice).
pin: d4e46cf801a179cb736f21a45507a0fd7fe72404
category: [agent-skills, ai-video-generation]
tags: [paper-cut, diorama, myth, folklore, narrated-short, seedance, nano-banana, elevenlabs, paper-wipe, qc-script]
stack: [Markdown, Python]
runs_in: [claude-code, mcp]
fit: [reels-content, client-pitches]
aliases: [cardstock diorama, Unsora MCP]
hook: Ask for a myth; get a narrated short in layered cardstock diorama style — three-colour palette, paper wipes, storyteller voice.
source: GitHub search for paper-cut animation, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [paper-cut-animation, vox-editorial]
---

## What it is

A Claude Code / Claude.ai skill that turns a myth or premise into a finished narrated short film. The look: flat matte cardstock worlds with visible cut edges and soft contact shadows, a strict three-colour palette, a tiny figure centred in a huge symmetrical set, a top-down concentric "ring" hero shot, and paper-wipe transitions.

## How it works

Phases:
1. Story: use the given myth, or propose several.
2. Lore research on the real tradition.
3. Lock the palette.
4. Style key image, then character and place sheets (`create_image`).
5. Beat sheet: about 12–18 narration words per 10 s block.
6. Block prompts, each bookended by wipes.
7. 10 s clips via `create_video`, with the style key and sheets on every one.
8. Voiceover with one storyteller voice.
9. Local ffmpeg assembly.

The style is treated as a **measurable spec**: a bundled QC script checks palette, exposure and pacing against the output (numpy, pillow, scikit-learn).

## Ideas for us

- Borrow the "look as a numeric spec + automated QC" idea for any AI-generated reel series.
- Local myths and folklore as event intro films for cultural clients.

## Notes

README read 2026-10-03. Requires an Unsora account; defaults are 16:9, 1 minute, 720p.
