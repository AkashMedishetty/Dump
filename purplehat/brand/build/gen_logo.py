"""PhE logo geometry: fitted stroke model (build/fit.json) -> normalised geometry.

Writes (brand root):  logo.json, logo-geom.js, wordmark.json
Run from anywhere:    python build/gen_logo.py   (or python build/build_all.py for everything)

Units: stroke width 24, dot radius 12.75. Origin = top-left of the mark's ink box, so the
mark occupies exactly 0..width x 0..height (the P dot overhangs the P stem by 0.75, so
the stem's left edge sits at x=0.75).

Client change: the E's bottom bar is pulled in and ends in a dot on the baseline,
the same stroke-gap-dot rhythm as the P and the h.

Correction v2 (client spec, SVG units, master viewBox 0 0 438.99 159.84):
- h: stem centreline x=187.24 from y=12.37 to 143.73; arch = upper semicircle, centre (231.74, 113.59),
  centreline radius 44.5, from (187.24, 113.59) on the stem centreline to the terminal (276.24, 113.59).
  Stem and arch are united into one outline (the arch's start cap sits inside the stem: no bulge).
- h dot centre (276.24, 147.09): same x as the terminal.
- E and its dot shifted 12 units left (shape unchanged); E dot centre (426.24, 147.09). P unchanged.
"""
import json, math, os, sys
import numpy as np
from shapely.geometry import LineString, Point
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
os.chdir(ROOT)
sys.path.insert(0, HERE)
from wordmark import build_wordmarks  # noqa: E402

F = json.load(open('build/fit.json'))
W = F['w']; S = 24.0 / W                       # stroke width becomes 24 units
RD = F['rd']
GAP = F['Pdy'] - F['Pbot']                     # centre-to-centre, stroke end -> dot (P sets the rhythm)
X0 = F['Px'] - max(W / 2, RD)                  # left ink edge = P dot (wider than the stem)
Y0 = min(F['Ptop'], F['htop']) - W / 2
def T(x, y): return (round((x - X0) * S, 2), round((y - Y0) * S, 2))
def arcpts(cx, cy, r, a0, a1, n=48):
    return [T(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in np.linspace(a0, a1, n)]
def nseg(r, a0, a1, step=0.5):                 # fine sampling for the production outline (sagitta < 0.002 units)
    return max(8, int(abs(a1 - a0) / step))

def strokes(fine=False):
    n = (lambda r, a0, a1, d: nseg(r * S, a0, a1)) if fine else (lambda r, a0, a1, d: d)
    P = [T(F['Px'], F['Pbot'])] + arcpts(F['Px'] + F['Prc'], F['Ptop'] + F['Prc'], F['Prc'], 180, 270, n(F['Prc'], 180, 270, 24)) + \
        arcpts(F['Pbx'], F['Ptop'] + F['PR'], F['PR'], 270, 450, n(F['PR'], 270, 450, 48)) + [T(F['Pend'], F['Ptop'] + 2 * F['PR'])]
    h_stem = [T(F['hx'], F['htop']), T(F['hx'], F['hbot'])]
    h_arch = arcpts(F['hcx'], F['hcy'], F['hr'], F['ha0'], F['ha1'], n(F['hr'], F['ha0'], F['ha1'], 48))
    E_top = [T(F['Ex0'], F['Ety']), T(F['Ex1'], F['Ety'])]
    R = (F['Eb'] - F['Em']) / 2
    E_c = [T(F['Ex1'], F['Em'])] + arcpts(F['Ecx'], F['Em'] + R, R, 270, 90, n(R, 270, 90, 48)) + [T(F['Ex1'] - GAP, F['Eb'])]
    return dict(P=P, **{'h-stem': h_stem, 'h-arch': h_arch, 'E-top': E_top, 'E-bowl': E_c})

H_X, H_TOP, H_BOT = 187.24, 12.37, 143.73
H_CX, H_CY, H_R = 231.74, 113.59, 44.5
E_SHIFT = -12.0
H_DOT = (276.24, 147.09)
def h_arch_pts(n): return [(round(H_CX + H_R * math.cos(a), 2), round(H_CY + H_R * math.sin(a), 2)) for a in np.linspace(math.pi, 2 * math.pi, n)]
def correct(d, fine):
    d['h-stem'] = [(H_X, H_TOP), (H_X, H_BOT)]
    d['h-arch'] = h_arch_pts(360 if fine else 48)
    for k in ('E-top', 'E-bowl'): d[k] = [(round(x + E_SHIFT, 2), y) for x, y in d[k]]
    return d
PTS = correct(strokes(), False); FINE = correct(strokes(True), True)
R = (F['Eb'] - F['Em']) / 2
E_end = F['Ex1'] - GAP
_ed = T(F['Ex1'], F['Eb'])
dots = [('P', T(F['Px'], F['Pdy'])), ('h', H_DOT), ('E', (round(_ed[0] + E_SHIFT, 2), _ed[1]))]
w = 24.0; rd = round(RD * S, 2)

# SVG path data for each stroke centre line (true arcs, not polylines)
def p(x, y, dx=0.0): return f'{x + dx:.2f} {y:.2f}'
D = {
    'P': (f"M{p(*T(F['Px'], F['Pbot']))}L{p(*T(F['Px'], F['Ptop'] + F['Prc']))}"
          f"A{F['Prc']*S:.2f} {F['Prc']*S:.2f} 0 0 1 {p(*T(F['Px'] + F['Prc'], F['Ptop']))}"
          f"L{p(*T(F['Pbx'], F['Ptop']))}A{F['PR']*S:.2f} {F['PR']*S:.2f} 0 0 1 {p(*T(F['Pbx'], F['Ptop'] + 2*F['PR']))}"
          f"L{p(*T(F['Pend'], F['Ptop'] + 2*F['PR']))}"),
    'h-stem': f"M{p(H_X, H_TOP)}L{p(H_X, H_BOT)}",
    'h-arch': f"M{p(H_CX - H_R, H_CY)}A{H_R:.2f} {H_R:.2f} 0 0 1 {p(H_CX + H_R, H_CY)}",
    'E-top': f"M{p(*PTS['E-top'][0])}L{p(*PTS['E-top'][1])}",
    'E-bowl': (f"M{p(*T(F['Ex1'], F['Em']), E_SHIFT)}L{p(*T(F['Ecx'], F['Em']), E_SHIFT)}"
               f"A{R*S:.2f} {R*S:.2f} 0 0 0 {p(*T(F['Ecx'], F['Eb']), E_SHIFT)}L{p(*T(E_end, F['Eb']), E_SHIFT)}"),
}
ORDER = ['P', 'h-stem', 'h-arch', 'E-top', 'E-bowl']

def poly_d(g):
    out = []
    for pg in (g.geoms if hasattr(g, 'geoms') else [g]):
        for ring in [pg.exterior, *pg.interiors]:
            c = list(ring.coords); out.append('M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in c[:-1]) + 'Z')
    return ''.join(out)

# production outline: fine-sampled buffer, unioned, redundant vertices dropped
stroke_shapes = [LineString(FINE[i]).buffer(w / 2, cap_style='round', join_style='round', quad_segs=90) for i in ORDER]
dot_shapes = [Point(xy).buffer(rd, quad_segs=90) for _, xy in dots]
US = unary_union(stroke_shapes).simplify(0.003)
U = unary_union([US] + dot_shapes)
minx, miny, maxx, maxy = U.bounds
assert minx > -0.01 and miny > -0.01, U.bounds
WID, HEI = round(maxx, 2), round(maxy, 2)
OUT_D = poly_d(U); OUT_STROKES = poly_d(US)

def length(pts): return round(float(LineString(pts).length), 2)

json.dump(dict(width=WID, height=HEI, w=w, rd=rd, gap=round(GAP * S, 2),
               strokes=[dict(id=i, d=D[i], pts=PTS[i], len=length(FINE[i])) for i in ORDER],
               dots=[dict(id=i, x=xy[0], y=xy[1]) for i, xy in dots],
               outline=OUT_D, outline_strokes=OUT_STROKES,
               outline_parts={i: poly_d(sh.simplify(0.003)) for i, sh in zip(ORDER, stroke_shapes)}), open('logo.json', 'w'))
print('logo units', WID, 'x', HEI, 'stroke', w, 'dot r', rd, 'gap', round(GAP * S, 2))

# ---- per-part geometry for code (filled outline per part + centre line), consumed by logo-geom.js ----
parts = []
STEM16 = LineString(PTS['h-stem']).buffer(w / 2, cap_style='round', join_style='round', quad_segs=16)
for i in ORDER:
    g = LineString(FINE[i] if i == 'h-arch' else PTS[i]).buffer(w / 2, cap_style='round', join_style='round', quad_segs=16)
    if i == 'h-arch': g = g.difference(STEM16.buffer(0.01)).simplify(0.003)
    parts.append(dict(id=i, kind='stroke', fill=poly_d(g), line=D[i], pts=PTS[i], len=length(FINE[i]),
                      bbox=[round(v, 2) for v in g.bounds]))
for i, xy in dots:
    g = Point(xy).buffer(rd, quad_segs=24)
    parts.append(dict(id='dot-' + i, kind='dot', fill=poly_d(g), cx=xy[0], cy=xy[1], r=rd, bbox=[round(v, 2) for v in g.bounds]))
geom = dict(width=WID, height=HEI, w=w, rd=rd, gap=round(GAP * S, 2), parts=parts, outline=OUT_D,
            colors=dict(primary='#2A0D6E', accent='#2563EB', neutral='#F4F1EB'))
open('logo-geom.js', 'w').write('// PhE logo geometry (generated by build/gen_logo.py). Units: stroke width 24.\nexport default ' + json.dumps(geom) + ';\n')
print('logo-geom.js parts', [p['id'] for p in parts])

# ---- wordmark (normalised: cap height 100, baseline y=0, ink starts at x=0) ----
wm = build_wordmarks(['PurpleHat Events', 'PurpleHat', 'Events'])
json.dump(wm, open('wordmark.json', 'w'))
print('wordmark', wm['font']['name'], {k: v['ink'] for k, v in wm['texts'].items()})
