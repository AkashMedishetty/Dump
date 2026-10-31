import fs from 'fs';
import opentype from 'opentype.js';
const F = {};
for (const f of fs.readdirSync('fonts')) F[f.replace('.woff', '')] = opentype.loadSync('fonts/' + f);
const r2 = (n) => String(+(+n).toFixed(2));
// Lay out text manually: kerning + tracking (em). Returns path data and metrics.
function text(fk, str, size, x = 0, y = 0, track = 0) {
  const font = F[fk]; let cx = x; let d = ''; const glyphs = font.stringToGlyphs(str);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  glyphs.forEach((g, i) => {
    const p = g.getPath(cx, y, size); const bb = p.getBoundingBox();
    if (isFinite(bb.x1)) { x0 = Math.min(x0, bb.x1); x1 = Math.max(x1, bb.x2); y0 = Math.min(y0, bb.y1); y1 = Math.max(y1, bb.y2); }
    d += p.toPathData(2);
    let adv = g.advanceWidth * size / font.unitsPerEm;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * size / font.unitsPerEm;
    cx += adv + (i < glyphs.length - 1 ? track * size : 0);
  });
  return { d, x0, x1, y0, y1, w: x1 - x0, adv: cx - x };
}
const capH = (fk, size) => { const b = text(fk, 'H', size).y0; return -b; };
// Palettes: m = main, a = accent, s = sub text, bg = tile
const PAL = {
  light: { m: '#5E44E8', a: '#A996FF', s: '#17112B', bg: '#FBFAF7' },
  purple: { m: '#F6F4EF', a: '#D7CFFF', s: '#E9E4FF', bg: '#5E44E8' },
  ink: { m: '#F6F4EF', a: '#A996FF', s: '#C9C1DD', bg: '#17112B' },
};
const L = [];
const def = (id, name, line, pal, build) => L.push({ id, name, line, pal, build });
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
// bbox helper for composed parts
function box(parts) { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of parts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[2]); y1 = Math.max(y1, p[3]); } return [x0, y0, x1, y1]; }
const tb = (t) => [t.x0, t.y0, t.x1, t.y1];
// Standard sub-line "EVENTS" spaced to a given width
function eventsLine(x, y, fill, size = 18, align = 'left', fk = 'Manrope-500') {
  const track = 0.32; const base = text(fk, 'EVENTS', size, 0, 0, track);
  const sx = align === 'right' ? x - base.x1 : align === 'center' ? x - (base.x0 + base.x1) / 2 : x - base.x0;
  const t = text(fk, 'EVENTS', size, sx, y, track); return { el: P(t.d, fill), t };
}

// ---------- WORDMARKS ----------
def('W01', 'Editorial', 'Instrument Serif, tightly set, with spaced capitals.', 'light', (c) => {
  const t = text('InstrumentSerif-400', 'PurpleHat', 130, 0, 0, -0.012);
  const e = eventsLine(t.x0 + 3, 48, c.s, 18);
  return { els: P(t.d, c.m) + e.el, bb: box([tb(t), tb(e.t)]) };
});
def('W02', 'Roman and italic', 'Purple upright, Hat in italic: one quiet gesture.', 'purple', (c) => {
  const a = text('InstrumentSerif-400', 'Purple', 130, 0, 0, -0.01);
  const b = text('InstrumentSerif-400i', 'Hat', 130, a.adv + 4, 0, -0.01);
  const e = eventsLine(b.x1 - 2, 48, c.s, 18, 'right');
  return { els: P(a.d, c.m) + P(b.d, c.a) + e.el, bb: box([tb(a), tb(b), tb(e.t)]) };
});
def('W03', 'Lowercase', 'Manrope ExtraBold, lowercase and close-set.', 'light', (c) => {
  const a = text('Manrope-800', 'purplehat', 120, 0, 0, -0.05);
  const b = text('Manrope-300', 'events', 120 * 0.46, a.adv + 14, 0, -0.01);
  return { els: P(a.d, c.m) + P(b.d, c.s), bb: box([tb(a), tb(b)]) };
});
def('W04', 'Light and bold', 'PURPLE light, HAT extra bold: two voices, one name.', 'ink', (c) => {
  const a = text('Manrope-300', 'PURPLE', 92, 0, 0, 0.03);
  const b = text('Manrope-800', 'HAT', 92, a.adv + 0.03 * 92, 0, 0.03);
  const e = eventsLine(a.x0 + 2, 46, c.a, 17);
  return { els: P(a.d, c.m) + P(b.d, c.m) + e.el, bb: box([tb(a), tb(b), tb(e.t)]) };
});
def('W05', 'Stacked', 'Inter Tight ExtraBold, stacked with tight leading.', 'purple', (c) => {
  const a = text('InterTight-800', 'Purple', 120, 0, 0, -0.035);
  const b = text('InterTight-800', 'Hat', 120, 0, 104, -0.035);
  const e = text('InterTight-600', 'Events', 34, a.x1 - text('InterTight-600', 'Events', 34).w - 2, 104, -0.01);
  return { els: P(a.d, c.m) + P(b.d, c.m) + P(e.d, c.a), bb: box([tb(a), tb(b), tb(e)]) };
});
def('W06', 'Hospitality capitals', 'Marcellus capitals, widely spaced, with a hairline.', 'light', (c) => {
  const t = text('Marcellus-400', 'PURPLEHAT', 74, 0, 0, 0.2);
  const ruleY = 26; const rule = `<rect x="${r2(t.x0)}" y="${ruleY}" width="${r2(t.w)}" height="1.4" fill="${c.s}" opacity="0.5"/>`;
  const e = eventsLine(t.x0 + t.w / 2, 60, c.s, 16, 'center');
  return { els: P(t.d, c.m) + rule + e.el, bb: box([tb(t), tb(e.t)]) };
});
def('W07', 'Extended', 'Unbounded, wide and calm: built for screens and stages.', 'ink', (c) => {
  const t = text('Unbounded-500', 'PURPLEHAT', 68, 0, 0, 0.01);
  const e = eventsLine(t.x1, 42, c.a, 15, 'right');
  return { els: P(t.d, c.m) + e.el, bb: box([tb(t), tb(e.t)]) };
});
def('W08', 'Contemporary grotesk', 'Bricolage Grotesque: confident, with character.', 'light', (c) => {
  const t = text('BricolageGrotesque-700', 'PurpleHat', 120, 0, 0, -0.035);
  const e = eventsLine(t.x0 + 4, 46, c.s, 18);
  return { els: P(t.d, c.m) + e.el, bb: box([tb(t), tb(e.t)]) };
});
def('W09', 'Gallery', 'Syne Bold capitals: an arts-and-culture voice.', 'purple', (c) => {
  const t = text('Syne-700', 'PURPLEHAT', 70, 0, 0, 0.0);
  const e = eventsLine(t.x0 + 2, 44, c.a, 16);
  return { els: P(t.d, c.m) + e.el, bb: box([tb(t), tb(e.t)]) };
});
def('W10', 'Classic', 'Cormorant Garamond with an italic Events: premium and timeless.', 'ink', (c) => {
  const a = text('CormorantGaramond-600', 'PurpleHat', 124, 0, 0, -0.005);
  const bw = text('CormorantGaramond-600i', 'Events', 58).w;
  const b = text('CormorantGaramond-600i', 'Events', 54, a.x0 + (a.w - text('CormorantGaramond-600i', 'Events', 54).w) / 2, 98, 0);
  return { els: P(a.d, c.m) + P(b.d, c.a), bb: box([tb(a), tb(b)]) };
});

// ---------- LETTERMARKS ----------
def('L01', 'PH ligature', 'P and H share one stem; the bowl closes on the crossbar.', 'purple', (c) => {
  const d = 'M16 196V20H66A40 40 0 0 1 66 100H16M16 100H154M154 20V196';
  return { els: `<path d="${d}" fill="none" stroke="${c.m}" stroke-width="28"/>`, bb: [2, 6, 168, 196] };
});
def('L02', 'Serif monogram', 'Instrument Serif P over H, separated by a fine gap.', 'light', (c) => {
  const h = text('InstrumentSerif-400', 'H', 220, 70, 0); const p = text('InstrumentSerif-400', 'P', 220, 0, 0);
  return { els: P(h.d, c.s) + `<path d="${p.d}" fill="${c.m}" stroke="${c.bg}" stroke-width="9" paint-order="stroke"/>`, bb: box([tb(h), tb(p)]) };
});
def('L03', 'P in a disc', 'A solid disc with a bold P cut out of it.', 'ink', (c) => {
  const p = text('Manrope-800', 'P', 150, 0, 0); const cx = 0, cy = 0;
  const px = -p.x0 - p.w / 2 + 6, py = -p.y0 - (p.y1 - p.y0) / 2 + p.y0 * 0;
  const pp = text('Manrope-800', 'P', 150, px, -((p.y0 + p.y1) / 2));
  return { els: `<circle cx="${cx}" cy="${cy}" r="100" fill="${c.m}"/>` + P(pp.d, c.bg), bb: [-100, -100, 100, 100] };
});
def('L04', 'Block', 'PH set tight into a square, Swiss style.', 'purple', (c) => {
  const t = text('InterTight-800', 'PH', 150, 0, 0, -0.04);
  const s = 200, pad = 18; const k = (s - pad * 2) / t.w; const hh = (t.y1 - t.y0) * k;
  const tx = pad - t.x0 * k, ty = s - pad - t.y1 * k;
  return { els: `<rect width="${s}" height="${s}" fill="${c.m}"/><g transform="translate(${r2(tx)} ${r2(ty)}) scale(${r2(k)})">${P(t.d, c.bg)}</g>`, bb: [0, 0, s, s] };
});
def('L05', 'Stencil', 'P, H and E cut as a stencil; the gaps recall the seams.', 'light', (c) => {
  const x = 0, y = 0, u = 14, h = 100;
  const Pp = `<rect x="0" y="0" width="${u}" height="${h}"/><path fill-rule="evenodd" d="M${u + 4} 0H26A28 28 0 0 1 26 56H${u + 4}ZM${u + 4} ${u}H26A14 14 0 0 1 26 42H${u + 4}Z"/>`;
  const Hh = `<g transform="translate(76 0)"><rect width="${u}" height="${h}"/><rect x="48" width="${u}" height="${h}"/><rect x="${u + 4}" y="43" width="26" height="${u}"/></g>`;
  const Ee = `<g transform="translate(160 0)"><rect width="${u}" height="${h}"/><rect x="${u + 4}" width="28" height="${u}"/><rect x="${u + 4}" y="43" width="22" height="${u}"/><rect x="${u + 4}" y="${h - u}" width="28" height="${u}"/></g>`;
  return { els: `<g fill="${c.m}">${Pp}${Hh}${Ee}</g>`, bb: [0, 0, 206, 100] };
});
def('L06', 'Geometric P', 'A stem and a half circle; nothing else.', 'ink', (c) => {
  const els = `<rect x="0" y="0" width="30" height="190" fill="${c.m}"/><path fill-rule="evenodd" d="M30 0H70A55 55 0 0 1 70 110H30ZM30 30H70A25 25 0 0 1 70 80H30Z" fill="${c.m}"/>`;
  return { els, bb: [0, 0, 125, 190] };
});
def('L07', 'Italic Ph', 'An Instrument Serif italic Ph: personal, like a signature.', 'purple', (c) => {
  const t = text('InstrumentSerif-400i', 'Ph', 230, 0, 0, -0.02);
  return { els: P(t.d, c.m), bb: tb(t) };
});
def('L08', 'H in a square', 'Two notches turn a square into an H.', 'light', (c) => {
  return { els: `<path fill-rule="evenodd" fill="${c.m}" d="M0 0H200V200H0ZM72 0H128V78H72ZM72 122H128V200H72Z"/>`, bb: [0, 0, 200, 200] };
});
def('L09', 'Seal', 'PHE spaced inside a fine ring: for documents and invitations.', 'ink', (c) => {
  const t0 = text('Manrope-700', 'PHE', 62, 0, 0, 0.14); const t = text('Manrope-700', 'PHE', 62, -t0.x0 - t0.w / 2, -((t0.y0 + t0.y1) / 2), 0.14);
  return { els: `<circle r="100" fill="none" stroke="${c.m}" stroke-width="4"/><circle r="88" fill="none" stroke="${c.a}" stroke-width="1.5"/>` + P(t.d, c.m), bb: [-102, -102, 102, 102] };
});
def('L10', 'Overlay', 'P and H overlap; the shared area deepens the purple.', 'light', (c) => {
  const p = text('Manrope-800', 'P', 220, 0, 0); const h = text('Manrope-800', 'H', 220, 72, 0);
  return { els: P(h.d, '#A996FF') + P(p.d, '#5E44E8', ' fill-opacity="0.85"'), bb: box([tb(p), tb(h)]) };
});

// ---------- SYMBOLS (with a shared wordmark) ----------
function lockup(c, sym, symBox) {
  const [sx0, sy0, sx1, sy1] = symBox; const sh = sy1 - sy0;
  const name = text('Manrope-700', 'PurpleHat', 64, 0, 0, -0.03);
  const ch = -name.y0; const gap = 34;
  const nx = sx1 + gap - name.x0; const cy = sy0 + sh / 2; const ny = cy + ch / 2 - 8;
  const n = text('Manrope-700', 'PurpleHat', 64, nx, ny, -0.03);
  const e = eventsLine(n.x0 + 2, ny + 30, c.s, 15);
  return { els: sym + P(n.d, c.m) + e.el, bb: box([symBox, tb(n), tb(e.t)]) };
}
def('S01', 'Bowler', 'A dome above a line, one stroke apart: a hat, a sunrise, a venue.', 'light', (c) =>
  lockup(c, `<path d="M10 70A50 50 0 0 1 110 70Z" fill="${c.m}"/><rect x="0" y="78" width="120" height="11" rx="5.5" fill="${c.a}"/>`, [0, 20, 120, 89]));
def('S02', 'Seams', 'The cap reduced to a circle and its four seams.', 'purple', (c) =>
  lockup(c, `<defs><mask id="sm"><rect x="-60" y="-60" width="120" height="120" fill="#fff"/><path d="M-60 -60L60 60M-60 60L60 -60" stroke="#000" stroke-width="7"/></mask></defs><circle r="50" fill="${c.m}" mask="url(#sm)"/>`, [-50, -50, 50, 50]));
def('S03', 'Lens', 'One panel of the cap, alone: a calm vertical lens.', 'ink', (c) =>
  lockup(c, `<path d="M0 -52A60 60 0 0 1 0 52A60 60 0 0 1 0 -52Z" fill="${c.m}"/>`, [-17, -52, 17, 52]));
def('S04', 'Eclipse', 'A disc with a lavender crescent at the front, like the visor.', 'light', (c) =>
  lockup(c, `<circle cx="0" cy="0" r="50" fill="${c.a}"/><circle cx="-13" cy="0" r="49" fill="${c.m}"/>`, [-62, -50, 50, 50]));
def('S05', 'Spotlight', 'A beam and its pool of light, drawn as two shapes.', 'ink', (c) =>
  lockup(c, `<defs><linearGradient id="sb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.a}" stop-opacity="0"/></linearGradient></defs><path d="M-18 -50H18L44 34H-44Z" fill="url(#sb)"/><ellipse cx="0" cy="38" rx="58" ry="11" fill="${c.m}"/>`, [-58, -50, 58, 49]));
def('S06', 'Arena', 'Three rings of seats around a stage.', 'purple', (c) =>
  lockup(c, `<path d="M-18 40A18 18 0 0 1 18 40Z" fill="${c.m}"/>` + [32, 46, 60].map((r, i) => `<path d="M${-r} 40A${r} ${r} 0 0 1 ${r} 40" fill="none" stroke="${i === 1 ? c.a : c.m}" stroke-width="7"/>`).join('') + `<rect x="-64" y="44" width="128" height="6" rx="3" fill="${c.a}"/>`, [-64, -24, 64, 50]));
def('S07', 'Arch', 'A doorway with a rounded head: the way in.', 'light', (c) =>
  lockup(c, `<path d="M-34 52V-14A34 34 0 0 1 34 -14V52Z" fill="${c.m}"/>`, [-34, -48, 34, 52]));
def('S08', 'Contour', 'One continuous line traces a top hat, like a signature.', 'ink', (c) =>
  lockup(c, `<path d="M-60 40H-26V-36Q-26 -44 -18 -44H18Q26 -44 26 -36V40H60" fill="none" stroke="${c.m}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M-26 22H26" stroke="${c.a}" stroke-width="7"/>`, [-64, -48, 64, 44]));
def('S09', 'Silhouette', 'A top hat in two rectangles, with one gap between them.', 'purple', (c) =>
  lockup(c, `<rect x="-24" y="-48" width="48" height="72" rx="3" fill="${c.m}"/><rect x="-54" y="30" width="108" height="11" rx="5.5" fill="${c.a}"/>`, [-54, -48, 54, 41]));
def('S10', 'Orbit', 'A disc inside a tilted ring: every event is its own world.', 'light', (c) =>
  lockup(c, `<g transform="rotate(-16)"><path d="M-62 0A62 15 0 0 1 62 0" fill="none" stroke="${c.a}" stroke-width="5"/></g><circle r="34" fill="${c.m}"/><g transform="rotate(-16)"><path d="M-62 0A62 15 0 0 0 62 0" fill="none" stroke="${c.a}" stroke-width="5"/></g>`, [-62, -34, 62, 34]));

// Build SVG strings
const out = L.map((l) => {
  const c = PAL[l.pal]; const g = l.build(c); const [x0, y0, x1, y1] = g.bb; const pad = 2;
  const w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  const svg = (maxW, maxH) => { const k = Math.min(maxW / w, maxH / h); return `<svg aria-label="${l.id} ${l.name}" viewBox="${r2(x0 - pad)} ${r2(y0 - pad)} ${r2(w)} ${r2(h)}" width="${r2(w)}" height="${r2(h)}" style="width:${r2(w * k)}px;height:${r2(h * k)}px">${g.els}</svg>`; };
  return { id: l.id, name: l.name, line: l.line, pal: l.pal, bg: c.bg, big: svg(420, 150), small: svg(210, 70), w, h };
});
fs.writeFileSync('pro.json', JSON.stringify(out, null, 1));
const page = `<body style="margin:0;background:#e9e6ef;display:grid;grid-template-columns:repeat(3,560px);gap:12px;padding:12px;font:13px sans-serif">` +
  out.map((o) => `<div><div style="height:240px;background:${o.bg};border-radius:10px;display:flex;align-items:center;justify-content:center;${o.pal === 'light' ? 'border:1px solid #ddd' : ''}">${o.big}</div><div>${o.id} ${o.name} — ${o.line}</div></div>`).join('') + '</body>';
fs.writeFileSync('pro-preview.html', page);
console.log(out.map((o) => o.id + ':' + o.big.length).join(' '));
