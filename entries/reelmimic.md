---
id: reelmimic
title: ReelMimic — show it a reel you love, get a new video in the same style
kind: tool
url: https://github.com/edenfunf/reelmimic
demo:
author: edenfunf and ReelMimic contributors
license: MIT
license_notes: Own code MIT. Bundled skills keep their licences (THIRD_PARTY_NOTICES.md). The HyperFrames skills are Apache-2.0 (HeyGen), the frontend-design skill Apache-2.0 (Anthropic), and painted-animation and ClaudeAnimationBase MIT. Remotion skills are not bundled (source-available licence), and Pixabay SFX are excluded (no redistribution). Its rule is to learn technique only, never reuse footage, characters, logos or assets; we still need the rights to whatever we publish.
pin: 9e87e407ae9eb3aa630bc316e870805282bb852d
category: [motion-video, agent-skills]
tags: [style-transfer, reference-video, video-clone, multi-agent, claude-code, codex, hyperframes, painted-animation, anime-cel, pixel-art, paper-cutout, whiteboard, storyboard, shot-review, yt-dlp, scenedetect, librosa, reels]
stack: [TypeScript, Node.js, Python, FFmpeg]
runs_in: [claude-code, node, python, desktop]
fit: [reels-content, social-ops, client-pitches]
aliases: [reel mimic, "Steal like an artist skill", video-clone skill, clone studio]
hook: Drop in a reel you love (file or link); it reverse-engineers the edit (shots, BPM, transitions, colour, camera) and has a team of Claude Code agents build a brand-new 2D video in that style.
source: Instagram reel ("Steal like an artist skill")
source_ref: IMG_reelmimic-reel (Instagram reel, Oct 2026)
image: assets/IMG_reelmimic-reel.jpg
thumb: assets/thumbs/reelmimic.jpg
added: 2026-10-14
status: verified
related: [hyperframes, hyperframes-community-skills, claude-animation-base, code-rendered-motion-video, opus-js-animations, pdoom-video]
---

## What it is

A local web app (localhost:4318) that runs on your own Claude Code or Codex. You give it a reference video (a file, a phone recording or a YouTube link) and a one-line brief. It breaks the reference down, proposes a plan (storyboard, characters, assets, style frames) that you can chat about and approve, then makes an original 2D video in the same style. Its examples are hand-painted music videos (58–63 s) and a narrated comic (30 s).

## How it works

- **Breakdown:** Python with yt-dlp, PySceneDetect, OpenCV and librosa measures shot count and lengths, BPM, transitions, colours, framing and camera moves.
- **Plan gate:** you see the storyboard and style frames first, comment in a side chat, add assets, then press "Approve and start".
- **Production line:** up to 6 agents build different shots in parallel. Each finished shot is reviewed by a *different* agent, and every fix must come with before-and-after screenshots that the reviewer checks.
- **Seven 2D engines:**
  - vector and motion graphics (HyperFrames)
  - hand-painted watercolour (painted-animation / p5.brush)
  - crayon picture book
  - pixel art
  - paper cut-out stop-motion
  - whiteboard doodle
  - anime cel

  New styles are a Markdown file each. If a reference doesn't match any of them, it picks the closest engine and writes a proposal for a new style.
- **Review:** scrub the finished video, leave notes at any second, and send them all at once.
- **Optional posting** through Upload-Post. It never posts by itself, and `--send` is required.
- **Timing:** 1–3.5 hours per 30–60 s video after the plan is approved. Watercolour and crayon are slowest. It uses your Claude or Codex plan's quota, and pauses and resumes at limits.

## Ideas for us

- **Our reference sheet:** Akash has collected 30 reference reels (R1–R30 in the PurpleHat repo's `assets/refs/STYLE-REFERENCES.md`). This is the tool built for exactly that: feed a reel in, approve the plan, and get a PurpleHat version in the same style. Run it on the Mac, where Instagram and yt-dlp work.
- **Anime spot "From Above":** its anime-cel engine plus our 13 approved keyframes (as "bring your own designs") could animate the spot in code, without a GPU video model.
- **Reels pipeline (social-ops):** a repeatable way to make on-trend reels for PurpleHat and clients. Pair it with the Upload-Post step for scheduling.
- **Client pitches:** show a client's favourite reel next to a ReelMimic version made in their brand, as a pitch hook.

## Notes

- **Verified 2026-10-14:** read the README, LICENSE (MIT), THIRD_PARTY_NOTICES.md, requirements and the bundled skills list. Pinned `main` at `9e87e40` (2026-10-15 UTC+8). Stars were not checked (no GitHub API in this session).
- **Limits (from the README):** 2D animation only. No real people or live action. It's tested mostly on Windows; macOS and Linux have had less testing. The five newer engines have had little real-world use.
- **Needs:** Node 22.18+, Python 3.10+, FFmpeg, Chrome, and a logged-in Claude Code or Codex.
- Optional keys live in `~/.reelmimic/secrets.json`, outside the repo: Yating Taiwanese-Mandarin TTS, Pixabay and Freesound.
- **Rights:** lyrics only come from text you give it, and it won't download commercial songs. Downloading reference reels with yt-dlp is for study only; don't republish other people's work.
- The thumbnail is a frame from the repo's own demo GIF ("Sugar Rush"). The reel screenshot stays local.
- Not tried by us yet.
