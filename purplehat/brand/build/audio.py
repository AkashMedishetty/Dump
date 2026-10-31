"""Sound design for the logo animations, driven by the same cue list the scene pages expose (window.CUES).

python build/audio.py animation/audio/<scene>.cues.json  ->  animation/audio/<scene>.wav (48 kHz, -16 LUFS) + .m4a

Palette: CC0 marimba (VCSL) on every dot landing, rising G-major triad P -> h -> E; ghost notes on the bounces;
soft filtered whooshes for strokes; vibraphone + hand-chime sign-off under the wordmark. Needs the CC0 sampler from
lemo-opuscar (set LEMO_ROOT); without it, falls back to pure numpy synthesis.
"""
import json, os, subprocess, sys, re
import numpy as np
import soundfile as sf

LEMO = os.environ.get('LEMO_ROOT', '/home/user/lemomo-ai/lemo-opuscar')
sys.path.insert(0, LEMO)
try:
    from core.audio import sampler as S
    from core.audio.sfx import SR, add, limit, compress, whoosh, click, lp, hp, t_, env_exp, noise, norm
    S.seed(20261016)
    HAVE_SAMPLES = True
except Exception as e:  # pragma: no cover
    print('  [audio] sampler unavailable, synth fallback:', e); HAVE_SAMPLES = False
    SR = 48000

NOTES = ['G5', 'B5', 'D6']          # P, h, E
PAN = {'P': -0.35, 'h': 0.0, 'E': 0.35, 'h-stem': -0.05, 'h-arch': 0.05, 'E-top': 0.3, 'E-bowl': 0.3, '': 0.0}


def mallet(pitch, dur, vel):
    if HAVE_SAMPLES: return S.note('marimba', pitch, dur, vel=vel)
    pc = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}[pitch[0]]; m = 12 * (int(pitch[-1]) + 1) + pc
    f = 440 * 2 ** ((m - 69) / 12); tt = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / .05)) * np.exp(-tt / .25) * vel


def body(v=1.0):
    """the soft 'pop' of a dot touching down: short pitched-down sine + a little air"""
    d = .09; tt = t_(d); f = 210 * np.exp(-tt / .03) + 90
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .025) + hp(noise(d), 3000) * env_exp(d, .003) * .15
    return norm(x) * v


def soft_whoosh(d, v=1.0):
    return lp(whoosh(max(.22, d), 1.0), 2600) * v


def pad(duration, gain):
    """warm G-major bed (detuned saws, low-passed, slow swell) so the sting has body between the hits"""
    tt = np.arange(int(duration * SR)) / SR; out = np.zeros((len(tt), 2))
    for j, f in enumerate([98.0, 146.83, 196.0, 246.94]):          # G2 D3 G3 B3
        for ch, det in enumerate((-0.11, 0.11)):
            ph = (f + det * (j + 1)) * tt + 0.37 * j; out[:, ch] += (2 * (ph % 1) - 1) / (1 + j * 0.5)
    out = np.stack([lp(lp(out[:, c], 700), 900) for c in range(2)], 1)
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (duration - tt) / 0.8) * (0.85 + 0.15 * np.sin(2 * np.pi * tt / 3.1))
    return (out / np.abs(out).max() * env[:, None] * gain).astype(np.float32)


def build(cues, duration):
    n = int((duration + 0.05) * SR); buf = np.zeros((n, 2), np.float32)
    buf[:int(duration * SR)] += pad(duration, 0.13)
    for c in cues:
        t, k, v, pid = c['t'], c['kind'], c.get('v', 1.0), c.get('id', '') or ''
        i = c.get('i', 0) or 0; pan = PAN.get(pid, 0.0)
        if k == 'land':
            add(buf, mallet(NOTES[i % 3], .9, .78), t - 0.004, .72, pan)
            add(buf, body(1), t, .22, pan)
        elif k == 'bounce':
            add(buf, mallet(NOTES[i % 3], .25, .3 + .4 * v), t, .5 * v + .08, pan)
            add(buf, body(1), t, .18 * v, pan)
        elif k == 'tick':
            add(buf, click(1.25, 1.0), t, .12 * v + .03, pan)
            add(buf, body(1), t, .12 * v, pan)
        elif k == 'whoosh':
            dd = c.get('dur', .4); add(buf, soft_whoosh(dd + .1), t - .05, .11 * v, c.get('pan', pan))
        elif k == 'rise':
            add(buf, soft_whoosh(c.get('dur', .5) + .15), t - .05, .07, 0)
            if HAVE_SAMPLES:
                for j, p in enumerate(['G4', 'D5', 'B5']):
                    add(buf, S.note('vibraphone', p, 1.4, vel=.45), t + .08 + j * .045, .55, (j - 1) * .3)
                add(buf, S.note('hand_chimes', 'G6', 1.2, vel=.4), t + .3, .28, .2)
        elif k == 'pop':
            add(buf, mallet('D5', .7, .7), t, .9, -.1); add(buf, body(1), t, .35, -.1)
        elif k == 'toggle':
            add(buf, click(1.0, 1.0), t, .22, .15)
            if HAVE_SAMPLES: add(buf, S.note('glockenspiel', 'G6', .8, vel=.5), t + .01, .3, .15)
            add(buf, mallet('G5', .6, .6), t, .55, .15)
    if HAVE_SAMPLES:
        buf = S.room(buf, size=.32, mix=.16).astype(np.float32)
        # gentle bus compression (linked stereo) so the mallet transients don't all land on the limiter
        mono = np.abs(buf).max(1); g = compress(mono, thr=.18 * mono.max(), ratio=2.5, att=.003, rel=.12) / np.maximum(mono, 1e-9)
        buf = buf * np.clip(g, 0, 1)[:, None]
    f = int(.25 * SR); buf[-f:] *= np.linspace(1, 0, f)[:, None]
    return buf[:int(duration * SR)]


def measure(src):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    return float(json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)[-1])['input_i'])


def loudnorm(src, dst, I=-16.0, TP=-1.5, LRA=11.0):
    """two-pass EBU R128 normalisation (linear when possible) -> 48 kHz 24-bit wav"""
    flt = f'loudnorm=I={I}:TP={TP}:LRA={LRA}'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', flt + ':print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)[-1])
    f2 = (f'{flt}:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}'
          f':measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true')
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-af', f2, '-ar', '48000', '-c:a', 'pcm_s24le', dst], check=True)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', dst, '-af', flt + ':print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    out = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)[-1])
    return float(m['input_i']), float(out['input_i']), float(out['input_tp'])


if __name__ == '__main__':
    for path in sys.argv[1:]:
        spec = json.load(open(path)); base = path.replace('.cues.json', '')
        raw = base + '.raw.wav'; mix = build(spec['cues'], spec['duration'])
        sf.write(raw, mix, SR, subtype='FLOAT')
        # pre-gain towards -16 LUFS and catch the transient peaks with a look-ahead limiter, so the final
        # loudnorm pass can stay linear (pure gain, no pumping) within the -1.5 dBTP ceiling
        for _ in range(2):
            I = measure(raw); mix = mix * 10 ** ((-15.6 - I) / 20)
            pk = np.abs(mix).max()
            if HAVE_SAMPLES: mix = np.stack([limit(mix[:, ch], ceil=.72) for ch in range(2)], 1)
            print(f'    limiter: peak {pk:.2f} -> .72 ({20 * np.log10(max(pk, .72) / .72):.1f} dB max gain reduction)')
            sf.write(raw, mix.astype(np.float32), SR, subtype='FLOAT')
        before, after, tp = loudnorm(raw, base + '.wav'); os.remove(raw)
        subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', base + '.wav', '-c:a', 'aac', '-b:a', '192k', base + '.m4a'], check=True)
        print(f'  {os.path.basename(base)}: {before:.1f} -> {after:.1f} LUFS, true peak {tp:.1f} dBTP')
