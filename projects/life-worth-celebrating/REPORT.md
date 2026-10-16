# A Life Worth Celebrating: transition report

First complete draft (v2). Everything below the "generated" headings is rebuilt from the render by `tools/report.py`.

## 1. Source analysis

Measured with librosa (CQT chroma key profiles, tempogram + beat tracking, RMS, chroma/MFCC segmentation). For the vocal check I separated every source with MDX-Net and compared the vocal stem's level to the mix's. A real lead voice reads 0 to −7 dB; strings that leak into the vocal stem read −10 to −15 dB; piano reads −25 dB or lower.

| Source | Length | Tempo | Key | What's useful | Vocals? |
|---|---|---|---|---|---|
| **Summer** (Hisaishi, the unnamed `videoplayback.webm`) | 4:02 | 89 BPM | C major intro (0:00–1:18, very quiet), **D major** from 1:20 | Pre-climax pedal 2:40–2:56. Full tutti from **2:56.3** with the bars A·D·A·D·A·F♯m·Em·A. Closing phrase **3:39.4** with D·Bm·G·Bm·D·D, then a held final D chord to 4:01.6 | None (only string leakage, −7 to −13 dB) |
| **Viraj's Theme** | 1:26 | 80.7 BPM | D major (G ↔ F♯m colour) | Solo piano intro 0:00.6–0:13.2. Ensemble enters 0:13.2. Lead melody from 0:24.4 | **Lead line from 0:12 sits at 0 to −7 dB with portamento and vibrato, so it's treated as a voice** |
| **Solas** | 3:16 | 114.8 BPM | E minor, the 1:30–2:00 region loops **C·D·A·A** | 4-bar phrases start at 1:26.5 / 1:34.7 / 1:42.9 (bass enters) / 1:51.3 / 1:59.4. Energy rises through the region | None (piano/strings leakage only) |
| **Ophelia** (instrumental piano recording) | 2:58 | 79.5 BPM | E♭ minor / G♭ major | Full-band chorus from 1:45 (≈ −12 dB RMS, warm) | None (−34 to −40 dB) |
| **Golden Brown × Love Story** | 2:22 | 94 BPM, 6-beat bars | B♭ minor (B♭m–G♭ riff), D♭ major Love Story chorus | 0:23.3–0:38.5: B♭m·A♭ \| D♭·A♭ \| A♭ \| B♭m·G♭ | None (−25 to −33 dB) |

Raghuvaran B.Tech is replaced by Solas 1:30–2:00, as you asked.

## 2. Arrangement options considered

**A, "Coming home to D" (chosen).** Viraj (D) → Ophelia +1 st (E minor/G) → Golden Brown +1 st (B minor) → Solas (C·D·A·A) → Summer (D) climax → Summer close.
In D the keys run I → ii/IV → vi → ♭VII–I–V → **I**. Every join is diatonic, and no source moves more than one semitone. Tempo rises through the development (80.7 → 94 → 115 BPM) and then broadens into Summer's 89 BPM tutti, which is the orchestral maestoso gesture. Length 1:56.6.

**B, "Summer bookends".** Summer's quiet D-major statement (1:31–1:52) → Viraj → Ophelia +1 → Solas → Summer climax/close. Golden Brown is dropped.
This framing is the most thematic. But the Summer intro is very quiet and sparse (−34 dB RMS), and adding it pushes the piece to about 2:10 unless Ophelia goes too.

**C, "Short and grand"** (about 1:45). Viraj → Solas → Summer.
It's the most seamless option because everything is D-centred. It drops Ophelia and Golden Brown, though, and with them most of the "joyful development".

I chose A because it fits all five sources at the target length with only +1 semitone shifts. B can be built from `timeline.json` by adding a `summer_intro` clip (Summer 91.3–112.4 s) before `viraj_piano` and disabling `golden`.

## 3. How the joins are made

- **Phrase-locked placement.** Each clip is pinned by a *source bar line* to a bar line of the clip before it (`place` in `timeline.json`). Nothing sits on an arbitrary timestamp.
- **Bass swap at every join.** Each signal is split at 180 Hz with a zero-phase Butterworth pair, which sums back exactly. The low band changes hands inside a 0.3–0.6 s window on the bar line, while the upper band crossfades over 0.6–3 s, so two bass lines never overlap.
- **Equal-power crossfades** between different recordings. Linear crossfades are used where the mix hands over to its own vocal-free stem, since those two signals are sample-coherent.
- **Loudness-matched clips.** Each clip's body is measured (BS.1770) and set to a target, so the arc runs about −24 → −19 → −17 → −13 LUFS short-term and then relaxes. Small gain rides shape the build and the close.
- **Pitch and tempo** use Rubber Band (via pedalboard) in high-quality mode with formant preservation off. The shifts are +1 semitone on two piano recordings and a +1.5 % tempo nudge on Ophelia. A test showed onsets stay within ±8 ms of the source.
- **EQ is minimal.** −2 dB low shelf at 120 Hz on Solas (its bass is the heaviest), −1.5 dB low shelf at 150 Hz on Golden Brown, −1.5 dB air shelf on the separated Viraj stem. No artificial reverb.
- **Ending.** Summer's own closing phrase and final held D chord. The edit into it is a V→I cadence (Summer bar "A" at 3:17.6 → closing phrase "D" at 3:39.4). The last 0.5 s carries only a safety fade on a chord that has already died away.
- **Master.** 25 Hz high-pass, then one static gain to a −1 dBTP ceiling. No limiter or compressor, so the dynamics are the recordings' own. That leaves integrated loudness at about −18 LUFS. If you need it louder for social platforms, raise `master.target_lufs` and add a limiter after the render.

## 4. Quality checklist (v2)

| Requirement | Result |
|---|---|
| Duration ≤ 140 s, target 1:55 | 1:56.6 |
| No audible vocals | Viraj's voice-like lead is excluded by using its vocal-free stem from 0:12. **Re-separating the final mix** gives no section above −14 dB vocal-to-mix, and the residual is static pad leakage with no melodic line |
| No clipping | 0 clipped samples. Sample peak −1.01 dBFS, true peak −1.00 dBTP |
| No key clashes | Chroma fit 0.80–0.91 at every join. A Summer pre-climax swell was tried in v1 and **removed**, because its G/D pedal clashed with Solas' A chord (fit 0.54) |
| No muddy bass | Bass swap at every join. The outgoing and incoming low bands are never both at full level |
| No abrupt tempo changes | Tempo changes only at bar-line joins under a crossfade. The direction is rise, rise, then broaden |
| No excessive reverb | None added |
| No long repetition | Longest single stretch is Solas at 29.8 s, and its harmony changes every bar with the bass entering halfway |
| Not harsh at the end | Close is −19 LUFS against −13 at the climax. Summer's final tutti hit is trimmed by −1 dB |

## 5. Caveats and next refinements

- **I could not listen.** Every decision above comes from measurement, so please check by ear. The joins I'd check first are **0:35.8** (Ophelia → Golden Brown, where 4-beat bars become 6-beat bars) and **1:12.7** (Solas → Summer, where 115 BPM becomes 89 BPM).
- **The Summer identification is your guess plus mine.** The track is a Hisaishi-style orchestral piece in D, and its form fits Summer, but no metadata confirms it.
- **Viraj's lead.** If it's actually a violin rather than a voice, switch `viraj_strings.variant` to `"mix"` to bring the melody back.
- **Demucs.** Its weights (dl.fbaipublicfiles.com) and Hugging Face were blocked from this session, so separation uses MDX-Net `UVR-MDX-NET-Inst_HQ_3`. Only Viraj's Theme actually needed a stem.
- **Source quality.** The inputs are lossy (Opus 48 kHz, plus AAC 44.1 kHz for Viraj, resampled with soxr). The 24-bit WAV can't add back detail the rips don't have.

## Render summary (generated)

- Duration **1:56.58** (116.58 s)
- Integrated loudness **-17.9 LUFS**, true peak **-1.00 dBTP**, sample peak -1.01 dBFS, master gain -0.55 dB (no limiter or compressor)

## Clip list (generated)

| # | Clip | Source | Source in → out | Output in → out | Pitch | Tempo | Gain |
|---|---|---|---|---|---|---|---|
| 1 | `viraj_piano` | Viraj's Theme (Hi Nanna) | 0:00.90 → 0:12.40 | 0:00.25 → 0:11.75 | +0 st | 80.7 BPM (unchanged) | +0.1 dB |
| 2 | `viraj_strings` | Viraj's Theme (Hi Nanna) (vocal-free stem) | 0:12.05 → 0:28.19 | 0:11.40 → 0:27.54 | +0 st | 80.7 BPM (unchanged) | +0.1 dB |
| 3 | `ophelia` | Ophelia (instrumental cover recording) | 1:44.91 → 1:58.10 | 0:23.86 → 0:36.85 | +1 st | 79.5 → 80.7 BPM (+1.5 %) | -8.2 dB |
| 4 | `golden` | Golden Brown x Love Story (instrumental mashup recording) | 0:22.60 → 0:31.60 | 0:35.77 → 0:44.77 | +1 st | 94.0 BPM (unchanged) | -5.9 dB |
| 5 | `solas` | Solas | 1:30.15 → 1:59.95 | 0:43.55 → 1:13.35 | +0 st | 114.8 BPM (unchanged) | -3.1 dB |
| 6 | `summer_climax` | Summer - Joe Hisaishi (orchestral) | 2:56.18 → 3:17.80 | 1:12.72 → 1:34.34 | +0 st | 89.1 BPM (unchanged) | +3.7 dB |
| 7 | `summer_close` | Summer - Joe Hisaishi (orchestral) | 3:39.30 → 4:01.70 | 1:34.02 → 1:56.42 | +0 st | 89.1 BPM (unchanged) | +3.7 dB |

## Transitions (generated)

Crossfade = overlap of the two clips. Bass swap = window in which the band below 180 Hz is handed over (outgoing low band out / incoming low band in), so two bass lines never sound together. Chroma fit = cosine similarity of the pitch-class profiles either side of the join (1.0 = same harmony).

| Out time | From → To | Joined on (source bar lines) | Crossfade | Bass swap (src s) | Chroma fit | Loudness before → after | Tempo |
|---|---|---|---|---|---|---|---|
| 0:11.40 | `viraj_piano` → `viraj_strings` | viraj_piano 0:12.05 = viraj_strings 0:12.05 | 0.35 s | - | 0.91 | -23.7 → -22.9 LUFS | 80.7 → 80.7 BPM |
| 0:23.86 | `viraj_strings` → `ophelia` | viraj_strings 0:25.19 = ophelia 1:45.60 | 3.68 s | out [25.0, 25.6] / in [105.4, 105.8] | 0.85 | -22.1 → -19.6 LUFS | 80.7 → 80.7 BPM |
| 0:35.77 | `ophelia` → `golden` | ophelia 1:57.66 = golden 0:23.25 | 1.08 s | out [117.3, 117.7] / in [23.05, 23.45] | 0.87 | -19.4 → -18.9 LUFS | 80.7 → 94.0 BPM |
| 0:43.55 | `golden` → `solas` | golden 0:30.89 = solas 1:30.66 | 1.22 s | out [30.7, 31.05] / in [90.45, 90.85] | 0.89 | -19.3 → -19.2 LUFS | 94.0 → 114.8 BPM |
| 1:12.72 | `solas` → `summer_climax` | solas 1:59.42 = summer_climax 2:56.28 | 0.63 s | out [119.0, 119.42] / in None | 0.80 | -16.9 → -16.4 LUFS | 114.8 → 89.1 BPM |
| 1:34.02 | `summer_climax` → `summer_close` | summer_climax 3:17.60 = summer_close 3:39.42 | 0.32 s | - | 0.83 | -15.9 → -19.1 LUFS | 89.1 → 89.1 BPM |

## Why each clip is there (from timeline.json)

- **`viraj_piano`** - Gentle opening: solo piano intro, D major, no lead voice. Hands over sample-coherently to the instrumental stem.
- **`viraj_strings`** - Ensemble swell (4 bars) using the vocal-free stem: the lead line from 0:12 is voice-like, so it is removed. Bass hands to Ophelia on the bar line.
- **`ophelia`** - Joyful development: full-band piano chorus. +1 st puts it in E minor/G (relative of Viraj's D/G colour); 79.5 -> 80.7 BPM to lock with Viraj's bar.
- **`golden`** - Playful lift: 2 bars (Bm-A | D-A) of the Golden Brown waltz figure, +1 st into B minor = relative minor of the home key D; ends on A, the dominant of Solas' first chord (D).
- **`solas`** - Build-up (user pick 1:30-2:00): C-D-A-A loop = bVII-I-V of D, so it ends on the dominant of Summer's key.
- **`summer_climax`** - Emotional climax: first full-orchestra statement of Summer (8 bars, A D A D A F#m Em A), D major, 89 BPM.
- **`summer_close`** - Resolution: internal edit V->I into Summer's closing phrase (D Bm G Bm D D) and its own final held D chord; no artificial fade.
