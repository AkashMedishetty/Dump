# Idea Library

A growing reference of techniques, repos, tools and sources for interactive installations, generative visuals and motion work. Every idea is one Markdown file, so it is greppable, diffable, and easy for people or Claude to append to.

## Using it from Claude (local or Claude Code on the web)

Open the repo in Claude Code and share screenshots or links with "add these to the library". `CLAUDE.md` and the `add-idea` skill (`.claude/skills/add-idea/`) tell Claude how to dedupe, verify, write entries, rebuild and commit.

## Layout

```
idea-library/
  entries/<id>.md         one idea per file (source of truth — edit these)
  assets/thumbs/          cropped images (committed)
  assets/IMG_*            full screenshots (local only, gitignored: they show other people's handles)
  vocab.json              allowed categories, kinds, statuses, project "fit" tags
  _template.md            blank entry
  build.mjs               validator + generator (Node, zero deps)
  library.json            GENERATED — full machine-readable index
  INDEX.md                GENERATED — catalogue by category, tag index, project-fit index
  index.html              GENERATED — offline search UI (double-click to open)
  viewer.template.html    source for index.html
```

## Add an idea

```bash
node build.mjs --new my-idea-id
```

Fill in `entries/my-idea-id.md` (drop any screenshot into `assets/` and point `image:` at it), then rebuild:

```bash
node build.mjs
```

The build refuses to write if something is malformed (unknown category, id ≠ filename, missing hook, bad date) and warns about likely duplicates (same URL) and broken `related:` links. Run `node build.mjs --check` to validate without writing.

### Rules that keep it searchable

- **id = filename**, kebab-case, never renamed once linked.
- **category** comes only from `vocab.json`. Need a new one? Add it there first, with a one-line description. Keep the list short; use **tags** for everything finer.
- **tags** are free-form, lowercase, hyphenated (`reaction-diffusion`, not `Reaction Diffusion`). Reuse existing tags — the Tag index in `INDEX.md` lists them all.
- **aliases** hold the names people will actually type: acronyms, paper titles, nicknames (`ORCA`, `Gray-Scott`, `WFC`).
- **hook** is one sentence; **What it is / How it works / Ideas for us / Notes** are the body sections. "How it works" should let us rebuild the idea even if the repo disappears.
- **pin** the exact commit or tag you looked at.
- **license** + **license_notes**: always record them; many repos have code under MIT but assets/demos under other terms.
- **status**: `inbox` → `verified` → `tried` → `used`.

## Searching

- **index.html**: free-text search across every field and the body, plus filters for category, kind, stack, runs-in, license, project fit and status. Field queries work too: `license:mit`, `tag:xpbd`, `fit:living-floor`, `kind:repo`, `stack:python`, `author:fogleman`, `status:tried`. Searches are kept in the URL hash, so you can bookmark them. Press `/` to focus the search box.
- **Terminal**: `grep -ril "voronoi" entries/` or `grep -l "fit:.*living-floor" entries/*.md`.
- **Programmatic**: `library.json` holds every entry with parsed sections and extracted links.

## Sources mined so far

- Instagram: @index.opensource (curated by @hyun2xyz) — near-daily open-source creative-coding reels, with pinned commits and license notes in each caption (batch 2026-10-03, 21 screenshots, `assets/IMG_0181–0201.jpg`).
- GitHub: abhishekgoyal17/JAVA `docs/clause/opus_motion_video_guide.md` — code-rendered motion video with Claude.
- skillry.dev Opus 5.5 video gallery + skill directory, and a research sweep (2026-10-03) of open-source motion/JS animation, character & rigging, anime/ink styles, AI video generation, and social media / ads agents.
- Instagram reel by @namedotcom — Bloom QR (bubbbly.com/bloom).

## Published copy

`node build.mjs` also writes `artifact.html`: the same viewer, prepared for publishing as a claude.ai Artifact. It uses cropped thumbnails only, because the full phone screenshots show other Instagram users' names. The live copy is at https://claude.ai/artifact/4YPnrqYcrGtq1fgXTjr56i. To update it after adding entries, ask Claude to republish `artifact.html` to that URL with the files in `assets/thumbs/`. Sharing (private, organization or public) is set from the page's Share menu.
