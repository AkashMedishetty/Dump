# A Life Worth Celebrating: Original Recording Remix

A cinematic, instrumental birthday piece (about 1:48) built from two of the user's own recordings, used at their original pitch and tempo: Joe Hisaishi's *Summer* (gentle opening, climax and resolved ending), with *Solas* 1:30–2:00 as the build-up. The earlier five-song draft (v2) is kept in `timeline_v2_five_songs.json`; render it with `python render.py --timeline timeline_v2_five_songs.json`.

- **[REPORT.md](REPORT.md)** covers the source analysis, the arrangement options, how the joins are made, the quality checklist, and generated tables of source timestamps, pitch shifts, tempo changes and crossfade lengths.
- **[timeline.json](timeline.json)** is the editable project: one entry per clip with source in/out, pitch, stretch, bar-line placement, fades, bass-swap windows and loudness target.
- `output/birthday_remix.rpp` is a Reaper project that lays the rendered clips (`output/clips/*.wav`, with fades, gain and pitch already applied) on separate tracks so you can re-arrange or re-balance them.

The audio is **not committed**, because this repository is public and the recordings are copyrighted. Put the sources in `input/` (see [input/README.md](input/README.md)) and render locally.

## Render

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install numpy scipy soundfile pyloudnorm pedalboard librosa matplotlib audio-separator onnxruntime audioread
python separate.py          # only needed for the v2 timeline (vocal-free stem for Viraj's Theme)
python render.py            # -> output/birthday_remix_final.wav (48 kHz/24-bit) + .mp3 (320 kbps) + clips + .rpp
python tools/evaluate.py    # loudness/peak/transition checks + output/overview.png
python tools/report.py      # rebuild REPORT.md from notes.md + the render
```

You also need ffmpeg (with libmp3lame) on your PATH.

## Editing

- To move a join, change the `place` bar lines and the matching `fade_*` / `low_fade_*` windows. Times are source seconds.
- To turn a clip off, set `"enabled": false`.
- `tools/` holds the analysis scripts used to find keys, tempi, bar lines and splice points: `analyze.py`, `beats.py`, `chords.py`, `segments.py`, `localtempo.py`, `vocmap.py` and `viz.py`.
