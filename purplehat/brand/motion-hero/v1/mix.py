"""PhE hero score: bright mallets over a light D-major groove; every dot pop, hop, landing and wipe is hit on its frame.
Samples: VCSL (CC0), VSCO 2 CE (CC0), Salamander Grand (CC BY 3.0), FreePats (CC0/GPL-exception)."""
import os, sys, json
import numpy as np
LIB = os.environ['LIB']; sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sampler as S
from sfx import SR, add, click, whoosh, thump, pop, noise, bp, lp, hp, brown, t_, limit
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; EV = ev['ev']; N = int(DUR * SR) + SR
R = np.random.default_rng(7)
notes = []
def nt(t, inst, p, d=.5, v=.6, pan=0.0, gain=1.0): notes.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, gain=gain))
syn = np.zeros((N, 2), np.float32)
def tone(f0, f1, d, tau=.3, a=.004, kind='sine'):
    tt = t_(d); fr = np.geomspace(f0, f1, len(tt)); ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) if kind == 'sine' else np.sin(ph) + .3 * np.sin(2 * ph)
    return (x * np.minimum(1, tt / a) * np.exp(-tt / tau)).astype(np.float32)
def swell(d, lo, hi, g=.12):
    x = bp(noise(d), lo, hi) * np.sin(np.pi * np.minimum(1, t_(d) / d) / 1) ** 2 * g; return x.astype(np.float32)

CH = {'D': ['D', 'F#', 'A'], 'Bm': ['B', 'D', 'F#'], 'G': ['G', 'B', 'D'], 'A': ['A', 'C#', 'E']}
def arp(t0, t1, chs, inst, o, step, v, gain=1.0, pan=.3):
    t, k = t0, 0
    while t < t1 - 1e-6:
        c = CH[chs[int((t - t0) // 1.0) % len(chs)]]; pat = [0, 1, 2, 1, 0, 2, 1, 2]; i = pat[k % 8]
        nt(t, inst, c[i] + str(o + (1 if i and 'CDEFGAB'.index(c[i][0]) < 'CDEFGAB'.index(c[0][0]) else 0)), step * 1.8, v * (1 if k % 2 == 0 else .78), pan * (1 if k % 2 else -1), gain)
        t += step; k += 1

for e in EV:
    t, ty, i = e['t'], e['type'], e.get('i', 0); v = e.get('v', 1.0)
    if ty == 'pop': nt(t, 'marimba', ['D5', 'F#5', 'A5'][i], .6, .7, (i - 1) * .4); add(syn, pop(.5), t, .35, pan=(i - 1) * .4)
    elif ty == 'hop': nt(t, 'xylophone', ['A5', 'B5', 'D6'][i] if v == 1 else ['F#5', 'A5', 'B5'][i], .4, .5 * v, (i - 1) * .4, .7); add(syn, click(1.4, .25 * v), t, .3)
    elif ty == 'swell': add(syn, whoosh(.75, .7), t - .05, .5); add(syn, tone(110, 440, .8, tau=.6) * .12, t, .5); nt(t + .62, 'timpani', 'D2', 1.5, .45, 0, .8)
    elif ty == 'split': [nt(t + k * .08, 'marimba', p, .5, .55, (-1) ** k * .5) for k, p in enumerate(['A4', 'D5'])]
    elif ty == 'label': nt(t, 'hand_chimes', 'A6', 1.2, .35, .3, .5)
    elif ty == 'merge': add(syn, whoosh(.55, .45), t + .1, .4)
    elif ty == 'land': add(syn, thump(.6, 90), t, .5); [nt(t, 'vibraphone', p, 1.4, .6, s, .8) for p, s in [('D4', -.3), ('F#4', 0), ('A4', .3), ('E5', .5)]]
    elif ty == 'wipe': add(syn, whoosh(.9, .9), t - .1, .6); add(syn, swell(.9, 800, 6000, .1), t - .1, .6)
    elif ty == 'draw':
        d = e['dur']; add(syn, tone(300 * 2 ** (i / 6), 900 * 2 ** (i / 6), d, tau=d * .8) * .05, t, .5, pan=(i - 2) * .3)
        nt(t, 'harp', ['D4', 'F#4', 'A4', 'D5', 'F#5'][i], 1.5, .55, (i - 2) * .3)
    elif ty == 'drop': nt(t, 'xylophone', 'A5', .5, .7, .1); add(syn, pop(.6), t, .4)
    elif ty == 'roll': [add(syn, click(1.6 + k * .1, .12), t - .3 + k * .05, .3, pan=.4) for k in range(6)]; nt(t, 'glockenspiel', 'D6', .8, .6, .4)
    elif ty == 'wave': nt(t, 'glockenspiel', ['D6', 'F#6', 'A6'][i], .9, .55 * v, (i - 1) * .4, .8 * v); add(syn, click(1.5, .2 * v), t, .3)
    elif ty == 'word': [nt(t + k * .03, 'vibraphone', p, 3.0, .55, -.4 + .27 * k, .9) for k, p in enumerate(['D4', 'A4', 'C#5', 'F#5'])]; nt(t, 'contrabass_pizz', 'D2', 2.0, .7)
    elif ty == 'tag': nt(t, 'hand_chimes', 'F#6', 1.6, .3, .3, .5)
    elif ty == 'end': [nt(t + k * .04, 'vibraphone_bowed', p, 1.4, .4, -.3 + .3 * k, .6) for k, p in enumerate(['D4', 'F#4', 'A4'])]

# groove: marimba arps under the people/places act, harp/vibes under the build, soft pizz bass and shaker throughout
arp(2.45, 5.3, ['D', 'Bm', 'G', 'A'], 'marimba', 4, .25, .42, .55)
for k, c in enumerate(['D', 'Bm', 'G', 'A']): nt(2.45 + k, 'contrabass_pizz', CH[c][0] + '2', .9, .55, 0, .8)
arp(6.0, 8.9, ['D', 'G', 'A'], 'vibraphone', 4, .25, .3, .35)
for k, c in enumerate(['D', 'G', 'A']): nt(6.0 + k, 'contrabass_pizz', CH[c][0] + '2', .9, .5, 0, .7)
arp(8.9, 12.2, ['D', 'G', 'D'], 'marimba', 5, .5, .25, .3)
for k in range(int((12.2 - 2.45) / .25)):
    t = 2.45 + k * .25
    if 5.3 <= t < 6.0: continue
    nt(t, 'shaker', 'down', None, .25 + .1 * (k % 2), .25, .35)

music = S.render(notes, DUR + 2, master=False)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
mix = S.room(music * .9 + syn, size=.4, mix=.18)
rt = lp(brown(N / SR), 300) * .004; mix[:, 0] += rt; mix[:, 1] += np.roll(rt, 700)
tl = int((DUR - 1.0) * SR); mix[tl:] *= np.linspace(1, 0, len(mix) - tl)[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print('mix', mix.shape, 'peak', float(np.abs(mix).max()), 'instruments', len({n['inst'] for n in notes}))
