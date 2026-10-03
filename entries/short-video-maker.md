---
id: short-video-maker
title: short-video-maker — MCP + REST short-video server
kind: library
url: https://github.com/gyoridavid/short-video-maker
demo:
author: David Gyori (AI Agents A-Z)
license: MIT
license_notes:
pin:
category: [motion-video, agent-skills]
tags: [short-video, mcp, rest-api, tts, captions, remotion, n8n, pexels]
stack: [TypeScript]
runs_in: [node, mcp]
fit: [social-ops, reels-content]
aliases: [AI Agents A-Z]
hook: A self-hosted server that agents (or n8n) call over MCP/REST to make TikTok/Reels/Shorts from text — TTS, captions, background video, music.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [postiz, n8n, remotion]
---

## What it is

It combines TTS, Whisper-timed captions, Pexels background clips and music into short vertical videos with Remotion. It deliberately doesn't use GPU video generation. It exposes both an MCP server and a REST API; example n8n workflows are linked.

## Ideas for us

- The "render" node in an automated social pipeline: agent writes → this renders → Postiz schedules.

## Notes

README checked 2026-10-03. Last push 2025-06.
