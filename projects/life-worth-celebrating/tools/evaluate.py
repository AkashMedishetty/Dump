#!/usr/bin/env python3
"""Objective checks on a render: loudness curve, peaks, transition key/bass/tempo checks, overview plot.
Usage: python tools/evaluate.py [output_dir]"""
import json, os, sys
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "output")
log = json.load(open(os.path.join(out, "render_log.json")))
mix, sr = sf.read(os.path.join(out, "birthday_remix_final.wav"), always_2d=True)
clips = {c["id"]: sf.read(os.path.join(out, "clips", c["id"] + ".wav"), always_2d=True)[0] for c in log["clips"]}
meta = {c["id"]: c for c in log["clips"]}
meter = pyln.Meter(sr, block_size=3.0)

def st_lufs(x, win=3.0, hop=0.5):
    t, v = [], []
    for s in np.arange(0, len(x) / sr - win, hop):
        seg = x[int(s * sr):int((s + win) * sr)]
        t.append(s + win / 2); v.append(meter.integrated_loudness(seg) if np.abs(seg).max() > 1e-5 else -70)
    return np.array(t), np.array(v)

def chroma(x):
    y = librosa.resample(x.mean(1), orig_sr=sr, target_sr=22050)
    if len(y) < 4096: return None
    c = librosa.feature.chroma_cqt(y=y, sr=22050).mean(1); return c / (np.linalg.norm(c) + 1e-9)

def low_db(x):
    S = np.abs(librosa.stft(x.mean(1), n_fft=8192, hop_length=2048)); f = librosa.fft_frequencies(sr=sr, n_fft=8192)
    return 10 * np.log10((S[(f > 25) & (f < 180)] ** 2).sum(0).mean() + 1e-12)

def tempo(x):
    y = librosa.resample(x.mean(1), orig_sr=sr, target_sr=22050)
    t = librosa.feature.tempo(y=y, sr=22050, start_bpm=95)[0]; return float(t)

def seg_of(cid, t0, t1):
    c = meta[cid]; i0 = int((t0 - c["out_in"]) * sr); i1 = int((t1 - c["out_in"]) * sr)
    a = clips[cid][max(i0, 0):max(i1, 0)]; return a

print(f"duration {log['duration_s']:.2f}s | integrated {log['integrated_lufs']:.2f} LUFS | TP {log['true_peak_dbtp']:.2f} dBTP | "
      f"sample peak {20*np.log10(np.abs(mix).max()):.2f} dBFS | clipped samples {(np.abs(mix) >= 0.999).sum()}")
order = [c["id"] for c in sorted(log["clips"], key=lambda c: c["out_in"])]
rep = []
for a, b in zip(order, order[1:]):
    t0, t1 = meta[b]["out_in"], min(meta[a]["out_out"], meta[b]["out_out"])
    if t1 - t0 < 0.05: continue
    xa, xb = seg_of(a, t0, t1), seg_of(b, t0, t1)
    ca, cb = chroma(seg_of(a, t0 - 2, t1)), chroma(seg_of(b, t0, t1 + 2))
    keyfit = float(ca @ cb) if ca is not None and cb is not None else float("nan")
    la, lb = low_db(xa), low_db(xb)
    pre, post = seg_of(a, t0 - 6, t0), seg_of(b, t1, t1 + 6)
    lpre = pyln.Meter(sr).integrated_loudness(pre) if len(pre) > sr else float("nan")
    lpost = pyln.Meter(sr).integrated_loudness(post) if len(post) > sr else float("nan")
    rep.append(dict(frm=a, to=b, at=t0, overlap=t1 - t0, chroma_fit=keyfit, low_out_db=la, low_in_db=lb,
                    lufs_before=lpre, lufs_after=lpost, tempo_before=tempo(pre) if len(pre) > sr * 3 else None,
                    tempo_after=tempo(post) if len(post) > sr * 3 else None))
for r in rep:
    print(f"{r['frm']:>14s} -> {r['to']:<14s} @{r['at']:6.2f}s overlap {r['overlap']:4.2f}s  chroma-fit {r['chroma_fit']:.2f}  "
          f"bass out/in {r['low_out_db']:6.1f}/{r['low_in_db']:6.1f} dB  LUFS {r['lufs_before']:6.1f} -> {r['lufs_after']:6.1f}  "
          f"tempo {r['tempo_before'] or 0:5.1f} -> {r['tempo_after'] or 0:5.1f}")
json.dump(rep, open(os.path.join(out, "transition_checks.json"), "w"), indent=2)

t, v = st_lufs(mix)
y = librosa.resample(mix.mean(1), orig_sr=sr, target_sr=22050)
fig, ax = plt.subplots(2, 1, figsize=(18, 8), sharex=True)
S = librosa.power_to_db(librosa.feature.melspectrogram(y=y, sr=22050, n_mels=128, fmax=8000), ref=np.max)
ax[0].imshow(S, aspect="auto", origin="lower", extent=[0, len(y) / 22050, 0, 128], cmap="magma")
ax[1].plot(t, v); ax[1].set_ylim(-40, -8); ax[1].set_ylabel("short-term LUFS (3 s)"); ax[1].grid(alpha=.3)
for c in log["clips"]:
    for x in (c["out_in"],):
        for a_ in ax: a_.axvline(x, color="c", lw=.8)
    ax[1].text(c["out_in"] + .3, -10, c["id"], fontsize=8, rotation=0)
ax[1].set_xticks(np.arange(0, len(y) / 22050, 5)); ax[1].set_xlabel("output time (s)")
plt.tight_layout(); plt.savefig(os.path.join(out, "overview.png"), dpi=70)
print("short-term LUFS max", v.max().round(1), "at", t[v.argmax()], "| min after 3s", v[t > 3].min().round(1))
