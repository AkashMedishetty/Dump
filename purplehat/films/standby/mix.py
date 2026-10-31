"""STANDBY: score (VCSL samples, CC0) + procedural foley + room, all from the same timeline (events.json).
Additive score: every GO adds a voice. Digital zero on the music 17.0–18.0 (the fault: our world stops, the room keeps talking).
Near-silence 23.0–24.0 (house to half); the first sound after it is the show downbeat."""
import os, sys, json
import numpy as np
LIB = os.environ['LIB']; sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sampler as S
from sfx import SR, add, click, clack, whoosh, thump, quindar, pop, ding, noise, bp, lp, hp, brown, norm, t_, env_exp, limit
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; E = ev['ev']
N = int(DUR * SR) + SR
R = np.random.default_rng(11)
BEAT, BAR = .5, 2.0

def buf(): return np.zeros((N, 2), np.float32)
def at(type_): return [e for e in E if e['type'] == type_]
def mask(x, a, b, fade=.005):     # zero x between a and b with short fades (digital zero)
    i0, i1, f = int(a * SR), int(b * SR), int(fade * SR)
    x[i0:i1] = 0; x[i0 - f:i0] *= np.linspace(1, 0, f)[:, None]; x[i1:i1 + f] *= np.linspace(0, 1, f)[:, None]
def ramp(x, pts):                 # gain envelope from (t, g) points
    tt = np.arange(len(x)) / SR; g = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts]); x *= g[:, None].astype(np.float32)

# ---------------- score ----------------
CH = [  # D  Bm  G(lydian)  A ; one chord per bar from t = 3.0
  dict(root='D2', arp=['D4', 'A4', 'E5', 'A4', 'F#4', 'A4', 'E5', 'A4'], pad=['A3', 'D4', 'F#4', 'E5'], vib=['F#5', 'E5'], gl=['F#6', 'A6']),
  dict(root='B1', arp=['B3', 'F#4', 'D5', 'F#4', 'C#5', 'F#4', 'D5', 'F#4'], pad=['B3', 'D4', 'F#4', 'C#5'], vib=['D5', 'C#5'], gl=['D6', 'F#6']),
  dict(root='G1', arp=['G3', 'D4', 'B4', 'D4', 'C#5', 'D4', 'B4', 'D4'], pad=['B3', 'D4', 'F#4', 'C#5'], vib=['B4', 'F#5'], gl=['B6', 'D6']),
  dict(root='A1', arp=['A3', 'E4', 'C#5', 'E4', 'B4', 'E4', 'C#5', 'E4'], pad=['A3', 'C#4', 'E4', 'B4'], vib=['E5', 'C#5'], gl=['C#7', 'E6']),
]
def chord_at(t): return CH[int((t - 3.0) // BAR) % 4]
notes = []
def nt(t, inst, p, d, v, pan=0, gain=1.0, **kw): notes.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, gain=gain, **kw))
playing = lambda t: (3.0 <= t < 17.0) or (18.0 <= t < 22.0) or (24.0 <= t < 34.0)
# marimba ostinato (Q2 →), eighths
t = 3.0
while t < 34.0 - 1e-6:
    if playing(t):
        c = chord_at(t); i = int(round((t - 3.0) / .5)) % 8
        k = 1.0 if t < 24 else 1.15
        nt(t, 'marimba', c['arp'][i], .4, (.5 if i % 2 == 0 else .38) * k, pan=(-.25 if i % 2 else .2))
    t += .25 * 2   # eighths
# table landings (Q3): pentatonic run up and back, sixteenths
pent = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7']
for e in at('land'):
    i = e['i']; p = pent[i] if i < 12 else pent[23 - i]
    nt(e['t'], 'marimba', p, .3, .3 + .01 * (i % 5), pan=-.6 + 1.2 * ((i % 6) / 5), gain=.75)
# shaker sixteenths (Q3 →)
t, n = 5.0, 0
while t < 34.0 - 1e-6:
    if playing(t): nt(t, 'shaker', 'down' if n % 2 == 0 else 'up', None, .22 + (.08 if n % 4 == 2 else 0), pan=.35, gain=.32)
    t += .25 if t < 24 else .125; n += 1
# bowed vibraphone pad (Q4 →): one chord per bar, held through the fault's silence is NOT allowed (digital zero), so it re-enters at 18
for b in range(int((7.0 - 3.0) / BAR), int((34.0 - 3.0) / BAR)):
    tb = 3.0 + b * BAR
    if not (playing(tb) or 22.0 <= tb < 23.0): continue
    c = chord_at(tb); d = BAR + .2 if tb < 22 else 1.0
    for j, p in enumerate(c['pad']): nt(tb, 'vibraphone_bowed', p, d, .32 if tb < 24 else .4, pan=(-.4 + .27 * j), gain=.55, attack=.25, release=.6)
# vibraphone line (Q5 →): beats 1 and 3
for b in range(int((9.0 - 3.0) / BAR), int((34.0 - 3.0) / BAR)):
    tb = 3.0 + b * BAR
    if not playing(tb): continue
    c = chord_at(tb)
    nt(tb, 'vibraphone', c['vib'][0], .9, .42, pan=.15, gain=.8); nt(tb + 1.0, 'vibraphone', c['vib'][1], .9, .36, pan=.15, gain=.8)
# glockenspiel sparkle (Q7 →): syncopated sixteenths
for b in range(int((13.0 - 3.0) / BAR), int((34.0 - 3.0) / BAR)):
    tb = 3.0 + b * BAR
    for off, j in ((.875, 0), (1.875, 1)):
        if playing(tb + off): nt(tb + off, 'glockenspiel', chord_at(tb)['gl'][j], .3, .25, pan=-.45 + .9 * j, gain=.55)
# the show downbeat: bells + full chord
nt(24.0, 'tubular_bells', 'D4', 3.0, .55, pan=-.1, gain=.7); nt(24.0, 'tubular_bells', 'A4', 3.0, .45, pan=.1, gain=.55)
for j, p in enumerate(['D3', 'A3', 'E4', 'F#4', 'C#5']): nt(24.0, 'marimba', p, .8, .62, pan=-.4 + .2 * j)
# end card: chimes on the mark, last bell on the dot's blink, pad tail
for j, p in enumerate(['D5', 'A5', 'E6']): nt(34.0 + j * .0625, 'hand_chimes', p, 2.5, .45, pan=-.3 + .3 * j, gain=.7)
for j, p in enumerate(['D4', 'F#4', 'A4', 'E5']): nt(34.0, 'vibraphone_bowed', p, 5.2, .3, pan=-.3 + .2 * j, gain=.5, attack=.8, release=.9)
nt(39.0, 'hand_chimes', 'D6', 1.0, .5, gain=.75); nt(39.0, 'hand_chimes', 'A5', 1.0, .35, gain=.6)
music = S.render(notes, DUR + 1, master=False)[:N] if True else None
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# synth layers: low sine pulse (Q1 → house to half), bass (Q6 →)
synth = buf()
def sine(f, d, a=.006, tau=.12, harm=(1,)):
    tt = t_(d); x = sum(np.sin(2 * np.pi * f * h * tt) / (h ** 1.4) for h in harm)
    e = np.minimum(1, tt / a) * np.exp(-tt / tau); return (x * e).astype(np.float32)
t = 1.0
while t < 22.0:
    if not (17.0 <= t < 18.0): add(synth, sine(73.42, .3, tau=.09, harm=(1, 2, 3)), t, .1)
    t += .5
for b in range(int((11.0 - 3.0) / BAR), int((34.0 - 3.0) / BAR)):
    tb = 3.0 + b * BAR
    if not playing(tb): continue
    f = S.hz(chord_at(tb)['root'])
    add(synth, sine(f, 1.9, a=.01, tau=.6, harm=(1, 2, 3, 4)), tb, .11); add(synth, sine(f * 2, .5, a=.005, tau=.18, harm=(1, 2)), tb + 1.25, .06)
# show: soft sub pulse on beats 1 and 3
t = 24.0
while t < 33.0: add(synth, sine(46.25, .45, a=.004, tau=.15, harm=(1, 2, 3)), t, .16); t += 1.0
music += synth
music = S.room(music, size=.45, mix=.16)
mask(music, 17.0, 18.0)                         # the fault: digital zero on our world
ramp(music, [(0, 1), (22.0, 1), (23.0, .25), (23.05, 0), (23.999, 0), (24.0, 1), (40.0, 1)])

# ---------------- foley ----------------
fol = buf()
def glitch(d=.9):
    tt = t_(d); saw = 2 * ((tt * 118) % 1) - 1; bits = (R.random(len(tt)) > .5) * 2 - 1.0
    gate = (np.floor(tt * 24) % 3 != 1).astype(float) * (R.random(int(d * 24) + 1)[np.floor(tt * 24).astype(int)] > .25)
    return norm(bp(saw * .6 + bits * .25, 200, 5000) * gate * np.exp(-tt / .6)) * .5
def crt_off():
    d = .26; tt = t_(d); f = 2400 * np.exp(-tt * 14) + 60
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .1)) * .6
def shimmer(d=1.1):
    tt = t_(d); x = bp(noise(d), 4500, 11000) * np.sin(np.pi * tt / d) ** 2
    return norm(x + sum(np.sin(2 * np.pi * f * tt) * .1 for f in (5274, 7040)) * np.sin(np.pi * tt / d) ** 2) * .35
for e in E:
    T_, ty = e['t'], e['type']
    if ty == 'standby': add(fol, click(.55, .22), T_, .5)
    elif ty == 'go':
        add(fol, quindar(.5, 2525)[:int(.11 * SR)], T_, .12); add(fol, thump(.35, 120), T_, .45)
    elif ty == 'whip': add(fol, whoosh(.42, .6), T_ - .08, .5)
    elif ty == 'stage': add(fol, thump(.8, 55), T_ + .05, .4)
    elif ty == 'land': add(fol, clack(.5 + .02 * e['i'], .12), T_, .5, pan=-.5 + (e['i'] % 6) / 5)
    elif ty == 'wall':
        d = .7; tt = t_(d); add(fol, (np.sin(2 * np.pi * np.cumsum(60 + 80 * tt / d) / SR) * np.sin(np.pi * tt / d) * .25).astype(np.float32), T_, .5)
        for ci in range(14): add(fol, click(1.5, .08), 7.3 + ci * .07, .5, pan=-.7 + ci * .1)
    elif ty == 'rig':
        for i in range(12): add(fol, clack(1.2, .1), T_ + i * .03125, .5, pan=-.8 + i * .145)
        add(fol, whoosh(1.4, .18), T_ + .1, .5)
    elif ty == 'counter': add(fol, pop(.12), T_, .5, pan=-.6 if e['i'] < 2 else .6)
    elif ty == 'doors': add(fol, thump(.35, 90), T_, .5); add(fol, whoosh(.6, .2), T_, .5)
    elif ty == 'checkin': add(fol, click(2.2, .035), T_, .5, pan=float(np.clip(e['x'] * .8, -.9, .9)))
    elif ty == 'fault': add(fol, glitch(), T_, .9, pan=0)
    elif ty == 'half': add(fol, whoosh(.9, .12), T_, .5)
    elif ty == 'show': add(fol, thump(1.0, 42), T_, .6)
    elif ty == 'toast': add(fol, ding(.06)[:int(.5 * SR)], T_, .5)
    elif ty == 'collapse': add(fol, crt_off(), T_, .6)
    elif ty == 'fly': add(fol, whoosh(.5, .25), T_, .5)
    elif ty == 'sweep': add(fol, shimmer(), T_, .7)

# ---------------- room: tone, murmur (grows with the guests), applause ----------------
amb = buf()
rt = lp(brown(N / SR), 260) * .02; amb[:, 0] += rt; amb[:, 1] += np.roll(rt, 900)
seat = sorted(e['t'] for e in at('seat')); chk = sorted(e['t'] for e in at('checkin'))
tt = np.arange(N) / SR
crowd = np.clip(np.searchsorted(np.array(chk), tt) / 240, 0, 1)
crowd = np.interp(tt, [0, 22.3, 23.3, 24.0, 33, 40], [1, 1, .03, .0, .0, 0]) * crowd ** .7
mur = np.zeros((N, 2), np.float32)
for v in range(28):
    x = noise(N / SR); lo = R.uniform(250, 500); x = bp(x, lo, lo * R.uniform(3, 6))
    f = R.uniform(2.5, 5.5); ph = R.uniform(0, 6.28); syl = np.clip(np.sin(2 * np.pi * f * tt + ph + 1.5 * np.sin(2 * np.pi * .3 * tt + v)), 0, 1) ** 1.5
    phrase = (np.sin(2 * np.pi * R.uniform(.08, .2) * tt + R.uniform(0, 6)) > -.2)
    on = tt > (13.3 + v * .25)
    p = R.uniform(-.8, .8); l, r_ = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    y = (x * syl * phrase * on).astype(np.float32); mur[:, 0] += y * l; mur[:, 1] += y * r_
mur = S.room(mur, size=.6, mix=.35) * (crowd[:, None] * .11).astype(np.float32)
amb += mur
app = buf()
for i in range(900):
    t0 = 24.15 + R.gamma(2.2, .9)
    if t0 > 31: continue
    add(app, S.hit('claps', 'group' if R.random() < .7 else 'solo', R.uniform(.3, .8)), t0, R.uniform(.25, .5), pan=R.uniform(-.9, .9))
ramp(app, [(0, 0), (24.1, 0), (24.6, 1), (26.5, 1), (30.0, .35), (31.5, 0), (40, 0)])
amb += S.room(app, size=.7, mix=.3) * .5

mix = music * 1.0 + fol * .75 + amb
mix[int(23.0 * SR):int(24.0 * SR)] *= np.linspace(1, .5, int(SR))[:, None]   # near-silence: only the room is left
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
