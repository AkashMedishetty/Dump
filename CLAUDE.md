# Idea Library — instructions for Claude

This repo is a growing, searchable reference library of techniques, repos, tools, skills and sources for interactive installations, generative visuals, motion/video and social media work. The user (Akash) keeps appending to it — screenshots of reels, GitHub links, articles.

## Layout

- `entries/<id>.md` — **source of truth**, one idea per file (YAML-ish frontmatter + `## What it is / How it works / Ideas for us / Notes`).
- `vocab.json` — the only allowed `category`, `kind`, `status`, `fit`, `runs_in` values. Add a value here first if something new is needed; keep categories few and use tags for detail.
- `assets/thumbs/` — cropped images committed to git. `assets/IMG_*.jpg` full screenshots are **gitignored** (see Privacy).
- `build.mjs` — zero-dependency Node validator/generator. Outputs (commit them): `library.json`, `INDEX.md`, `index.html`, `artifact.html`.
- `_template.md` — blank entry. `viewer.template.html` — source for both HTML outputs.

## Commands

```bash
node build.mjs --new <kebab-id>   # scaffold entries/<kebab-id>.md
node build.mjs --check            # validate only
node build.mjs                    # validate + regenerate all outputs
```

The build refuses to write on errors (unknown vocab, id ≠ filename, missing hook/category/added) and warns on duplicate URLs and broken `related:` ids. Fix every warning before committing.

## Adding ideas

Use the `add-idea` skill (`.claude/skills/add-idea/SKILL.md`) — it is the full checklist. Short version:

1. **Dedupe first:** `grep -ril "<repo or domain>" entries/`. Update an existing entry rather than adding a twin.
2. **Verify, don't trust the post.** Check the link resolves; for GitHub use the API (`gh api repos/OWNER/REPO`) for stars, license, last push, default branch, and read the README/tree. Pin the commit SHA in `pin:`.
3. **Status honestly:** `verified` only if you read the README/source or page; `inbox` if you only confirmed it exists (say so in Notes); `tried`/`used` only when the user says so.
4. **License always:** record `license` and anything surprising in `license_notes` (no LICENSE file = all rights reserved; GPL/AGPL/BSL/custom model licenses; separate terms for assets, weights, footage).
5. **"Ideas for us"** must map to the user's real projects via `fit:` — installations (avatar-arcade, collective-heartbeat, digital-doodles-wall, living-floor, living-swarm, memory-mosaic, mural-wall, rhythm-battle, synesthetic-room), TouchDesigner, reels, merch, social-ops, client pitches.
6. `node build.mjs`, then commit entries + generated files together.

## Privacy (this repo is public)

- Never commit full social-media screenshots: they contain other people's handles, comments, follower avatars. Crop to the content itself (the video frame / the artwork) and save under `assets/thumbs/`; set `thumb:`. Keep the original only locally under `assets/IMG_*` (gitignored) and reference it with `image:`.
- Don't record private individuals' details; credit creators by their public handle/name as the source does.
- HEIC from iPhone: on macOS `sips -s format jpeg in.HEIC --out out.jpg`; crop with `sips -c H W --cropOffset Y X`. In a Linux cloud session, if HEIC can't be converted, ask the user for JPG/PNG.

## Published page

`artifact.html` is published as a claude.ai Artifact at https://claude.ai/artifact/4YPnrqYcrGtq1fgXTjr56i (shared "anyone with the link"). After rebuilding, if the Artifact tool is available, republish `artifact.html` to that `url`, passing any new `assets/thumbs/*` files via `files`. Otherwise tell the user it needs republishing from a session that has the tool.
