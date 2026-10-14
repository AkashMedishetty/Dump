---
id: gbro-collage-broll
title: gbro-collage-broll — halftone paper-collage B-roll skill (Gemini first/last-frame video)
kind: skill
url: https://github.com/pyang5166/gbro-collage-broll
demo:
author: 狗哥笔记 (pyang5166)
license: MIT
license_notes: Skill MIT (© 2026 狗哥笔记). It generates video through Google's paid Gemini API (gemini-omni-flash-preview), so each clip has a cost and is subject to Google's terms. The still frames come from Codex's built-in image_gen.
pin: a1a4ee2e2abf7d44e460026b706d0c72c2cf8a91
category: [ai-video-generation, agent-skills]
tags: [paper-collage, halftone, editorial, b-roll, stop-motion, first-last-frame, gemini, veo, codex, approval-gates, 9x16, voiceover]
stack: [Python, Markdown]
runs_in: [cloud, python, cli]
fit: [reels-content, social-ops]
aliases: [collage b-roll, 纸拼贴 b-roll, 半调拼贴, Gemini Omni Flash]
hook: Turns one ~5 s voiceover line into a premium editorial halftone paper-collage clip that assembles itself from an empty page, with three approval gates so no money is spent on a bad idea.
source: Instagram reel "Web Lab · AI Tools" (top-5 video skills, #3)
source_ref: IMG_gbro-collage-reel (Instagram reel, Oct 2026)
image: assets/IMG_gbro-collage-reel.jpg
thumb: assets/thumbs/gbro-collage-broll.jpg
added: 2026-10-14
status: verified
related: [paper-cut-animation, animation-pipeline-riso, cardstock-diorama-myth]
---

## What it is

A skill for coding agents (written for Codex) that makes B-roll to sit under talking-head reels. You give it a single line of voiceover, about 5 seconds. It turns that into one sharp visual metaphor, then a 9:16, 5-second, 720×1280, 24 fps silent clip in an editorial style: a flat saturated paper ground, black-and-white halftone photo cut-outs, and coloured card accents. The pieces slide in and lock into place like stop-motion, rather than fading or slowly zooming.

## How it works

1. **Gate 1, metaphor.** Text only: the core meaning, key objects, ground colour and assembly order. Nothing is generated, so changes are free.
2. **Gate 2, stills.** After approval, it generates the finished collage still and a contact sheet with the image tool, and waits for approval again.
3. **Gate 3, video.** `gemini-omni-flash-preview` animates from the first frame (empty page) to the last (the approved collage), followed by QA: one frame per second, an empty-first-frame check and a last-frame comparison. An old Veo path is kept for compatibility.

Batch mode lets you send several lines; only approved ones move on to the next gate. It needs Codex (for `image_gen`), `GEMINI_API_KEY`, Python 3.10+ with `google-genai`, and ffmpeg. The docs and trigger words are mainly in Chinese.

## Ideas for us

- **Social ops:** B-roll for founder or talking-head reels ("why we design events like machines"), one collage clip per sentence.
- **The gate pattern:** metaphor, then stills, then video is the right way to spend paid video credits. Reuse it for our Wan, Kling or Veo work on the anime spot: approve the keyframes first (which we did), then animate.
- **Brand version:** swap the palette to PurpleHat purple and lavender with cream card stock for a recognisable editorial look.

## Notes

- **Verified 2026-10-14:** read the README (Chinese and English summary), LICENSE (MIT) and the scripts. Pinned `main` at `a1a4ee2` (last commit 2026-07-15). The reel showed about 1.3k stars and 117 forks; not checked via the API.
- **Costs and limits:** video is billed per use. The first frame may show a stray scrap of paper; the README says to fix strict empty openings in an editable timeline tool.
- Can't run in our cloud sessions without a Gemini key, and generativelanguage.googleapis.com allowed in the network policy.
- The thumbnail is a frame from the repo's own demo GIF (MIT).
- Not tried by us yet.
