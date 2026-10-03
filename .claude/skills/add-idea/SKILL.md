---
name: add-idea
description: Add screenshots, links, repos, articles or tools to the Idea Library — dedupe, verify against the source, write entries with honest status and licenses, map to our projects, rebuild, and commit. Use whenever the user shares inspiration to "add to the library" or "save for later".
---

# Add to the Idea Library

Follow this for every item the user shares. Work through all items, then build once.

## 1. Understand each item
- Screenshot: read it closely — project name, author, links in captions, licenses, the visual itself. Note the post's account as `source`.
- Link: fetch it. For a list/gallery page, extract every distinct project, then treat each as an item.
- If a screenshot only shows a name, search GitHub (`gh search repos "<name>" --sort stars`) to find the canonical repo.

## 2. Dedupe
`grep -ril "<owner/repo or domain or name>" entries/` — if it exists, update that entry (new facts, newer pin, extra ideas) instead of creating another.

## 3. Verify
- GitHub: `gh api repos/OWNER/REPO --jq '[.full_name,.stargazers_count,.license.spdx_id,.pushed_at,.default_branch,.archived]'`; read the README (`gh api repos/OWNER/REPO/readme --jq .content | base64 -d`) and the file tree. Pin the default-branch HEAD SHA.
- Note anything the post/guide got wrong in Notes ("Correction: …").
- Missing LICENSE file → `license: none (all rights reserved)`. Flag GPL/AGPL/BSL/non-commercial model weights in `license_notes`.

## 4. Write the entry
`node build.mjs --new <kebab-id>` then fill it in:
- `category` (1–2 from vocab.json; first = primary), `kind`, `tags` (lowercase-hyphenated, reuse existing — see the Tag index in INDEX.md), `aliases` (acronyms, other names, non-English names), `stack`, `runs_in`, `fit`.
- `hook`: one sentence on why it's worth remembering.
- Sections: **What it is** (plain words) · **How it works** (enough to rebuild the idea without the repo) · **Ideas for us** (concrete uses in our installations / reels / social / pitches) · **Notes** (caveats, license, what you verified and when).
- `status`: `verified` only if you read the README/page; otherwise `inbox` and say what wasn't checked.
- `related`: ids of neighbouring entries (the build adds back-links).

## 5. Images
Crop screenshots to the content (no other users' names/comments/avatars), save `assets/thumbs/<name>.jpg` (~560–700px), set `thumb:`. Full original stays local as `assets/IMG_*.jpg` (gitignored) in `image:`.

## 6. Build, review, commit
```bash
node build.mjs
```
Fix all errors and warnings. Commit `entries/`, `assets/thumbs/`, `vocab.json` and the generated files together with a message listing what was added. Then republish `artifact.html` (see CLAUDE.md) if the Artifact tool is available.

## 7. Report back
Tell the user what was added (grouped by category), anything that didn't check out, and any license red flags.
