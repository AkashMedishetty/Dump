---
id: bubbbly-bloom-qr
title: Bloom QR (bubbbly) — QR codes made of flowers
kind: tool
url: https://bubbbly.com/bloom
demo:
author: Ann Nguyen (@ann_nnng)
license: Web tool (free to use, terms unknown)
license_notes:
pin:
category: [generative-art, procedural-generation]
tags: [qr-code, flowers, bouquet, scannable-art, event-qr]
stack: [Web]
runs_in: [browser]
fit: [memory-mosaic, collective-heartbeat, rhythm-battle, merch-takeaway]
aliases: [bubbbly.com/bloom, flower QR, bouquet QR]
hook: Paste a link, tap the bouquet, and it blooms into a QR code where the dark modules are flowers — and it still scans.
source: Instagram reel by @namedotcom
source_ref: IMG_0203
image: assets/IMG_0203.jpg
thumb: assets/thumbs/IMG_0203.jpg
added: 2026-10-03
status: verified
related: []
---

## What it is

A small web tool that turns any URL into a scannable QR code drawn as a flower arrangement. Choose a flower (Peony, Lily, Rose, Lotus) and a palette (Original, Blush, Marigold, Sunbeam, Poppy, Azure, Dusk), then copy the link or download the image.

## How it works

The QR matrix stays standard: the three finder squares are kept crisp, and each dark module is replaced by a flower sprite that still reads as "dark enough" to a scanner. QR error correction tolerates the decoration.

## Ideas for us

- Almost every installation starts with a "scan to join" QR (memory-mosaic, collective-heartbeat, rhythm-battle). Make those QRs themed per event instead of plain black squares.
- Build our own version: generate the matrix with a QR library (high error correction), then draw each module with our own sprites (brand marks, event motifs). Test scanning at projection distance.

## Notes

Page checked 2026-10-03. Found via the @namedotcom reel "QR codes, but make them whimsical". It is a hosted tool, not an open-source repo.
