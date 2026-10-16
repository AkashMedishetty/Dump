#!/usr/bin/env python3
"""Build REPORT.md = notes.md + tables generated from output/render_log.json and output/transition_checks.json."""
import json, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log = json.load(open(os.path.join(HERE, "output", "render_log.json")))
chk = {(r["frm"], r["to"]): r for r in json.load(open(os.path.join(HERE, "output", "transition_checks.json")))}
tl = json.load(open(os.path.join(HERE, "timeline.json")))
titles = {k: v["title"] for k, v in tl["sources"].items()}


def mmss(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


def bpm(c):
    return tl["sources"][c["source"]]["bpm"] * c["stretch"]


def bpm_note(c):
    src = tl["sources"][c["source"]]["bpm"]
    return f"{src:.1f} BPM (unchanged)" if c["stretch"] == 1 else f"{src:.1f} → {bpm(c):.1f} BPM ({(c['stretch'] - 1) * 100:+.1f} %)"


L = [open(os.path.join(HERE, "notes.md")).read().rstrip(), "",
     "## Render summary (generated)", "",
     f"- Duration **{mmss(log['duration_s'])}** ({log['duration_s']:.2f} s)",
     f"- Integrated loudness **{log['integrated_lufs']:.1f} LUFS**, true peak **{log['true_peak_dbtp']:.2f} dBTP**, "
     f"sample peak {log['sample_peak_dbfs']:.2f} dBFS, master gain {log['master_gain_db']:+.2f} dB (no limiter or compressor)",
     "", "## Clip list (generated)", "",
     "| # | Clip | Source | Source in → out | Output in → out | Pitch | Tempo | Gain |",
     "|---|---|---|---|---|---|---|---|"]
clips = sorted(log["clips"], key=lambda c: c["out_in"])
for i, c in enumerate(clips, 1):
    L.append(f"| {i} | `{c['id']}` | {titles[c['source']]}{' (vocal-free stem)' if c['variant'] == 'stem' else ''} | "
             f"{mmss(c['src_in'])} → {mmss(c['src_out'])} | {mmss(c['out_in'])} → {mmss(c['out_out'])} | "
             f"{c['pitch_st']:+d} st | {bpm_note(c)} | {c['gain_db']:+.1f} dB |")
L += ["", "## Transitions (generated)", "",
      "Crossfade = overlap of the two clips. Bass swap = window in which the band below "
      f"{tl['xover_hz']} Hz is handed over (outgoing low band out / incoming low band in), so two bass lines never sound together. "
      "Chroma fit = cosine similarity of the pitch-class profiles either side of the join (1.0 = same harmony).", "",
      "| Out time | From → To | Joined on (source bar lines) | Crossfade | Bass swap (src s) | Chroma fit | Loudness before → after | Tempo |",
      "|---|---|---|---|---|---|---|---|"]
by = {c["id"]: c for c in clips}
for a, b in zip(clips, clips[1:]):
    r = chk.get((a["id"], b["id"]), {})
    xf = a["out_out"] - b["out_in"]
    pl = b["place"]
    join = f"{pl['clip']} {mmss(pl['clip_src'])} = {b['id']} {mmss(pl['src'])}" if "src" in pl else "-"
    sw = f"out {a['low_fade_out']} / in {b['low_fade_in']}" if a.get("low_fade_out") or b.get("low_fade_in") else "-"
    L.append(f"| {mmss(b['out_in'])} | `{a['id']}` → `{b['id']}` | {join} | {xf:.2f} s | {sw} | "
             f"{r.get('chroma_fit', float('nan')):.2f} | {r.get('lufs_before', float('nan')):.1f} → {r.get('lufs_after', float('nan')):.1f} LUFS | "
             f"{bpm(a):.1f} → {bpm(b):.1f} BPM |")
L += ["", "## Why each clip is there (from timeline.json)", ""]
for c in clips:
    L.append(f"- **`{c['id']}`** - {c['why']}")
open(os.path.join(HERE, "REPORT.md"), "w").write("\n".join(L) + "\n")
print("wrote REPORT.md")
