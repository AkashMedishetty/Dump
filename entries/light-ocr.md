---
id: light-ocr
title: light-ocr — fast offline OCR for Node.js and C++
kind: library
url: https://github.com/arcships/light-ocr
demo: https://www.npmjs.com/package/@arcships/light-ocr
author: arcships (light-ocr contributors)
license: Apache-2.0
license_notes: Code Apache-2.0. The bundled PP-OCR models are declared Apache-2.0 in the repo's model-bundle docs. PDFium and the Noto Sans SC font ship with their own notices in the release artifacts — check those before redistributing a packaged app.
pin: 39979d4ed6e62b34b152e364107844ad7641fcbb
category: [computer-vision]
tags: [ocr, offline, on-device, pdf, text-recognition, nodejs, cpp, cli, webgpu]
stack: [C++17, Node.js, Node-API]
runs_in: [node, cli, desktop]
fit: [social-ops, memory-mosaic, digital-doodles-wall, touchdesigner]
aliases: [light ocr, "@arcships/light-ocr", PP-OCRv6, PaddleOCR, OCR]
hook: One npm install reads text out of photos and PDFs entirely on the laptop — no cloud, no model downloads.
source: Instagram @gittrend.io
source_ref: IMG_light-ocr-reel (Instagram reel, Oct 2026)
image: assets/IMG_light-ocr-reel.jpg
thumb: assets/thumbs/light-ocr.jpg
added: 2026-10-04
status: verified
related: [wa-akg, n8n]
---

## What it is

A small OCR (text recognition) engine you install with one command, `npm install @arcships/light-ocr`. Give it a JPEG, PNG, PDF or raw pixels and it returns each line of text in reading order, with a confidence score and the four corners of its box. Everything runs locally: the model, the PDF renderer and a Chinese fallback font come inside the package, with no post-install downloads.

## How it works

- **Two-stage OCR from PaddleOCR (PP-OCRv6 Small, about 30 MB):** a detector finds text regions, then a recogniser reads each region. `detect` returns boxes only; `recognize` does both.
- **Native C++17 core with a Node-API binding,** prebuilt for eight platforms, so there is no compiler step. Node 22+.
- **Acceleration picked automatically:** Core ML on Apple Silicon (macOS 15+), WebGPU through Vulkan (Linux) or D3D12 (Windows), with a CPU fallback. The repo reports 2.4–5.7× speed-ups over CPU on its test GPUs.
- **PDFs:** pages are rendered with the bundled PDFium and streamed page by page (`recognizeDocument`), so long documents don't load all at once.
- **CLI:** `light-ocr image.png --format json|text`, page ranges for PDFs, a region-of-interest option and `doctor` diagnostics.
- Model tiers: Small (stable), Tiny (~6 MB, 49 languages, preview) and Medium (~139 MB, quality-first, preview).

## Ideas for us

- **Lead capture at events (social-ops):** photograph business cards or badge QR stickers at a booth; text is read offline on the laptop (no guest data sent to a cloud OCR), turned into a contact and passed to WhatsApp follow-up via WA-AKG or n8n.
- **Memory Mosaic / wish walls:** guests write a wish on a card, a camera reads it and the words appear in the projected mosaic. Test handwriting first; printed text is far more reliable.
- **Digital Doodles Wall:** detect any words in a drawing and animate them separately from the picture.
- **Office use:** make old event briefs, quotes and scanned contracts searchable.
- **TouchDesigner:** run it as a small Node service and send results to TD over OSC or WebSocket.

## Notes

- **Verified 2026-10-04:** read the README, LICENSE (Apache-2.0), NOTICE and the model-tier and acceleration sections. Version 0.5.8, `main` pinned at `39979d4` (2026-09-30). Stars were not checked (GitHub API access was not available in this session); the README shows a Trendshift "#2 Repository of the Day" badge, as in the reel.
- Not tried by us yet. Handwriting accuracy, Hindi or Telugu support and speed on our event laptops are all untested.
- A multimodal model (like Claude) is better for understanding a whole document; light-ocr is for fast, private, high-volume text extraction.
