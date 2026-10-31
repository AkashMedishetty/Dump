"""Wordmark outlines from the brand typeface.

THE FONT IS A SETTING: edit build/brand.json -> "wordmark" and rerun `python build/build_all.py`.
  { "font": "fonts/DMSans.ttf", "variations": {"wght": 500, "opsz": 14}, "tracking": -0.01 }
For Satoshi: drop fonts/Satoshi-Medium.otf in (Fontshare licence: free for commercial use) and set
  { "font": "fonts/Satoshi-Medium.otf", "variations": {}, "tracking": -0.01 }
Every lockup SVG/PNG, code/phe-logo.js and the animations pick it up from wordmark.json.

Shaping uses HarfBuzz (uharfbuzz) when installed so kerning is applied; otherwise falls back to
advance widths only (prints a warning).
"""
import json, os, functools
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CFG = json.load(open(os.path.join(HERE, 'brand.json')))['wordmark']


def _ntos(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


@functools.lru_cache(None)
def load_font():
    path = os.path.join(ROOT, CFG['font'])
    font = TTFont(path)
    if 'fvar' in font and CFG.get('variations'):
        from fontTools.varLib import instancer
        font = instancer.instantiateVariableFont(font, CFG['variations'])
    return path, font


def shape(path, font, text):
    """-> list of (glyphName, x_advance_offset, x_offset) in font units, with kerning when possible."""
    try:
        import uharfbuzz as hb
        blob = hb.Blob.from_file_path(path); face = hb.Face(blob); hf = hb.Font(face)
        if CFG.get('variations'): hf.set_variations(CFG['variations'])
        buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
        hb.shape(hf, buf, {'kern': True, 'liga': False})
        order = font.getGlyphOrder()
        return [(order[i.codepoint], p.x_advance, p.x_offset) for i, p in zip(buf.glyph_infos, buf.glyph_positions)]
    except ImportError:
        print('  [wordmark] uharfbuzz not installed -> no kerning (pip install uharfbuzz)')
        cmap = font.getBestCmap(); hm = font['hmtx']
        return [(cmap[ord(c)], hm[cmap[ord(c)]][0], 0) for c in text if ord(c) in cmap]


def outline(text, cap=100.0, x=0.0, y=0.0):
    """Outline at cap height `cap` with ink-left at x and baseline at y (y down). Defaults = normalised."""
    ox, oy = x, y
    path, font = load_font()
    gs = font.getGlyphSet(); upm = font['head'].unitsPerEm
    capH = getattr(font['OS/2'], 'sCapHeight', 0) or 0.7 * upm
    sc = cap / capH; track = CFG.get('tracking', 0) * upm
    run = shape(path, font, text)
    # pass 1: ink bounds at x0=0
    bp = BoundsPen(gs); x = 0.0
    for gn, adv, xo in run:
        gs[gn].draw(TransformPen(bp, (sc, 0, 0, -sc, (x + xo) * sc, 0))); x += adv + track
    xmin, ymin, xmax, ymax = bp.bounds
    pen = SVGPathPen(gs, ntos=_ntos); x = 0.0
    for gn, adv, xo in run:
        gs[gn].draw(TransformPen(pen, (sc, 0, 0, -sc, (x + xo) * sc - xmin + ox, oy))); x += adv + track
    # ink = [left, top, width, bottom] relative to (x, baseline); y down (transform already flips y)
    return dict(d=pen.getCommands(), ink=[0, round(ymin, 2), round(xmax - xmin, 2), round(ymax, 2)],
                advance=round((x - track) * sc, 2), size=round(sc * upm, 3))


def build_wordmarks(texts):
    path, font = load_font()
    fam = font['name'].getDebugName(16) or font['name'].getDebugName(1)
    name = fam + (' ' + ' '.join(f'{k}{v}' for k, v in CFG.get('variations', {}).items()) if CFG.get('variations') else '')
    return dict(font=dict(name=name, file=CFG['font'], variations=CFG.get('variations', {}), tracking=CFG.get('tracking', 0),
                          note='Stand-in for Satoshi (Fontshare). Swap in build/brand.json and rebuild.'),
                cap=100, texts={t: outline(t) for t in texts})
