---
id: wa-akg
title: WA-AKG — self-hosted WhatsApp gateway & dashboard
kind: tool
url: https://github.com/mrifqidaffaaditya/WA-AKG
demo: https://wa-akg.aikeigroup.net
author: M. Rifqi Daffa Aditya (mrifqidaffaaditya)
license: MIT
license_notes: Built on Baileys, an unofficial WhatsApp Web client: using it can break WhatsApp's terms and get numbers banned. For business or client use prefer the official WhatsApp Business Platform (Cloud API).
pin: c7dd01a04339e4363b549beb3a41fe02cf131acb
category: [social-media-marketing]
tags: [whatsapp, gateway, rest-api, webhooks, auto-reply, scheduler, broadcast, multi-session, baileys, n8n, nextjs]
stack: [TypeScript, Next.js, Prisma]
runs_in: [node, cloud]
fit: [social-ops, memory-mosaic, collective-heartbeat]
aliases: [WA AKG, WhatsApp API gateway, n8n-nodes-wa-akg]
hook: Turns WhatsApp numbers into a REST API with webhooks, scheduling, auto-replies and a dashboard — multi-session, self-hosted.
source: User request, 2026-10-03
source_ref:
image:
thumb:
added: 2026-10-03
status: verified
related: [n8n, postiz]
---

## What it is

A Next.js 15 + Prisma dashboard and gateway (about 408 stars) that connects any number of WhatsApp accounts by QR scan and exposes 109+ REST endpoints (OpenAPI/Swagger at `/docs`). It also has a beta branch, a "business" customer-service variant with an AI chatbot and queues, and an official n8n community node.

## How it works

- **Engine:** `@whiskeysockets/baileys` WebSocket connection to WhatsApp Web, one session per number.
- **Features:**
  - message scheduler with media;
  - broadcast with randomised 10–30 s delays;
  - keyword auto-replies (group, private or all) with attachments;
  - whitelist and blacklist;
  - contacts;
  - sticker maker with remove.bg.
- **Webhooks:** events such as `message.received` (with sender, type, quoted media) are forwarded to your CRM or app.

## Ideas for us

- **Event join channel:** guests WhatsApp a selfie to the event number, and a webhook pushes it into memory-mosaic (no app or QR web page needed). This needs consent and a privacy note.
- Post-event: send each guest their mosaic tile or plot via WhatsApp.
- **social-ops:** n8n + WA-AKG for client update messages. Keep it to opted-in contacts, never cold broadcast.

## Notes

README read 2026-10-03. The project advertises "anti-ban" broadcast, which signals the real risk: bulk or unsolicited sending violates WhatsApp policy. Phone numbers and messages are personal data, so store them carefully.
