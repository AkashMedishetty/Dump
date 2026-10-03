---
id: social-media-agent
title: LangChain Social Media Agent — URL to post, with human approval
kind: library
url: https://github.com/langchain-ai/social-media-agent
demo:
author: LangChain
license: MIT
license_notes:
pin:
category: [social-media-marketing, agent-skills]
tags: [langgraph, human-in-the-loop, content-curation, twitter, linkedin, scheduling, agent-inbox, slack]
stack: [TypeScript, LangGraph]
runs_in: [node, cloud]
fit: [social-ops]
aliases: [LangGraph social agent]
hook: An agent that reads a URL, writes X and LinkedIn posts, picks images, and waits for your approval in an inbox before scheduling.
source: Research for this batch (user asked for JS animation / character / rigging libraries)
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [postiz, n8n]
---

## What it is

A LangGraph agent with a human-in-the-loop flow. It sources content (URLs, GitHub, YouTube, Slack channels, crons), uses Claude to write posts in a configurable style, picks images, then pauses in **Agent Inbox** for edit/accept/reject. Platform auth goes through **Arcade**. It needs Anthropic, LangSmith, FireCrawl and Arcade keys; the full setup adds Supabase, Slack and GitHub.

## Ideas for us

- **social-ops:** feed it our case-study pages and installation write-ups; approve drafts from Slack.
- Its post-style prompts are a good template for a CTX voice guide.

## Notes

README checked 2026-10-03.
