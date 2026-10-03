---
id: anthropic-skills
title: Anthropic Agent Skills — algorithmic art, canvas design, GIFs
kind: skill
url: https://github.com/anthropics/skills
demo:
author: Anthropic
license: per-skill
license_notes: Most example skills are Apache-2.0; the document skills (docx/pdf/pptx/xlsx) are source-available. Check each skill folder.
pin:
category: [agent-skills, generative-art]
tags: [algorithmic-art, p5js, canvas-design, slack-gif, frontend-design, theme-factory, skill-creator]
stack: [Markdown, Python, JavaScript]
runs_in: [claude-code]
fit: [reels-content, client-pitches]
aliases: [algorithmic-art, canvas-design, slack-gif-creator, frontend-design, web-artifacts-builder, skill-creator]
hook: Anthropic's official skills repo — algorithmic-art (p5.js), canvas-design, slack-gif-creator, frontend-design, skill-creator.
source: Research for this batch
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [claudedesignskills, awesome-claude-skills]
---

## What it is

The public reference set of Agent Skills (about 179k stars), including several directly relevant to visual work:
- `algorithmic-art`: seeded p5.js generative pieces.
- `canvas-design`: posters and visual art.
- `slack-gif-creator`: animated GIFs.
- `theme-factory`, `frontend-design`, `web-artifacts-builder`.
- `skill-creator`, for writing our own skills.

## Ideas for us

- Use `skill-creator` to turn this library's workflow (and our installation build patterns) into CTX skills.
- Use `algorithmic-art` as a quick generator for event visuals.

## Notes

Tree verified 2026-10-03. Several of these are already available in this Claude setup as `anthropic-skills:*`.
