---
id: postiz
title: Postiz — open-source agentic social media scheduler
kind: library
url: https://github.com/gitroomhq/postiz-app
demo:
author: Gitroom (Nevo David)
license: AGPL-3.0
license_notes: AGPL-3.0: self-hosting for our own use is fine; modifying it and offering it as a service to others requires publishing changes.
pin:
category: [social-media-marketing, agent-skills]
tags: [scheduling, multi-platform, analytics, team-collaboration, api, mcp, n8n, self-hosted, buffer-alternative]
stack: [TypeScript, Next.js, NestJS]
runs_in: [cloud, node]
fit: [social-ops, reels-content]
aliases: [Postiz Cloud, gitroom]
hook: Self-hostable Buffer/Hootsuite alternative with AI features and an API — the posting backbone for an agent-run social pipeline.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [mixpost, social-media-agent, short-video-maker, n8n]
---

## What it is

About 37k stars and over 7M downloads. Schedule posts to many networks (X, LinkedIn, Instagram, Facebook, TikTok, YouTube, Pinterest, Threads, Bluesky, Reddit and more), with analytics, team comments and approvals, a marketplace to exchange posts, and an API for n8n, Make and Zapier. The stack is Next.js + NestJS + Prisma/Postgres + Temporal. Cloud and open-source editions have the same features.

## Ideas for us

- **social-ops:** agents draft (Claude) → render (HyperFrames / short-video-maker) → **Postiz** schedules and posts → analytics flow back.
- This Claude setup already has a `postiz:postiz` skill available.

## Notes

README checked 2026-10-03.
