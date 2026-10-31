# purplehat/: all PurpleHat Events work from the cloud sessions

- **`BUILT.md`**: inventory of everything built (identity, logo in code, animations, films, guidelines, cards, decks)
- **`CONVERSATION-BRIEF.md`**: the history, decisions, rules and open items. Give it to the next session.
- **`brand/BRIEF.md`**: the brand brief for designers and agents (logo spec v2, colours, type, rules)

## Take it to the Mac
```bash
git clone https://github.com/AkashMedishetty/Dump.git && cd Dump && git checkout claude/new-session-d5vt24
cd purplehat
python3 -m http.server 8000          # then open http://localhost:8000/brand/index.html
                                     #   /brand/animation/player.html      logo animations, live
                                     #   /brand/motion-hero/play.html      hero film, live
                                     #   /brand/guidelines/index.html      guidelines and deliverables
```
The finished videos are in `videos/`, the guidelines PDF is `brand/guidelines/PurpleHat-Brand-Guidelines.pdf`, and the logo files are in `brand/svg/`.

## To regenerate or re-render
Install the dependencies once: Node 18+, Python 3 with `numpy scipy shapely fonttools pillow soundfile` (and `uharfbuzz` for kerning), ffmpeg, and Chromium via Playwright (`npx playwright install chromium`).

```bash
# logo files + logo code (from brand/)
cd brand && python3 build/build_all.py            # add --video for the logo animation MP4s
# guidelines + cards + social + slides
cd brand/guidelines && node src/build.mjs all && node src/render.mjs
```
Films (`brand/motion-hero`, `films/worlds2`, `films/standby`) render with the Lemo-Opuscar toolkit:
```bash
git clone https://github.com/lemomo-ai/lemo-opuscar ~/lemo-opuscar && cd ~/lemo-opuscar && git checkout fdc46d7 && npm install
export LIB=~/lemo-opuscar PLAYWRIGHT_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node core/render/video.mjs /path/to/purplehat/brand/motion-hero --fps 30 --size 1920x1080 --out /tmp/hero.mp4
```

**Paths to change:** some scripts carry absolute cloud paths:
- the toolkit at `/home/user/lemomo-ai/lemo-opuscar` (in about 15 files);
- Chromium at `/opt/pw-browsers/...` (8 files);
- the cloud scratchpad `/tmp/claude-0/...` (6 helper scripts, mostly in `misc/`).

Find them with `grep -rl "/home/user/lemomo-ai\|/opt/pw-browsers\|/tmp/claude-0" .` and point them at your Mac paths.

Not included (rebuildable): frame sequences, still dumps, raw pre-master renders, virtualenvs and `node_modules`.
