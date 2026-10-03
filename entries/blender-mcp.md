---
id: blender-mcp
title: Blender MCP — drive Blender from Claude
kind: mcp-server
url: https://github.com/ahujasid/mcp-for-blender
demo:
author: Siddharth Ahuja
license: MIT
license_notes: Community plugin; not affiliated with the Blender Foundation. Repo was renamed from ahujasid/blender-mcp.
pin:
category: [agent-skills, animation-rigging]
tags: [blender, 3d-modeling, scene-building, python, mcp, asset-generation]
stack: [Python]
runs_in: [desktop, mcp]
fit: [synesthetic-room, touchdesigner, reels-content]
aliases: [blender-mcp, BlenderMCP]
hook: Let Claude build, light and animate Blender scenes through MCP — the bridge for character and 3D asset work.
source: Research for this batch
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [unirig, trellis-image-to-3d, threejs-skills]
---

## What it is

An MCP server plus Blender add-on (about 30k stars) that exposes Blender's Python API to an LLM: create and modify objects, materials, lighting and cameras, run scripts, and pull assets.

## Ideas for us

- Prototype 3D scenes and characters by conversation, then export GLB for three.js installations (see our `r3f-3d-web` skill pipeline).

## Notes

Metadata checked 2026-10-03; README not reviewed. Running arbitrary Python in Blender is powerful, so keep it to local, trusted files.
