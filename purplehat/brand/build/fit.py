# Fit a round-capped stroke model of the PhE logo to the supplied artwork (zoomed 3x crop).
import numpy as np, json
from PIL import Image, ImageDraw
from scipy.optimize import minimize
M = np.load('mask.npy'); H, W = M.shape

def arc(cx, cy, r, a0, a1, n=60):   # angles in degrees, y-down screen (0=right, 90=down)
    t = np.radians(np.linspace(a0, a1, n)); return list(zip(cx + r * np.cos(t), cy + r * np.sin(t)))

def model(p):
    w, rd = p['w'], p['rd']
    P = [(p['Px'], p['Pbot'])] + arc(p['Px'] + p['Prc'], p['Ptop'] + p['Prc'], p['Prc'], 180, 270) + \
        arc(p['Pbx'], p['Ptop'] + p['PR'], p['PR'], 270, 450) + [(p['Pend'], p['Ptop'] + 2 * p['PR'])]
    hs = [(p['hx'], p['htop']), (p['hx'], p['hbot'])]
    ha = arc(p['hcx'], p['hcy'], p['hr'], p['ha0'], p['ha1'])
    Et = [(p['Ex0'], p['Ety']), (p['Ex1'], p['Ety'])]
    R = (p['Eb'] - p['Em']) / 2
    Ec = [(p['Ex1'], p['Em'])] + arc(p['Ecx'], p['Em'] + R, R, 270, 90, 60)[::1] + [(p['Ex1'], p['Eb'])]
    Ec = [(p['Ex1'], p['Em'])] + arc(p['Ecx'], p['Em'] + R, R, -90, -270) + [(p['Ex1'], p['Eb'])]
    dots = [(p['Px'], p['Pdy']), (p['hdx'], p['hdy'])]
    return dict(strokes=[P, hs, ha, Et, Ec], dots=dots, w=w, rd=rd)

def render(m, scale=1.0, size=(W, H)):
    im = Image.new('L', size, 0); d = ImageDraw.Draw(im)
    w = m['w'] * scale
    for s in m['strokes']:
        pts = [(x * scale, y * scale) for x, y in s]
        d.line(pts, fill=255, width=int(round(w)), joint='curve')
        for x, y in (pts[0], pts[-1]): d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=255)
    for x, y in m['dots']:
        r = m['rd'] * scale; d.ellipse([x * scale - r, y * scale - r, x * scale + r, y * scale + r], fill=255)
    return np.asarray(im) > 127

P0 = dict(w=58, rd=30.5, Px=113.5, Pbot=343, Prc=93, Ptop=112, Pbx=318, PR=111, Pend=293, Pdy=421,
          hx=540.5, htop=113, hbot=435, hcx=671, hcy=385, hr=131, ha0=180, ha1=345, hdx=800.5, hdy=433,
          Ex0=905, Ex1=1155, Ety=115, Em=252, Eb=443, Ecx=997.5)
keys = list(P0)
def loss(v):
    p = dict(zip(keys, v)); r = render(model(p))
    inter = (r & M).sum(); uni = (r | M).sum(); return 1 - inter / uni
v0 = np.array([P0[k] for k in keys], float)
print('start IoU', 1 - loss(v0))
res = minimize(loss, v0, method='Powell', options=dict(maxiter=6000, xtol=0.2, ftol=1e-5))
p = dict(zip(keys, res.x)); print('fit IoU', 1 - res.fun)
print(json.dumps({k: round(float(x), 2) for k, x in p.items()}))
json.dump({k: float(x) for k, x in p.items()}, open('fit.json', 'w'))
r = render(model(p)); viz = np.zeros((H, W, 3), np.uint8); viz[M] = (60, 60, 200); viz[r & ~M] = (255, 80, 80); viz[M & ~r] = (80, 220, 80); viz[r & M] = (40, 30, 120)
Image.fromarray(viz).save('fit-diff.png')
