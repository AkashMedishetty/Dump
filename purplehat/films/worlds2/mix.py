"""WORLDS score: one pulse carried through every world (the sound of the mark), and on top of it each world's own
instrument playing one phrase in its own idiom, over one D-major progression. Every cut has a sound made of the
incoming medium (paper rip, CRT power-on, glass, ink drop…). The breath (ink wash) drops the pulse to silence.
Samples: VCSL (CC0), VSCO 2 CE (CC0), Salamander Grand (CC BY 3.0), FreePats (CC0/GPL-exception, see CREDITS)."""
import os, sys, json
import numpy as np
LIB = os.environ['LIB']; sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sampler as S
from sfx import SR, add, click, clack, whoosh, thump, pop, ding, noise, bp, lp, hp, brown, norm, t_, env_exp, limit
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; WORLDS = [e for e in ev['ev'] if e['type'] == 'world']
N = int(DUR * SR) + SR
R = np.random.default_rng(43)
B = .5   # beat

notes = []
def nt(t, inst, p, d=.5, v=.6, pan=0.0, gain=1.0, **kw): notes.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, gain=gain, **kw))
CH = {'D': ['D', 'F#', 'A', 'E'], 'Bm': ['B', 'D', 'F#', 'C#'], 'G': ['G', 'B', 'D', 'F#'], 'A': ['A', 'C#', 'E', 'B']}
PROG = ['D', 'Bm', 'G', 'A']
def ch(i, o, n=3): c = CH[PROG[i % 4]]; return [f'{c[k]}{o + (1 if k and S.midi(c[k] + "4") < S.midi(c[0] + "4") else 0)}' for k in range(n)]
def arp(t0, d, inst, i, o, step, v, gain=1, pan=0, pat=(0, 1, 2, 1), up=0):
    c = ch(i, o, 3) + [p[:-1] + str(int(p[-1]) + 1) for p in ch(i, o, 3)]; t, k = t0, 0
    while t < t0 + d - 1e-6: nt(t, inst, c[(pat[k % len(pat)] + up * (k // len(pat))) % 6], step * 1.6, v * (1.0 if k % 2 == 0 else .82), pan, gain); t += step; k += 1
def chord(t, inst, i, o, d, v, gain=1, n=3, spread=.4, **kw):
    for j, p in enumerate(ch(i, o, n)): nt(t, inst, p, d, v, -spread + 2 * spread * j / max(1, n - 1), gain, **kw)
def bass(t, inst, i, o, d, v, gain=1): nt(t, inst, CH[PROG[i % 4]][0] + str(o), d, v, 0, gain)

# ---------- synth voices (numpy) ----------
syn = np.zeros((N, 2), np.float32)
def tone(f, d, kind='sine', a=.004, tau=.3, vib=0.0, glide=None):
    tt = t_(d); fr = f * (1 + vib * np.sin(2 * np.pi * 5.5 * tt)) if glide is None else np.geomspace(glide, f, len(tt))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph)) * .5 if kind == 'square' else (2 * ((ph / (2 * np.pi)) % 1) - 1) * .5
    e = np.minimum(1, tt / a) * np.exp(-tt / tau); return (x * e).astype(np.float32)
def hz(p): return S.hz(p)

# ---------- the carried pulse ----------
rush0 = next(w['t'] for w in WORLDS if w['fn'] == 'spyTitles'); rush1 = next(w['t'] for w in WORLDS if w['fn'] == 'inkWash')
ink = next(w for w in WORLDS if w['fn'] == 'inkWash'); wc = next(w for w in WORLDS if w['fn'] == 'watercolor')
back_ = next(w for w in WORLDS if w['fn'] == 'backrooms'); glass = next(w for w in WORLDS if w['fn'] == 'glassProduct')
END = glass['t'] + 3.0
pulse = np.zeros((N, 2), np.float32)
t = 1.0
while t < END:
    if not (ink['t'] - .02 <= t < wc['t'] - .02) and not (back_['t'] <= t < back_['t'] + back_['dur']):
        add(pulse, tone(52, .3, tau=.09) * .42, t, .5); add(pulse, tone(104, .12, tau=.04) * .35, t, .5); add(pulse, tone(156, .08, tau=.03) * .15, t, .5)
        add(pulse, click(1.8, .25), t + .25, .25, pan=.3)
        if rush0 <= t < rush1: [add(pulse, click(3.0, .12), t + k * .125, .2, pan=-.3) for k in (1, 3)]
    t += B

# ---------- one phrase per world ----------
def world(w, i):
    t0, d, fn = w['t'], w['dur'], w['fn']
    if fn == 'darkKeynote':
        add(syn, click(.6, .3), 0.0, .3); add(syn, click(.6, .3), .5, .3)
        add(syn, tone(48, 1.2, tau=.5) * .8, 1.0, .35); chord(1.0, 'marimba', 0, 3, 1.2, .55, n=4); chord(1.0, 'vibraphone_bowed', 0, 4, 2.4, .35, gain=.6, n=4, attack=.4, release=1.0)
        arp(1.5, 2.0, 'marimba', 0, 4, .25, .42, .8)
    elif fn == 'hologram': arp(t0, d, 'vibraphone_hard', i, 5, .125, .35, .55, pat=(0, 2, 4, 2, 1, 3, 5, 3)); add(syn, tone(880, 1.2, tau=.6, glide=220) * .08, t0, .5)
    elif fn == 'asciiCrt':
        c = ch(i, 3); [add(syn, tone(hz(c[k % 3]) * (2 if k % 4 == 3 else 1), .1, 'square', tau=.05) * .12, t0 + k * .125, .5, pan=.2) for k in range(int(d / .125))]
        [add(syn, click(2.5, .1), t0 - .2 + k * .03, .3, pan=-.4) for k in range(40)]
    elif fn == 'blueprint': arp(t0, d, 'violins_pizz', i, 4, .25, .55, pat=(0, 2, 1, 2)); bass(t0, 'cellos_pizz', i, 2, .5, .6); bass(t0 + 1, 'cellos_pizz', i, 2, .5, .5)
    elif fn == 'artDeco':
        for k in range(4): bass(t0 + k * B, 'piano', i, 2, .3, .55) if k % 2 == 0 else chord(t0 + k * B, 'piano', i, 4, .25, .45)
        for k, p in enumerate(['A4', 'B4', 'D5']): nt(t0 + .25 + k * .5, 'trumpet_mute', p, .4, .6, .2)
    elif fn == 'stainedGlass': chord(t0, 'organ', i, 3, d, .5, gain=.6, n=4); nt(t0, 'tubular_bells', 'D5', 2, .5, -.2, .6)
    elif fn == 'paperLantern': arp(t0, d, 'harp', i, 4, .125, .45, pat=(0, 1, 2, 3, 4, 5, 4, 3)); nt(t0 + 1, 'hand_chimes', 'A5', 1.5, .4, .3, .6)
    elif fn == 'shadowPuppet':
        nt(t0, 'gong2', None, 2, .5, 0, .5); [nt(t0 + k * B, 'woodblock', None, .2, .6 if k % 2 == 0 else .4, .4) for k in range(4)]
        for k, p in enumerate(['A4', 'B4', 'D5', 'E5', 'D5']): nt(t0 + .25 + k * .3, 'dan_tranh', p, .6, .6, -.2)
    elif fn == 'papercut': nt(t0, 'clash', None, 1, .35, 0, .5); [nt(t0 + k * .25, 'dan_tranh', p, .5, .55, .2) for k, p in enumerate(['D5', 'E5', 'F#5', 'A5', 'B5', 'A5', 'F#5', 'E5'])]
    elif fn == 'woodcut': nt(t0, 'timpani', 'D2', 1.5, .8, 0, .8); nt(t0 + 1, 'timpani', 'A1', 1, .6, 0, .7); nt(t0, 'cellos', 'D2', 2, .55, 0, .6, attack=.05)
    elif fn == 'engraving': arp(t0, d, 'harpsichord', i, 4, .125, .5, .7, pat=(0, 2, 1, 2, 0, 2, 1, 3))
    elif fn == 'silentFilm':
        for k in range(4): bass(t0 + k * B, 'honky_tonk', i, 2 if k % 2 == 0 else 3, .3, .55) if k % 2 == 0 else chord(t0 + k * B, 'honky_tonk', i, 4, .25, .45)
        for k, p in enumerate(['F#5', 'G5', 'A5', 'D6', 'A5', 'F#5']): nt(t0 + .125 + k * .3, 'honky_tonk', p, .25, .55, .2)
    elif fn == 'spyTitles': chord(t0, 'trombone', i, 3, .4, .8, n=3); chord(t0, 'horn', i, 4, .4, .7, n=3); [nt(t0 + k * .25, 'conga', None, .2, .5 + .2 * (k % 2), .4) for k in range(4)]
    elif fn == 'silkscreen': chord(t0, 'strumstick', i, 4, .8, .6); chord(t0 + .5, 'strumstick', i, 4, .5, .5); [nt(t0 + k * .125, 'shaker', 'down', None, .3, .3, .5) for k in range(8)]
    elif fn == 'risograph': nt(t0, 'glockenspiel', 'F#6', .4, .5); nt(t0 + .25, 'glockenspiel', 'A6', .4, .45); nt(t0 + .5, 'claps', 'group', None, .5, 0, .6)
    elif fn == 'dossier': nt(t0, 'snare2', None, .3, .6); add(syn, thump(1, 70), t0 + .37, .7); [add(syn, clack(1.4, .2), t0 + .05 + k * .07, .3, pan=.3) for k in range(4)]
    elif fn == 'swiss': [nt(t0 + k * .125, 'piano', p, .1, .6, (-.3 if k % 2 else .3)) for k, p in enumerate(['D4', 'D5', 'A4', 'A5', 'F#4', 'F#5', 'E4', 'E5'])]
    elif fn == 'pictogram': [nt(t0 + k * .25, 'toms', k % 3, .3, .6) for k in range(4)]; nt(t0 + .5, 'flute_stac', 'A5', .2, .6, .3)
    elif fn == 'gameShow': [nt(t0 + k * .0625, 'xylophone', p, .2, .55) for k, p in enumerate(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'])]; nt(t0 + .5, 'cowbell', None, .3, .5, .3); nt(t0 + .55, 'glockenspiel', 'D7', .6, .6)
    elif fn == 'microgame': [add(syn, tone(hz(p), .08, 'square', tau=.05) * .14, t0 + k * .0625, .5) for k, p in enumerate(['D5', 'F#5', 'A5', 'D6'])]; add(syn, thump(.9, 90), t0 + .55, .6); add(syn, tone(1760, .2, 'square', tau=.1) * .1, t0 + .6, .5)
    elif fn == 'rubberHose': [nt(t0 + k * .25, 'tuba_stac' if k % 2 == 0 else 'clarinet_stac', ('D2' if k % 4 == 0 else 'A1') if k % 2 == 0 else ch(i, 4)[k % 3], .2, .6) for k in range(4)]
    elif fn == 'midcentury': [nt(t0 + k * .25, 'contrabass_pizz', p, .3, .6) for k, p in enumerate(['G1', 'A1', 'B1', 'D2'])]; nt(t0 + .125, 'vibraphone', 'B4', .6, .45, .2); nt(t0 + .375, 'vibraphone', 'F#5', .6, .4, .2); [nt(t0 + k * .25, 'hihat', None, .1, .3, .4) for k in range(4)]
    elif fn == 'scifiToon': add(syn, tone(hz('A5'), 1.0, tau=.8, vib=.012, glide=hz('A4')) * .14, t0, .5); add(syn, tone(hz('E5'), .5, tau=.4, vib=.02) * .08, t0 + .5, .5, pan=.3)
    elif fn == 'celAnime': add(syn, (tone(hz('A3'), .5, 'saw', tau=.35) + tone(hz('C#4'), .5, 'saw', tau=.35) + tone(hz('E4'), .5, 'saw', tau=.35)) * .12, t0, .6); [nt(t0 + k * .125, 'electric_bass', 'A1' if k % 2 == 0 else 'A2', .1, .6) for k in range(8)]
    elif fn == 'pixelRpg': [add(syn, tone(hz(p), .12, 'square', tau=.09) * .12, t0 + k * .125, .5) for k, p in enumerate(['D5', 'F#5', 'A5', 'B5', 'A5', 'F#5', 'A5', 'D6'])]; [add(syn, bp(noise(.05), 2000, 8000) * .2 * np.exp(-t_(.05) / .015), t0 + k * .25 + .125, .5) for k in range(4)]
    elif fn == 'hd2d': [nt(t0 + k * .04, 'harp', p, .6, .5) for k, p in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6'])]; chord(t0, 'violins', i, 4, 1.0, .5, n=3, attack=.05)
    elif fn == 'lowpoly': [nt(t0 + k * .1 + .2, 'marimba', p, .3, .55) for k, p in enumerate(['D5', 'F#5', 'A5', 'B5', 'D6'])]
    elif fn == 'isoInfo': [nt(t0 + k * .125, 'mbira', p, .3, .55) for k, p in enumerate(['A4', 'D5', 'F#5', 'D5', 'A4', 'E5', 'F#5', 'A5'])]
    elif fn == 'brickToy': [add(syn, clack(.8 + .05 * k, .25), t0 + .1 + k * .06, .35, pan=(k % 5) / 2.5 - 1) for k in range(9)]; nt(t0 + .5, 'glockenspiel', 'D6', .3, .5)
    elif fn == 'paperPopup': add(syn, whoosh(.3, .4), t0 - .05, .4); chord(t0 + .2, 'accordion', i, 4, .6, .5)
    elif fn == 'screencast': [add(syn, click(2.2, .2), t0 + k * .1, .3) for k in range(3)]; add(syn, click(1.2, .4), t0 + .55, .4); nt(t0 + .7, 'hand_chimes', 'A5', .6, .45)
    elif fn == 'dataviz': [nt(t0 + k * .25, 'cellos_pizz', p, .3, .6) for k, p in enumerate(['A2', 'E3', 'A3', 'C#4'])]; add(syn, bp(noise(.6), 2500, 7000) * .08 * np.sin(np.pi * t_(.6) / .6), t0, .5)
    elif fn == 'whiteboard': add(syn, bp(noise(.5), 1500, 4000) * .1 * (np.sin(2 * np.pi * 9 * t_(.5)) > 0), t0, .5); [nt(t0 + k * .25, 'ukulele', p, .3, .5) for k, p in enumerate(['D4', 'F#4', 'A4', 'D5'])]
    elif fn == 'crayonBook': [nt(t0 + k * .25, 'recorder', p, .25, .55) for k, p in enumerate(['A4', 'B4', 'A4', 'F#4'])]; chord(t0, 'ukulele', i, 4, .5, .4)
    elif fn == 'inkWash':
        for k, p in enumerate(['D4', 'E4', 'F#4', 'A4']): nt(t0 + .5 + k * .5, 'dan_tranh', p, 1.6, .55, -.3 + .2 * k, .9)
        nt(t0 + 2.8, 'woodblock', None, .2, .5, .3); nt(t0 + 2.9, 'dan_tranh', 'D5', 2.0, .4, .2, .8)
    elif fn == 'watercolor': arp(t0, d, 'guitar_nylon', i, 3, .25, .5, pat=(0, 2, 1, 3)); [nt(t0 + .5 + k * .5, 'flute', p, .5, .45, .2, .7) for k, p in enumerate(['F#5', 'E5', 'D5'])]
    elif fn == 'urbanSketch': [nt(t0 + k * .25, 'accordion', p, .25, .5, .2) for k, p in enumerate(['B4', 'C#5', 'D5', 'F#5', 'E5', 'D5', 'C#5', 'B4'])]; chord(t0, 'strumstick', i, 3, .5, .4); chord(t0 + 1, 'strumstick', i, 3, .5, .4)
    elif fn == 'ukiyoe': nt(t0, 'frame_drum', None, .5, .5); nt(t0 + 1, 'frame_drum', None, .5, .4); [nt(t0 + k * .25, 'dan_tranh', p, .5, .5, -.2) for k, p in enumerate(['G4', 'A4', 'B4', 'D5', 'E5'])]; nt(t0 + .5, 'ocarina', 'D5', 1.3, .45, .2, .7)
    elif fn == 'tiltShift': [nt(t0 + k * .0625, 'piano', ch(i, 5)[k % 3], .08, .4, (k % 4) / 2 - .75) for k in range(32)]; [nt(t0 + k * .125, 'shaker', 'down', None, .3, .3, .5) for k in range(16)]
    elif fn == 'impasto': nt(t0, 'tenor_sax', 'A3', 1.8, .5, .1, .7); chord(t0, 'piano', i, 3, 2, .35, n=4); add(syn, lp(noise(2.2), 6000) * .04, t0, 1.0)
    elif fn == 'backrooms':
        tt = t_(d); hum = (np.sin(2 * np.pi * 120 * tt) * .5 + np.sin(2 * np.pi * 240 * tt) * .3 + np.sign(np.sin(2 * np.pi * 60 * tt)) * .1) * .06
        add(syn, hum.astype(np.float32), t0, 1.0); nt(t0, 'organ_soft', 'D3', d, .3, -.2, .5); nt(t0, 'organ_soft', 'D#3', d, .25, .2, .45)
    elif fn == 'oneLine': [nt(t0 + k * .25, 'piano', p, .3, .5) for k, p in enumerate(['D5', 'A4', 'F#5', 'E5', 'D5', 'B4', 'A4', 'D5'])]
    elif fn == 'glassProduct':
        add(syn, tone(41, 2.0, tau=.9) * .9, t0, .35); nt(t0, 'gran_cassa', None, 1, .45, 0, .6)
        chord(t0, 'vibraphone_bowed', 0, 4, 3.0, .45, n=4, attack=.3, release=1.5); chord(t0, 'violins', 0, 4, 3.0, .35, gain=.6, n=4, attack=.4, release=1.2)
        nt(t0, 'hand_chimes', 'D6', 2, .5, .3, .6); nt(t0 + .6, 'hand_chimes', 'A6', 1.5, .4, -.3, .5)
        e = END; chord(e, 'hand_chimes', 0, 5, 3, .5, gain=.7); chord(e, 'vibraphone_bowed', 0, 4, 6.0, .35, n=4, attack=1.0, release=1.6); chord(e, 'violins', 0, 3, 5.5, .25, gain=.5, n=3, attack=1.2, release=1.5)
        nt(e + 1.0, 'hand_chimes', 'F#6', 1.5, .35, .2, .5)
        for i, p in enumerate(['D6', 'F#6', 'A6']): nt(e + 1.1 + i * .25 + .5, 'glockenspiel', p, .4, .55, -.4 + .4 * i, .7); add(syn, click(1.6, .25), e + 1.1 + i * .25 + .5, .4, pan=-.4 + .4 * i)

for i, w in enumerate(WORLDS): world(w, i)

# ---------- cut sounds, made of the incoming medium ----------
def cut(kind, t):
    if kind == 'iris': add(syn, whoosh(.45, .35), t - .3, .5)
    elif kind == 'irisIn': add(syn, click(.7, .5), t, .5); add(syn, bp(noise(.4), 800, 4000) * .05 * (np.sin(2 * np.pi * 24 * t_(.4)) > .6), t, .5)
    elif kind == 'curtain': add(syn, lp(noise(.7), 1800) * .12 * np.sin(np.pi * t_(.7) / .7), t - .35, .5)
    elif kind == 'wipe': add(syn, whoosh(.3, .4), t - .2, .5)
    elif kind == 'wipeUp': add(syn, hp(noise(.35), 2500) * .08 * np.sin(np.pi * t_(.35) / .35), t - .2, .5)
    elif kind == 'crt': add(syn, tone(60, .3, glide=3000, tau=.12) * .15, t - .1, .5); add(syn, click(1.0, .4), t - .1, .4)
    elif kind == 'blocks': [add(syn, tone(hz('D6') * (1 + k % 3 * .5), .04, 'square', tau=.02) * .1, t - .2 + k * .04, .5, pan=R.uniform(-.6, .6)) for k in range(9)]
    elif kind == 'shards': [nt(t - .15 + k * .03, 'hand_chimes', p, .6, .35, R.uniform(-.7, .7), .5) for k, p in enumerate(['A6', 'E6', 'F#6', 'D7', 'B6'])]
    elif kind == 'tear': d = .4; x = hp(noise(d), 1500) * (R.random(int(d * SR)) > .7) * .3 * np.minimum(1, t_(d) / .05) * np.exp(-t_(d) / .25); add(syn, x.astype(np.float32), t - .2, .5)
    elif kind == 'bands': add(syn, thump(.5, 110), t, .4); add(syn, click(.9, .3), t, .4)
    elif kind == 'rings': add(syn, tone(1320, 1.0, tau=.35) * .08, t - .2, .5)
    elif kind == 'shutter': add(syn, click(1.3, .4), t - .1, .4); add(syn, click(1.1, .35), t + .02, .4)
    elif kind == 'page': add(syn, bp(noise(.3), 600, 5000) * .14 * np.sin(np.pi * t_(.3) / .3) ** 2, t - .15, .5)
    elif kind == 'ink': add(syn, tone(900, .25, glide=1800, tau=.08) * .12, t - .2, .5)
    elif kind == 'line': add(syn, bp(noise(.5), 3000, 8000) * .05, t - .3, .5)
for w in WORLDS:
    if w.get('tx'): cut(w['tx'], w['t'])

music = S.render(notes, DUR + 2, master=False)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
mix = S.room(music * .9 + syn, size=.42, mix=.16) + pulse * .55
# room tone under everything; the breath's first half-second is near silence
rt = lp(brown(N / SR), 300) * .006; mix[:, 0] += rt; mix[:, 1] += np.roll(rt, 700)
i0, i1 = int(ink['t'] * SR), int((ink['t'] + .45) * SR); mix[i0:i1] *= np.linspace(1, .15, i1 - i0)[:, None]
# fade the tail
tl = int((DUR - 1.2) * SR); mix[tl:] *= np.linspace(1, 0, len(mix) - tl)[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)[:int(DUR * SR)]
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
used = sorted({n['inst'] for n in notes}); json.dump(used, open(os.path.join(HERE, 'out', 'instruments.json'), 'w'))
print('mix', mix.shape, 'peak', float(np.abs(mix).max()), 'instruments', len(used))
