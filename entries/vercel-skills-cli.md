---
id: vercel-skills-cli
title: skills CLI (npx skills) — install agent skills from any repo
kind: tool
url: https://github.com/vercel-labs/skills
demo:
author: Vercel Labs
license: MIT
license_notes:
pin:
category: [agent-skills]
tags: [installer, cli, skills-registry]
stack: [TypeScript]
runs_in: [cli, node]
fit: []
aliases: [npx skills, skills.sh]
hook: The installer HyperFrames, Remotion and others use: npx skills add owner/repo --skill name.
source: HyperFrames README
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [hyperframes, remotion-agent-skills, hyperframes-community-skills]
---

## What it is

An open CLI (about 33k stars) that installs skills from a GitHub repo into the current project or globally, for Claude Code, Codex, Cursor, Gemini CLI and others. `--list`, `--skill <name>`, `--all`, `--global`, `--agent`, `--yes`.

## Notes

Usage confirmed via the HyperFrames and Remotion READMEs, 2026-10-03.
