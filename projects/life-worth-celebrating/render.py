#!/usr/bin/env python3
"""Render timeline.json -> output/birthday_remix_final.{wav,mp3} + per-clip stems + Reaper project + report data.

Usage:  python render.py [--timeline timeline.json] [--out output]
Needs:  numpy scipy soundfile pyloudnorm pedalboard (Rubber Band time/pitch), ffmpeg on PATH.
"""
import argparse, json, os, subprocess, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln, pedalboard as pb
from scipy.signal import butter, sosfiltfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
PAD = 0.75  # seconds of context fed to the stretcher on each side


def decode(path, sr, cache):
    """Decode any input to float32 stereo at sr (soxr resampler), cached."""
    os.makedirs(cache, exist_ok=True)
    out = os.path.join(cache, os.path.splitext(os.path.basename(path))[0] + f"_{sr}.wav")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-af", "aresample=resampler=soxr:precision=28",
                        "-ar", str(sr), "-ac", "2", "-c:a", "pcm_f32le", out], check=True)
    return out


def load(path, sr):
    x, r = sf.read(path, dtype="float32", always_2d=True)
    if r != sr:
        x = resample_poly(x, sr, r, axis=0).astype(np.float32)
    return x


def shape(t, curve):
    t = np.clip(t, 0, 1)
    if curve == "linear":
        return t
    if curve == "exp":
        return t ** 3
    return np.sin(t * np.pi / 2)  # equal power


def ramp(ts, a, b, curve, rising):
    if a is None:
        return np.ones_like(ts)
    t = (ts - a) / max(b - a, 1e-6)
    return shape(t, curve) if rising else shape(1 - t, curve)


def eq_board(spec, sr):
    fx = []
    for kind, f, g in spec or []:
        if kind == "highpass": fx.append(pb.HighpassFilter(f))
        elif kind == "lowpass": fx.append(pb.LowpassFilter(f))
        elif kind == "lowshelf": fx.append(pb.LowShelfFilter(f, g))
        elif kind == "highshelf": fx.append(pb.HighShelfFilter(f, g))
        elif kind == "peak": fx.append(pb.PeakFilter(f, g, 0.9))
    return pb.Pedalboard(fx)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timeline", default=os.path.join(HERE, "timeline.json"))
    ap.add_argument("--out", default=os.path.join(HERE, "output"))
    a = ap.parse_args()
    tl = json.load(open(a.timeline))
    sr = tl["sample_rate"]; os.makedirs(a.out, exist_ok=True)
    cache = os.path.join(HERE, "cache")
    meter = pyln.Meter(sr)
    srcs = {}
    for k, s in tl["sources"].items():
        srcs[k] = {"mix": decode(os.path.join(HERE, s["file"]), sr, cache)}
        if s.get("stem"):
            srcs[k]["stem"] = os.path.join(HERE, s["stem"])
    audio_cache = {}

    def src_audio(k, variant):
        key = (k, variant)
        if key not in audio_cache:
            p = srcs[k].get(variant)
            if p is None or not os.path.exists(p):
                sys.exit(f"missing {variant} for {k}: run separate.py first")
            audio_cache[key] = load(p, sr)
        return audio_cache[key]

    tl["clips"] = [c for c in tl["clips"] if c.get("enabled", True)]
    clips = {c["id"]: c for c in tl["clips"]}
    lo_sos = butter(4, tl["xover_hz"], "low", fs=sr, output="sos")

    # 1) process each clip in source time: extract, pitch/stretch, EQ
    for c in tl["clips"]:
        x = src_audio(c["source"], c.get("variant", "mix"))
        st = c.get("stretch", 1.0); pt = c.get("pitch", 0)
        a0 = max(0.0, c["src_in"] - PAD); a1 = min(len(x) / sr, c["src_out"] + PAD)
        seg = x[int(a0 * sr):int(a1 * sr)]
        if st != 1.0 or pt != 0:
            y = pb.time_stretch(seg.T.copy(), sr, stretch_factor=st, pitch_shift_in_semitones=pt,
                                high_quality=True, transient_mode="mixed", preserve_formants=False).T
        else:
            y = seg.copy()
        y = eq_board(c.get("eq"), sr)(y.T.copy(), sr).T if c.get("eq") else y
        i0 = int(round((c["src_in"] - a0) / st * sr)); n = int(round((c["src_out"] - c["src_in"]) / st * sr))
        y = y[i0:i0 + n]
        if len(y) < n:
            y = np.pad(y, ((0, n - len(y)), (0, 0)))
        c["_y"] = y.astype(np.float64)
        c["_ts"] = c["src_in"] + np.arange(n) / sr * st  # source time of every output sample

    # 2) loudness-matched gain (measured on the clip body, before fades)
    def gain_of(c):
        if "_gain" in c:
            return c["_gain"]
        if "gain_from" in c:
            g = gain_of(clips[c["gain_from"]]) + c.get("gain_db", 0.0)
        else:
            ts = c["_ts"]; b0 = (c.get("fade_in") or [c["src_in"]] * 2)[1]; b1 = (c.get("fade_out") or [c["src_out"]] * 2)[0]
            body = c["_y"][(ts >= b0) & (ts <= b1)]
            lufs = meter.integrated_loudness(body) if len(body) > sr * 0.5 else -70
            c["_measured_lufs"] = lufs
            g = c["target_lufs"] - lufs + c.get("gain_db", 0.0)
        c["_gain"] = g
        return g

    # 3) envelopes (fades, bass-swap fades, gain automation) and placement
    def out_time(c, s):
        return c["_out0"] + (s - c["src_in"]) / c.get("stretch", 1.0)

    def place(c):
        if "_out0" in c:
            return
        p = c["place"]
        if "out" in p:
            c["_out0"] = tl["lead_in_s"] + p["out"]
        else:
            ref = clips[p["clip"]]; place(ref)
            c["_out0"] = out_time(ref, p["clip_src"]) - (p["src"] - c["src_in"]) / c.get("stretch", 1.0)

    total = 0
    for c in tl["clips"]:
        place(c); g = gain_of(c)
        ts = c["_ts"]; y = c["_y"]
        fi, fo = c.get("fade_in"), c.get("fade_out")
        cin = c.get("fade_curve_in", c.get("fade_curve", "equal_power")); cout = c.get("fade_curve_out", c.get("fade_curve", "equal_power"))
        env = ramp(ts, *(fi or [None, None]), cin, True) * ramp(ts, *(fo or [None, None]), cout, False)
        if c.get("gain_points"):
            gp = np.array(c["gain_points"]); env = env * 10 ** (np.interp(ts, gp[:, 0], gp[:, 1]) / 20)
        env *= 10 ** (g / 20)
        if c.get("low_fade_in") or c.get("low_fade_out"):
            lo = sosfiltfilt(lo_sos, y, axis=0); hi = y - lo
            lenv = env * ramp(ts, *(c.get("low_fade_in") or [None, None]), "equal_power", True) \
                       * ramp(ts, *(c.get("low_fade_out") or [None, None]), "equal_power", False)
            # low band: fades only where the low_* fade says, full-band fades still apply outside the swap window
            c["_out"] = hi * env[:, None] + lo * lenv[:, None]
        else:
            c["_out"] = y * env[:, None]
        c["_i0"] = int(round(c["_out0"] * sr))
        total = max(total, c["_i0"] + len(c["_out"]))

    tail = int(1.0 * sr)
    mix = np.zeros((total + tail, 2))
    for c in tl["clips"]:
        mix[c["_i0"]:c["_i0"] + len(c["_out"])] += c["_out"]

    # 4) master: gentle HPF, loudness to target, true-peak ceiling by gain only (no limiter -> dynamics kept)
    m = tl["master"]
    mix = pb.Pedalboard([pb.HighpassFilter(m["highpass_hz"])])(mix.T.astype(np.float32).copy(), sr).T.astype(np.float64)
    last = np.max(np.nonzero(np.abs(mix).max(1) > 10 ** (-90 / 20))[0]) + int(0.3 * sr)
    mix = mix[:last]
    lufs = meter.integrated_loudness(mix)
    gain = m["target_lufs"] - lufs
    tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max() + 1e-12) + gain
    if tp > m["true_peak_dbtp"]:
        gain -= tp - m["true_peak_dbtp"]
    mix *= 10 ** (gain / 20)
    for c in tl["clips"]:
        c["_out"] *= 10 ** (gain / 20)
    final_lufs = meter.integrated_loudness(mix)
    final_tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
    final_peak = 20 * np.log10(np.abs(mix).max())

    wav = os.path.join(a.out, "birthday_remix_final.wav"); mp3 = os.path.join(a.out, "birthday_remix_final.mp3")
    sf.write(wav, mix.astype(np.float32), sr, subtype="PCM_24")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "320k", "-ar", str(sr),
                    "-metadata", f"title={tl['title']}", mp3], check=True)

    # 5) per-clip stems + Reaper project (items already carry fades/gain/pitch, so the project is a re-arrangeable mix)
    cdir = os.path.join(a.out, "clips"); os.makedirs(cdir, exist_ok=True)
    rpp = ["<REAPER_PROJECT 0.1 \"6.0\"", f"  SAMPLERATE {sr} 0 0", "  TEMPO 89 4 4"]
    log = {"duration_s": len(mix) / sr, "integrated_lufs": final_lufs, "true_peak_dbtp": final_tp,
           "sample_peak_dbfs": final_peak, "master_gain_db": gain, "clips": []}
    for c in tl["clips"]:
        fn = f"{c['id']}.wav"; sf.write(os.path.join(cdir, fn), c["_out"].astype(np.float32), sr, subtype="PCM_24")
        pos = c["_i0"] / sr; ln = len(c["_out"]) / sr
        rpp += [f"  <TRACK", f"    NAME \"{c['id']}\"", "    <ITEM", f"      POSITION {pos:.6f}", f"      LENGTH {ln:.6f}",
                f"      NAME \"{c['id']}\"", "      <SOURCE WAVE", f"        FILE \"clips/{fn}\"", "      >", "    >", "  >"]
        log["clips"].append({k: c[k] for k in ("id", "source", "src_in", "src_out") } | {
            "variant": c.get("variant", "mix"), "pitch_st": c.get("pitch", 0), "stretch": c.get("stretch", 1.0),
            "out_in": pos, "out_out": pos + ln, "gain_db": c["_gain"] + gain, "measured_lufs": c.get("_measured_lufs"),
            "fade_in": c.get("fade_in"), "fade_out": c.get("fade_out"), "low_fade_in": c.get("low_fade_in"),
            "low_fade_out": c.get("low_fade_out"), "place": c["place"],
            "out_anchor": out_time(c, c["place"]["src"]) if "src" in c["place"] else pos, "why": c.get("why", "")})
    rpp.append(">")
    open(os.path.join(a.out, "birthday_remix.rpp"), "w").write("\n".join(rpp) + "\n")
    json.dump(log, open(os.path.join(a.out, "render_log.json"), "w"), indent=2, default=float)
    print(f"duration {len(mix)/sr:.2f}s  LUFS {final_lufs:.2f}  TP {final_tp:.2f} dBTP  peak {final_peak:.2f} dBFS  master gain {gain:+.2f} dB")
    for c in log["clips"]:
        print(f"  {c['id']:14s} out {c['out_in']:7.2f}-{c['out_out']:7.2f}  src {c['src_in']:7.2f}-{c['src_out']:7.2f}  "
              f"pitch {c['pitch_st']:+d}  x{c['stretch']:.4f}  gain {c['gain_db']:+.1f} dB")


if __name__ == "__main__":
    main()
