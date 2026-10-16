# A Life Worth Celebrating: transition report

**v3: Summer + Solas only.** Draft v2 used five songs, and the feedback was that the transitions were jarring, the song choice and order were wrong, the sound quality was poor, and it didn't feel like one piece. The opening was the worst part. v3 follows your instruction to use only Summer and Solas. It is built entirely from the original recordings: **no pitch shifting, no time-stretching and no vocal separation**, which were the likely sources of the bad sound in v2. Everything under the "generated" headings is rebuilt by `tools/report.py`. The v2 project is kept as `timeline_v2_five_songs.json`.

## 1. Form

| Output | What you hear | Source |
|---|---|---|
| 0:00 | **Gentle opening.** Summer's piano in C, then sustained strings that lift into **D major**, and the Summer theme enters (Summer 1:21) | Summer 0:58.4–1:32.7, one continuous passage |
| 0:33 | **Build.** Solas enters on a D chord, over Summer's D chord, and grows through its C–D–A–A loop | Solas 1:30.3–1:59.7 |
| 1:01 | **Breath.** Summer's own tremolo swell rises out of Solas' last chord | Summer 2:52.4– |
| 1:03 | **Climax.** First full-orchestra statement of the Summer theme | Summer 2:56.3–3:17.6 |
| 1:26 | **Resolution.** Edit on a V→I cadence into Summer's closing phrase and its own held final D chord | Summer 3:39.4–4:01.7 |

Summer frames the whole piece: it opens, peaks and ends it, and Solas is the build-up between, as you asked.

## 2. Why the joins should now be smooth

- **Fewer joins.** There are only three: Summer → Solas, Solas → Summer, and one cut inside Summer, against seven in v2.
- **Same chord at every join.**
  - Summer → Solas: Summer's D bar (1:31.4) overlaps Solas' D bar (1:30.66).
  - Solas → Summer: Solas ends its phrase on A, the dominant of D. Summer's swell follows, then the tutti on A(sus4) → D.
  - The internal Summer cut is A → D (V → I).
- **No tempo bump into the climax.** Solas runs at 115 BPM and Summer at 89 BPM. Between them sits Summer's rhythm-free tremolo swell, about 2 s at roughly −6 dB relative, so the pulse resets without a jolt. Its chroma fit is only 0.60, because the harmony really does move A → G/D → A → D. The two recordings overlap for about 1.5 s, and for most of it Solas is already fading out.
- **Bass swap at each join.** Below 180 Hz, the outgoing recording's bass leaves before the incoming one's arrives, so the low end doesn't get muddy.
- **Level arc.** Short-term loudness goes −28 → −20 (Summer opening) → −21 → −17 (Solas build) → breath −25 → **−13** (climax) → −19 → final chord. Small gain rides only. No compressor or limiter, and no added reverb.

## 3. Quality checklist (v3)

| Requirement | Result |
|---|---|
| Duration (target 1:55, allowed 1:40–2:10, max 2:20) | see render summary (about 1:48) |
| No vocals | Both recordings are instrumental. The v2 check found only string leakage in the separator's vocal output |
| No clipping | 0 clipped samples, true peak −1.0 dBTP |
| Key clashes | Every join is on a shared or dominant chord. Both recordings are used at their original pitch |
| Tempo | Summer → Solas changes at a shared D bar. Solas → Summer goes through a rhythm-free swell |
| Sound quality | No DSP on the music beyond crossfades, a −2 dB low shelf at 120 Hz on Solas, and static gain |
| Ending | Summer's own final cadence and held chord. The 0.5 s fade only covers silence after the chord |

## 4. Caveats

- **I still can't listen.** The two moments to check are **0:33** (Summer → Solas, where the tempo rises from 89 to 115 BPM on a shared D chord) and **1:01–1:03** (the breath before the climax).
- The **unnamed file is assumed to be Summer**. Its form and key fit, but no metadata confirms it.
- The sources are lossy rips (Opus 48 kHz), and the WAV can't restore what they lost.
- Integrated loudness is about −18 LUFS because the dynamics are kept. For social posting, raise `master.target_lufs` and add a limiter.

## Render summary (generated)

- Duration **1:48.47** (108.47 s)
- Integrated loudness **-18.1 LUFS**, true peak **-1.00 dBTP**, sample peak -1.01 dBFS, master gain -0.82 dB (no limiter or compressor)

## Clip list (generated)

| # | Clip | Source | Source in → out | Output in → out | Pitch | Tempo | Gain |
|---|---|---|---|---|---|---|---|
| 1 | `summer_open` | Summer - Joe Hisaishi (orchestral) | 0:58.40 → 1:32.70 | 0:00.25 → 0:34.55 | +0 st | 89.1 BPM (unchanged) | +4.3 dB |
| 2 | `solas` | Solas | 1:30.25 → 1:59.70 | 0:32.84 → 1:02.29 | +0 st | 114.8 BPM (unchanged) | -3.9 dB |
| 3 | `summer_climax` | Summer - Joe Hisaishi (orchestral) | 2:52.35 → 3:17.80 | 1:00.78 → 1:26.23 | +0 st | 89.1 BPM (unchanged) | +3.7 dB |
| 4 | `summer_close` | Summer - Joe Hisaishi (orchestral) | 3:39.30 → 4:01.70 | 1:25.91 → 1:48.31 | +0 st | 89.1 BPM (unchanged) | +3.7 dB |

## Transitions (generated)

Crossfade = overlap of the two clips. Bass swap = window in which the band below 180 Hz is handed over (outgoing low band out / incoming low band in), so two bass lines never sound together. Chroma fit = cosine similarity of the pitch-class profiles either side of the join (1.0 = same harmony).

| Out time | From → To | Joined on (source bar lines) | Crossfade | Bass swap (src s) | Chroma fit | Loudness before → after | Tempo |
|---|---|---|---|---|---|---|---|
| 0:32.84 | `summer_open` → `solas` | summer_open 1:31.40 = solas 1:30.66 | 1.71 s | out [91.5, 91.9] / in [90.66, 91.06] | 0.87 | -20.7 → -20.4 LUFS | 89.1 → 114.8 BPM |
| 1:00.78 | `solas` → `summer_climax` | solas 1:59.42 = summer_climax 2:53.58 | 1.51 s | out [118.8, 119.3] / in None | 0.60 | -17.6 → -16.7 LUFS | 114.8 → 89.1 BPM |
| 1:25.91 | `summer_climax` → `summer_close` | summer_climax 3:17.60 = summer_close 3:39.42 | 0.32 s | - | 0.83 | -15.9 → -19.1 LUFS | 89.1 → 89.1 BPM |

## Why each clip is there (from timeline.json)

- **`summer_open`** - Gentle opening from Summer itself: last piano phrase in C, the sustained strings that modulate, then the theme arriving in D major at 1:21. One continuous passage of the original recording.
- **`solas`** - Build-up (your pick, 1:30-2:00). Enters on its D bar over Summer's D bar (same chord), then loops C-D-A-A = bVII-I-V of D and ends on A, the dominant of Summer's key. Level rises through the passage.
- **`summer_climax`** - Breath and climax: Summer's own tremolo swell rises out of Solas' last chord (no rhythm, so the tempo resets from 115 to 89 BPM without a bump), then the first full-orchestra statement of the theme at 2:56.3.
- **`summer_close`** - Resolution: V->I edit inside Summer into its closing phrase (D Bm G Bm D D) and its own held final D chord.
