"""SVG set: marks, lockups, app icon / favicon, clear-space + minimum-size spec.

Every file: tight viewBox (mark units, the mark always at its native coordinates), <title>, no transforms,
outlined artwork (no live text, no strokes) except phe-mark-stroked.svg which is the editable master.
Also writes build/layouts.json (lockup layouts, consumed by build_code.py -> code/phe-logo.js).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
os.chdir(ROOT); sys.path.insert(0, HERE)
from wordmark import outline  # noqa: E402

G = json.load(open('logo.json')); B = json.load(open('build/brand.json'))
C = B['colors']; PRI, ACC, NEU, BLK, WHT = C['primary'], C['accent'], C['neutral'], C['black'], C['white']
MW, MH, RD = G['width'], G['height'], G['rd']
X = 4 * RD                      # clear space = two dot diameters (51 units, 32% of the mark height)
STROKES_D = G['outline_strokes']; DOTS = G['dots']
WORD = 'PurpleHat Events'
os.makedirs('svg', exist_ok=True)


def f(v): s = f'{v:.2f}'.rstrip('0').rstrip('.'); return '0' if s in ('-0', '') else s


def doc(name, vb, title, body, desc=None, px=None):
    x, y, w, h = vb; pw, ph = px or (w, h)
    d = f'<desc>{desc}</desc>' if desc else ''
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x)} {f(y)} {f(w)} {f(h)}" width="{f(pw)}" height="{f(ph)}" '
         f'role="img"><title>{title}</title>{d}{body}</svg>\n')
    open(f'svg/{name}.svg', 'w').write(s); return s


def mark(fill, dot=None):
    dot = dot or fill
    circles = ''.join(f'<circle cx="{f(d["x"])}" cy="{f(d["y"])}" r="{f(RD)}"/>' for d in DOTS)
    if dot == fill:
        return f'<g fill="{fill}"><path class="phe-strokes" d="{STROKES_D}"/><g class="phe-dots">{circles}</g></g>'
    return f'<path class="phe-strokes" fill="{fill}" d="{STROKES_D}"/><g class="phe-dots" fill="{dot}">{circles}</g>'


def bg(vb, color, rx=0):
    x, y, w, h = vb; r = f' rx="{f(rx)}"' if rx else ''
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"{r} fill="{color}"/>'


def pad(vb, p): x, y, w, h = vb; return (x - p, y - p, w + 2 * p, h + 2 * p)


def words(spec, color):
    return ''.join(f'<path class="phe-wordmark" fill="{color}" d="{outline(t, cap, x, y)["d"]}"/>' for t, cap, x, y in spec)


# ---------------------------------------------------------------- marks
TITLE = 'PurpleHat Events'
vb_mark = (0, 0, MW, MH)
doc('phe-mark-primary', vb_mark, f'{TITLE} — PhE mark', mark(PRI))
doc('phe-mark-black', vb_mark, f'{TITLE} — PhE mark (black)', mark(BLK))
doc('phe-mark-white', vb_mark, f'{TITLE} — PhE mark (white)', mark(WHT))
doc('phe-mark-accent', vb_mark, f'{TITLE} — PhE mark (accent)', mark(ACC))
doc('phe-mark-twotone', vb_mark, f'{TITLE} — PhE mark (two-tone, accent dots)', mark(PRI, ACC))
vb_rev = pad(vb_mark, X)
doc('phe-mark-reversed', vb_rev, f'{TITLE} — PhE mark (reversed on primary)', bg(vb_rev, PRI) + mark(NEU),
    desc='Neutral mark on PurpleHat primary with the minimum clear space (2 dot diameters) as padding.')
doc('phe-mark-twotone-reversed', vb_rev, f'{TITLE} — PhE mark (reversed, accent dots)', bg(vb_rev, PRI) + mark(NEU, ACC))
# editable master: centre lines with round caps + circles
strokes_live = ''.join(f'<path id="phe-{s["id"]}" d="{s["d"]}"/>' for s in G['strokes'])
dots_live = ''.join(f'<circle id="phe-dot-{d["id"]}" cx="{f(d["x"])}" cy="{f(d["y"])}" r="{f(RD)}"/>' for d in DOTS)
doc('phe-mark-stroked', vb_mark, f'{TITLE} — PhE mark (editable strokes)',
    f'<g id="phe-strokes" fill="none" stroke="{PRI}" stroke-width="{f(G["w"])}" stroke-linecap="round" stroke-linejoin="round">{strokes_live}</g>'
    f'<g id="phe-dots" fill="{PRI}">{dots_live}</g>',
    desc=f'Editable master: 5 centre-line paths, stroke {f(G["w"])}, round caps; 3 dots r {f(RD)}. Do not scale strokes independently.')

# ---------------------------------------------------------------- lockups (mark at native coords)
L = {}
# primary: mark over one-line wordmark, wordmark spans the mark (P stem left edge -> E bar right edge)
x_l, x_r = G['strokes'][0]['pts'][0][0] - G['w'] / 2, max(p[0] for p in G['strokes'][3]['pts']) + G['w'] / 2
wm1 = outline(WORD); cap1 = 100 * (x_r - x_l) / wm1['ink'][2]
asc, desc = -wm1['ink'][1] / 100, wm1['ink'][3] / 100
base1 = MH + 0.75 * X + asc * cap1
L['primary'] = dict(vb=(0, 0, MW, base1 + desc * cap1), words=[(WORD, cap1, x_l, base1)])
# horizontal: mark | wordmark, cap height 30% of mark height, cap band centred on the mark
cap2 = 0.30 * MH; gap2 = 1.25 * X; base2 = MH / 2 + cap2 / 2
L['horizontal'] = dict(vb=(0, 0, MW + gap2 + wm1['ink'][2] * cap2 / 100, MH), words=[(WORD, cap2, MW + gap2, base2)])
# stacked: mark over "PurpleHat / Events"
cap3 = 0.36 * MH; base3a = MH + 0.75 * X + asc * cap3; base3b = base3a + 1.5 * cap3
w3 = outline('PurpleHat')['ink'][2] * cap3 / 100
L['stacked'] = dict(vb=(0, 0, max(MW, x_l + w3), base3b + 0.02 * cap3), words=[('PurpleHat', cap3, x_l, base3a), ('Events', cap3, x_l, base3b)])
# pill: wordmark inside a pill + a circle (people + places), outlined rings
cap4 = 40.0; ph = cap4 * 2.6; sw = cap4 * 0.11; ww4 = wm1['ink'][2] * cap4 / 100; pw = ww4 + ph; gap4 = ph * 0.2
o = sw / 2


def ring_pill(x, y, w, h, t):   # outlined rounded-rect ring, outer box (x,y,w,h), thickness t (evenodd)
    def pill(x, y, w, h):
        r = h / 2
        return (f'M{f(x + r)} {f(y)}H{f(x + w - r)}A{f(r)} {f(r)} 0 0 1 {f(x + w - r)} {f(y + h)}'
                f'H{f(x + r)}A{f(r)} {f(r)} 0 0 1 {f(x + r)} {f(y)}Z')
    return pill(x, y, w, h) + pill(x + t, y + t, w - 2 * t, h - 2 * t)


def ring_circle(cx, cy, r, t):
    def c(r): return f'M{f(cx - r)} {f(cy)}A{f(r)} {f(r)} 0 1 1 {f(cx + r)} {f(cy)}A{f(r)} {f(r)} 0 1 1 {f(cx - r)} {f(cy)}Z'
    return c(r) + c(r - t)


H4 = ph + sw; cx4 = pw + sw + gap4 + H4 / 2
L['pill'] = dict(vb=(0, 0, cx4 + H4 / 2, H4), words=[(WORD, cap4, (pw + sw - ww4) / 2, H4 / 2 + cap4 / 2)],
                 shapes=[ring_pill(0, 0, pw + sw, H4, sw), ring_circle(cx4, H4 / 2, H4 / 2, sw)], mark=False, pad=H4 / 2)

NAMES = dict(primary='stacked lockup', horizontal='horizontal lockup', stacked='stacked two-line lockup', pill='pill lockup')
for key, lay in L.items():
    has_mark = lay.get('mark', True)
    def body(c, dot=None):
        s = mark(c, dot) if has_mark else ''
        s += ''.join(f'<path class="phe-shape" fill="{c}" fill-rule="evenodd" d="{d}"/>' for d in lay.get('shapes', []))
        return s + words(lay['words'], c)
    base = 'phe-lockup-' + key
    t = f'{TITLE} — {NAMES[key]}'
    doc(base, lay['vb'], t, body(PRI))
    doc(base + '-black', lay['vb'], t + ' (black)', body(BLK))
    doc(base + '-white', lay['vb'], t + ' (white)', body(WHT))
    vbr = pad(lay['vb'], lay.get('pad', X))
    doc(base + '-reversed', vbr, t + ' (reversed on primary)', bg(vbr, PRI) + body(NEU),
        desc='Reversed on primary with the minimum clear space as padding.')
# the primary lockup keeps its historical short names
for v in ('reversed', 'black', 'white'):
    os.replace(f'svg/phe-lockup-primary-{v}.svg', f'svg/phe-lockup-{v}.svg')

# ---------------------------------------------------------------- app icon + favicon
S = MW / 0.72; vb_icon = ((MW - S) / 2, (MH - S) / 2, S, S)
doc('phe-app-icon', vb_icon, f'{TITLE} — app icon', bg(vb_icon, PRI) + mark(NEU), px=(512, 512),
    desc='Full-bleed square (iOS/Android apply their own mask). Mark at 72% width fits the maskable safe zone.')
doc('phe-app-icon-rounded', vb_icon, f'{TITLE} — app icon (rounded, for presentation)', bg(vb_icon, PRI, S * 0.2237) + mark(NEU), px=(512, 512))
P_D = G['outline_parts']['P']; dP = DOTS[0]
p_box = (0, 0, 153.83, dP['y'] + RD)          # P + its dot
Sf = p_box[3] / 0.70; vb_fav = (p_box[2] / 2 - Sf / 2, p_box[3] / 2 - Sf / 2, Sf, Sf)
doc('phe-favicon', vb_fav, f'{TITLE} — favicon (P monogram)',
    bg(vb_fav, PRI, Sf * 0.2) + f'<g fill="{NEU}"><path d="{P_D}"/><circle cx="{f(dP["x"])}" cy="{f(dP["y"])}" r="{f(RD)}"/></g>', px=(64, 64),
    desc='Small-size mark: the P and its dot. The full PhE mark needs at least 120 px of width.')

# ---------------------------------------------------------------- spec sheets (labels outlined in the brand face)
INK = PRI
def label(t, cap, x, y, c=INK): return f'<path fill="{c}" d="{outline(t, cap, x, y)["d"]}"/>'
def dash_rect(x, y, w, h, c=ACC, sw=2):
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-dasharray="8 6"/>'
def xdots(x, y, horiz=True, c=ACC):  # two dots = X
    return ''.join(f'<circle cx="{f(x + (i * 2 * RD + RD if horiz else 0))}" cy="{f(y + (0 if horiz else i * 2 * RD + RD))}" r="{f(RD)}" fill="{c}"/>' for i in range(2))

vb_cs = (-260, -230, MW + 520, 590)
cs = bg(vb_cs, NEU)
cs += f'<rect x="{f(-X)}" y="{f(-X)}" width="{f(MW + 2 * X)}" height="{f(MH + 2 * X)}" fill="{ACC}" fill-opacity="0.08"/>'
cs += dash_rect(-X, -X, MW + 2 * X, MH + 2 * X) + dash_rect(0, 0, MW, MH, PRI, 1)
cs += mark(PRI)
cs += xdots(MW * 0.62, -X, False) + xdots(MW * 0.62, MH, False) + xdots(-X, MH * 0.45) + xdots(MW, MH * 0.45)
cs += label('Clear space', 34, -220, -150)
cs += label('X = two dot diameters (51 units, 32% of the mark height) on every side.', 16, -220, -112, PRI)
cs += label('Lockups use the same X, measured from the size of the mark in the lockup.', 16, -220, MH + X + 90, PRI)
cs += label("Two-dot rule: two of the logo's own dots must fit between the logo and anything else.", 16, -220, MH + X + 118, PRI)
doc('phe-spec-clearspace', vb_cs, f'{TITLE} — clear space spec', cs)

# minimum sizes (1 unit = 1 CSS px in this sheet)
def mark_at(x, y, width, c=PRI):
    k = width / MW   # one-off scaled copy for the spec sheet only: baked coordinates via nested svg viewBox (no transform)
    return f'<svg x="{f(x)}" y="{f(y)}" width="{f(width)}" height="{f(MH * k)}" viewBox="0 0 {f(MW)} {f(MH)}">{mark(c)}</svg>'
def lock_at(x, y, width, key='primary', c=PRI):
    vx, vy, vw, vh = L[key]['vb']; k = width / vw
    return f'<svg x="{f(x)}" y="{f(y)}" width="{f(width)}" height="{f(vh * k)}" viewBox="{f(vx)} {f(vy)} {f(vw)} {f(vh)}">{mark(c)}{words(L[key]["words"], c)}</svg>'
def fav_at(x, y, s):
    return f'<svg x="{f(x)}" y="{f(y)}" width="{s}" height="{s}" viewBox="{" ".join(f(v) for v in vb_fav)}">' + \
        bg(vb_fav, PRI, Sf * 0.2) + f'<g fill="{NEU}"><path d="{P_D}"/><circle cx="{f(dP["x"])}" cy="{f(dP["y"])}" r="{f(RD)}"/></g></svg>'
ms = bg((0, 0, 1000, 500), NEU)
ms += label('Minimum sizes', 34, 40, 70)
ms += label('Shown at 1:1 in CSS px. Below these sizes the gap between dot and stroke closes up.', 16, 40, 104, PRI)
ms += mark_at(40, 160, 120) + label('Mark: 120 px / 20 mm wide', 14, 40, 262)
lh = L['primary']['vb'][3] * 160 / L['primary']['vb'][2]
ms += lock_at(360, 262 - 32 - lh, 160) + label('Stacked lockup: 160 px / 30 mm', 14, 360, 262)
ms += fav_at(680, 214, 16) + fav_at(708, 198, 32) + fav_at(752, 182, 48)
ms += label('Smaller than 120 px: P monogram', 14, 680, 262) + label('(favicon 16 / 32 / 48 px)', 14, 680, 284)
ms += lock_at(40, 330, 360, 'horizontal') + label('Horizontal lockup: 360 px / 60 mm wide', 14, 40, 430)
ms += label('Print: mark 20 mm, lockups 30 mm minimum. Embroidery and vinyl: mark 35 mm minimum.', 14, 40, 470, PRI)
doc('phe-spec-minsize', (0, 0, 1000, 500), f'{TITLE} — minimum size spec', ms)

# ---------------------------------------------------------------- layouts for code
json.dump(dict(X=X, lockups={k: dict(vb=[round(v, 2) for v in lay['vb']], mark=lay.get('mark', True), pad=round(lay.get('pad', X), 2),
                                    words=[dict(text=t, k=round(cap / 100, 5), x=round(x, 2), y=round(y, 2)) for t, cap, x, y in lay['words']],
                                    shapes=lay.get('shapes', [])) for k, lay in L.items()},
               icon=dict(vb=[round(v, 2) for v in vb_icon]), favicon=dict(vb=[round(v, 2) for v in vb_fav], P=P_D)),
          open('build/layouts.json', 'w'))
print('svg:', len(os.listdir('svg')), 'files')
