---
id: google-ads-mcp
title: Google Ads MCP server (official, googleads)
kind: library
url: https://github.com/googleads/google-ads-mcp
demo:
author: Google Ads (googleads org)
license: Apache-2.0
license_notes:
pin:
category: [social-media-marketing, agent-skills]
tags: [google-ads, gaql, reporting, mcp, search-ads]
stack: [Python]
runs_in: [mcp]
fit: [social-ops]
aliases: [Google Ads API MCP]
hook: Google's own MCP server for the Google Ads API — let an agent query campaigns and performance.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: inbox
related: [meta-ads-mcp]
---

## What it is

An MCP server from the official `googleads` GitHub org exposing Google Ads API access (GAQL queries, account and campaign data) to agents.

## Ideas for us

- Pair with Meta Ads MCP for a single "how are ads doing?" conversation across platforms.

## Notes

Check which write operations are exposed before giving it a production account. Metadata (exists, stars, license, last push) checked 2026-10-03; description from general knowledge, README not re-read.
