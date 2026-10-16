#!/usr/bin/env python3
"""Make the vocal-free stems timeline.json asks for (sources with a "stem" path) using MDX-Net via audio-separator.
Demucs is the first choice when its weights are reachable; in the build session they were blocked, so this uses
UVR-MDX-NET-Inst_HQ_3 (downloaded once from github.com/TRvlvr/model_repo releases into models/).
Usage: python separate.py"""
import json, os, subprocess, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = "UVR-MDX-NET-Inst_HQ_3.onnx"
URL = "https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models/" + MODEL
tl = json.load(open(os.path.join(HERE, "timeline.json")))
mdir = os.path.join(HERE, "models"); os.makedirs(mdir, exist_ok=True)
if not os.path.exists(os.path.join(mdir, MODEL)):
    urllib.request.urlretrieve(URL, os.path.join(mdir, MODEL))
for k, s in tl["sources"].items():
    if not s.get("stem") or os.path.exists(os.path.join(HERE, s["stem"])):
        continue
    src = os.path.join(HERE, s["file"]); wav = os.path.join(HERE, "cache", os.path.splitext(os.path.basename(src))[0] + ".wav")
    os.makedirs(os.path.dirname(wav), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ar", str(tl["sample_rate"]), "-ac", "2", "-c:a", "pcm_f32le", wav], check=True)
    subprocess.run(["audio-separator", wav, "--model_filename", MODEL, "--model_file_dir", mdir,
                    "--output_dir", os.path.join(HERE, "cache", "stems"), "--output_format", "WAV"], check=True)
    print("stem ready for", k)
