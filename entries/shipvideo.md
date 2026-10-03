---
id: shipvideo
title: shipvideo (LaunchVideo) — paste a URL, get a launch video
kind: repo
url: https://github.com/diggerhq/shipvideo
demo: https://launchvideo.io
author: diggerhq
license: none (all rights reserved)
license_notes: No LICENSE file, so study the virtual-clock approach but don't copy code. Runs on OpenComputer (paid serverless) plus Vercel for the web form.
pin: 53d7c6f752fb85b449de8cf806b77ad21808a8f1
category: [motion-video]
tags: [productized, serverless, playwright, virtual-clock, ffmpeg, launch-video, opencomputer, nextjs, deterministic-rendering]
stack: [TypeScript, Next.js, Node.js]
runs_in: [cloud, node]
fit: [reels-content]
aliases: [LaunchVideo, launchvideo.io, __seek(t), virtual clock, OpenComputer]
hook: The productised version — URL or prompt in, 20–40 s launch video out, rendered at roughly real time.
source: GitHub guide (opus_motion_video_guide.md)
source_ref: code-rendered-motion-video
image:
added: 2026-10-03
status: verified
related: [code-rendered-motion-video]
---

## What it is

A live product (launchvideo.io). One OpenComputer agent called `director`, running Claude Opus 5.5, writes a single 1920×1080 HTML film from a URL or a prompt, renders it, and hands back an MP4. It has a one-click deploy to your own OpenComputer account.

## How it works

1. `POST /api/jobs` creates an OpenComputer session and sends a `JOB` block.
2. In URL mode, the agent's `web_fetch` tool also extracts the page title, headings, **most-used hex colours and Google Fonts** for the brand look.
3. The agent writes the film (CSS keyframes or a rAF loop), then runs `check_scene`, which loads it under the virtual clock and reports JS errors and visible text at several timestamps. It fixes what it finds, then calls `render_video`.
4. `render_video` uses Playwright's headless shell with an **injected virtual clock**: rAF, timers, `Date` and CSS/WAAPI animations are all driven by `__seek(t)`. JPEG frames are piped to ffmpeg (`libx264`, `crf 18`, `yuv420p`, `faststart`).
5. The MP4 is saved to the session workspace (`/workspace/videos/<job>.mp4`), and the web app signs a download link.

A 30 s film renders in about 30–40 s. The first call in each fresh microVM spends about a minute installing Chromium and ffmpeg.

**Determinism rules:** no `<video>`, `<audio>` or `<iframe>`, no CSS transitions, no `Math.random`, no external images in a scene.

## Ideas for us

- The **virtual-clock injection** is the key trick. It could record our existing React installation clients frame-perfect without rewriting them as `draw(t)`.
- The `check_scene` step (load the scene, read the errors and visible text at sample times) is a cheap self-QA pattern for any agent-written animation.
- Brand extraction from a URL (colours and fonts) gives instant on-brand client teasers.

## Notes

Verified 2026-10-03 against the README and file tree. **Correction to the guide:** finished videos are not uploaded to Vercel Blob. They stay in the OpenComputer session workspace and are served by signed download ("no object storage"). Vercel only hosts the web form.
