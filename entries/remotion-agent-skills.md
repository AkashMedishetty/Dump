---
id: remotion-agent-skills
title: Remotion Agent Skills — official skills for Claude Code
kind: skill
url: https://github.com/remotion-dev/skills
demo:
author: Remotion
license: none listed
license_notes: No LICENSE file in the skills repo; Remotion itself has its own license.
pin:
category: [agent-skills, motion-video]
tags: [remotion, claude-code-skill, captions, maps, saas-video, render]
stack: [TypeScript, React]
runs_in: [claude-code, node]
fit: [reels-content]
aliases: [/remotion-best-practices, /remotion-create]
hook: Official Remotion best-practice skills: create, captions, maps, multimedia, render, SaaS videos.
source: skillry.dev Opus 5.5 gallery (shared by user, 2026-10-03)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [remotion, hyperframes]
---

## What it is

Remotion's own agent skills: `/remotion-best-practices` (the umbrella), `/remotion-create`, `-captions`, `-maps`, `-markup`, `-multimedia`, `-interactivity`, `-render`, `-saas`, `-studio`, `-upgrade`, `-docs`.

## How it works

```bash
npx skills add remotion-dev/skills
```
It is also offered by `bun create video` when starting a new Remotion project. Example prompt: `/remotion-create Make a promo video for a record store`.

## Ideas for us

- Use this rather than random community Remotion skills; it's maintained by the Remotion team.

## Notes

Verified 2026-10-03 (README + tree). About 4.8k stars.
