// The Capsule — the brand's signature device. A capsule (place) holding a circle (person) = an experience.
// All proportions are derived from the logo geometry in ../logo-geom.js (no magic numbers).
import { C, f2, uid, photo, T, markG, markH, STROKES, dot, SW, RD, rng } from './lib.mjs';

// ------------------------------------------------------------------ proportions from the mark
const pStemEnd = STROKES.find(p => p.id === 'P').pts[0];          // bottom of the P stem
const dP = dot('dot-P');
const hArchR = 44.5;                                                 // h arch centre-line radius (logo units)
export const LOGO_GAP = (dP.cy - RD) - (pStemEnd[1] + SW / 2);      // stroke → dot gap under the P (≈ 7.17)
export const GAP_RATIO = LOGO_GAP / (RD * 2);                        // gap ÷ dot diameter (≈ 0.28)
export const CAP = {
  dot: 1 / (1 + 2 * GAP_RATIO),            // person Ø as a share of the capsule's inner height (≈ 0.64)
  gap: GAP_RATIO / (1 + 2 * GAP_RATIO),    // gap between person and capsule, same share (≈ 0.18)
  bold: SW / (2 * hArchR + SW),            // logo-weight line: the h stroke ÷ the h arch's outer width (≈ 0.21)
  regular: 1 / 12, fine: 1 / 24,
};

/** Capsule outline/solid with its person. Horizontal when w ≥ h (person travels left → right), vertical otherwise (top → bottom).
 *  state: 'apart' | 'arrive' | 'in' | 'on' | number t in [0,1]. */
export function capsule(x, y, w, h, o = {}) {
  const vert = h > w; const c = Math.min(w, h); const L = Math.max(w, h);
  const { state = 'on', line = C.violet, fill = 'none', person = null, personLine = null, noPerson = false, opacity, cls = '' } = o;
  const sw = o.sw ?? (o.weight ? c * CAP[o.weight] : c * CAP.regular);
  const inner = c - (line === 'none' ? 0 : sw);
  const D = inner * CAP.dot, g = inner * CAP.gap;
  const t = typeof state === 'number' ? state : state === 'on' ? 1 : 0;
  const lo = c / 2, hi = L - c / 2;                                   // travel of the person's centre
  let along = lo + (hi - lo) * t;
  if (state === 'arrive') along = c * 0.02 + (line === 'none' ? 0 : sw / 2) - D * 0.06;
  if (state === 'apart') along = -D / 2 - c * 0.42;
  const [pcx, pcy] = vert ? [x + c / 2, y + along] : [x + along, y + c / 2];
  const pf = person ?? (state === 'on' ? C.blue : 'none');
  const pl = personLine ?? (pf === 'none' ? line : 'none');
  let s = `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(c / 2)}" fill="${fill}" stroke="${line}" stroke-width="${f2(line === 'none' ? 0 : sw)}"/>`;
  if (!noPerson) s += `<circle cx="${f2(pcx)}" cy="${f2(pcy)}" r="${f2(D / 2 - (pl !== 'none' ? sw / 2 : 0))}" fill="${pf}" stroke="${pl}" stroke-width="${f2(pl !== 'none' ? sw : 0)}"${cls ? ` class="${cls}"` : ''}/>`;
  return `<g${opacity != null ? ` opacity="${opacity}"` : ''}>${s}</g>`;
}
/** Where the person sits (centre + radius) for a solid capsule — handy for placing icons/arrows inside it. */
export function personOf(x, y, w, h, t = 1, sw = 0) {
  const vert = h > w; const c = Math.min(w, h); const L = Math.max(w, h); const inner = c - sw; const D = inner * CAP.dot;
  const along = c / 2 + (L - c) * t; return vert ? { cx: x + c / 2, cy: y + along, r: D / 2 } : { cx: x + along, cy: y + c / 2, r: D / 2 };
}
/** A capsule used as an image frame. Photo placeholder clipped to the capsule; optional solid person circle inside. */
export function capsuleFrame(x, y, w, h, o = {}) {
  const id = uid('cf'); const c = Math.min(w, h);
  const { person = null, t = 1, ring = null, ringW = 2, photoO = {} } = o;
  let s = `<defs><clipPath id="${id}"><rect x="0" y="0" width="${f2(w)}" height="${f2(h)}" rx="${f2(c / 2)}"/></clipPath></defs>`;
  s += `<g clip-path="url(#${id})">${photo(w, h, { label: '', ...photoO })}${o.overlay || ''}</g>`;
  if (ring) s += `<rect x="${f2(-ringW * 3)}" y="${f2(-ringW * 3)}" width="${f2(w + ringW * 6)}" height="${f2(h + ringW * 6)}" rx="${f2(c / 2 + ringW * 3)}" fill="none" stroke="${ring}" stroke-width="${ringW}"/>`;
  if (person) { const p = personOf(0, 0, w, h, t); s += `<circle cx="${f2(p.cx)}" cy="${f2(p.cy)}" r="${f2(p.r)}" fill="${person}"/>`; }
  return `<g transform="translate(${f2(x)} ${f2(y)})">${s}</g>`;
}
/** Text chip: label in a capsule + a person circle at the end (arrow, status, number…). Height h, auto width from label length. */
export function chip(x, y, label, o = {}) {
  const { h = 40, size = h * 0.36, bg = C.violet, fg = C.warm, dotc = C.blue, dotInner = '', line = 'none', sw = 1.5, weight = 500, width = null, lead = false, ls = 0 } = o;
  const tw = label.length * size * 0.56 + label.length * ls * size;
  const D = h * CAP.dot, g = h * CAP.gap; const w = width ?? (h * 0.5 + tw + (dotc ? g + D + g : h * 0.5));
  let s = `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(h / 2)}" fill="${bg}" stroke="${line}" stroke-width="${line === 'none' ? 0 : sw}"/>`;
  const tx = lead && dotc ? x + g + D + g * 1.1 : x + h * 0.5;
  s += T(tx, y + h / 2 + size * 0.36, label, { size, fill: fg, weight, ls });
  if (dotc) { const cx = lead ? x + g + D / 2 : x + w - g - D / 2; s += `<circle cx="${f2(cx)}" cy="${f2(y + h / 2)}" r="${f2(D / 2)}" fill="${dotc}"/>`; if (dotInner) s += dotInner(cx, y + h / 2, D / 2); }
  return { svg: s, w };
}
export const arrowIn = (dir = 0, col = '#fff') => (cx, cy, r) => `<path d="M${f2(cx - r * 0.42)} ${f2(cy)}h${f2(r * 0.84)}m${f2(-r * 0.34)} ${f2(-r * 0.34)} ${f2(r * 0.34)} ${f2(r * 0.34)} ${f2(-r * 0.34)} ${f2(r * 0.34)}" stroke="${col}" stroke-width="${f2(r * 0.16)}" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${dir} ${f2(cx)} ${f2(cy)})"/>`;

// ------------------------------------------------------------------ crowd silhouettes made of the brand's own shapes
export function crowd(w, h, o = {}) {
  const { seed = 5, rows = 3, cols = ['#1A0B45', '#120632', '#08021A'], rim = null, base = 0.55, scale = 1 } = o; const R = rng(seed); let s = '';
  for (let r = 0; r < rows; r++) {
    const t = r / Math.max(1, rows - 1); const hr = h * (0.07 + 0.09 * t) * scale; const by = h * (base + (1 - base) * t * 0.85);
    let x = -hr * R() * 2;
    while (x < w + hr * 2) {
      const hy = by - hr * (0.4 + R() * 0.6);
      s += `<circle cx="${f2(x)}" cy="${f2(hy)}" r="${f2(hr)}" fill="${cols[r % cols.length]}"/><rect x="${f2(x - hr * 1.9)}" y="${f2(hy + hr * 1.12)}" width="${f2(hr * 3.8)}" height="${f2(h)}" rx="${f2(hr * 1.9)}" fill="${cols[r % cols.length]}"/>`;
      if (rim && r === rows - 1 && R() < .5) s += `<path d="M${f2(x - hr * 0.85)} ${f2(hy - hr * 0.5)}A${f2(hr)} ${f2(hr)} 0 0 1 ${f2(x + hr * 0.6)} ${f2(hy - hr * 0.8)}" stroke="${rim}" stroke-width="${f2(hr * 0.12)}" fill="none" opacity=".5" stroke-linecap="round"/>`;
      if (R() < 0.1) { const a = (R() - .5) * 26; s += `<rect x="${f2(x + hr * 1.1)}" y="${f2(hy - hr * 3)}" width="${f2(hr * 0.7)}" height="${f2(hr * 4)}" rx="${f2(hr * 0.35)}" fill="${cols[r % cols.length]}" transform="rotate(${a.toFixed(1)} ${f2(x + hr * 1.4)} ${f2(hy + hr)})"/>`; }
      x += hr * (2.5 + R() * 1.3);
    }
  }
  return s;
}
/** A standing person in the brand's language: circle head + capsule body. (x = centre, y = feet) */
export const figure = (x, y, hgt, col = C.ink, o = {}) => { const hr = hgt * 0.085, bw = hgt * 0.24; return `<g opacity="${o.opacity ?? 1}"><circle cx="${f2(x)}" cy="${f2(y - hgt + hr)}" r="${f2(hr)}" fill="${col}"/><rect x="${f2(x - bw / 2)}" y="${f2(y - hgt + hr * 2.35)}" width="${f2(bw)}" height="${f2(hgt * 0.5)}" rx="${f2(bw / 2)}" fill="${col}"/><rect x="${f2(x - bw * 0.36)}" y="${f2(y - hgt * 0.42)}" width="${f2(bw * 0.3)}" height="${f2(hgt * 0.42)}" rx="${f2(bw * 0.15)}" fill="${col}"/><rect x="${f2(x + bw * 0.06)}" y="${f2(y - hgt * 0.42)}" width="${f2(bw * 0.3)}" height="${f2(hgt * 0.42)}" rx="${f2(bw * 0.15)}" fill="${col}"/></g>`; };
const shadowE = (cx, cy, rx, ry, op = .35, col = '#1A1033') => { const id = uid('se'); return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${op}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="url(#${id})"/>`; };
const lin = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rad = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;

// ------------------------------------------------------------------ LED wall content (also used on its own)
export function ledArt(w, h, o = {}) {
  const { title = ['PhE Experience', 'Summit 2026'], kicker = 'Hyderabad · 12 December' } = o; const id = uid('led');
  const c = h * 0.56, L = w * 0.46; const cx = w - L - h * 0.16, cy = (h - c) / 2;
  let s = `<defs>${rad(id + 'g', [[0, C.v800], [1, C.v950]], .7, .5, .8)}</defs><rect width="${f2(w)}" height="${f2(h)}" fill="url(#${id}g)"/>`;
  s += capsule(cx, cy, L, c, { line: C.warm, fill: 'none', sw: c * CAP.fine * 1.4, state: 'on' });
  s += `<circle cx="${f2(cx + L - c / 2)}" cy="${f2(cy + c / 2)}" r="${f2(c * 0.5)}" fill="${C.blue}" opacity=".25"/>`;
  s += T(h * 0.16, h * 0.3, kicker, { size: h * 0.045, fill: C.v200, caps: true, ls: 0.2, weight: 500 });
  title.forEach((l, i) => { s += T(h * 0.16, h * 0.44 + i * h * 0.13, l, { size: h * 0.12, fill: C.warm, weight: 500, ls: -0.02 }); });
  s += markG(h * 0.16, h - h * 0.14 - markH(h * 0.36), h * 0.36, { color: C.warm, dot: C.b400 });
  return s;
}

// ------------------------------------------------------------------ stage scene (elevation, night)
export function stageScene(w, h, o = {}) {
  const id = uid('st'); const R = rng(o.seed || 9);
  const lw = w * 0.62, lh = lw * 0.36, lx = (w - lw) / 2, ly = h * 0.12;          // LED wall 2.8:1
  const sx = w * 0.06, sh = h * 0.06, sy = ly + lh + h * 0.12;                  // stage
  let s = `<defs>${lin(id + 'bg', [[0, '#0B0322'], [0.55, '#14063A'], [1, '#07021A']])}${rad(id + 'glow', [[0, C.v600, .55], [.5, C.v800, .2], [1, C.v950, 0]], .5, .35, .6)}
  ${lin(id + 'beam', [[0, '#fff', .35], [1, '#fff', 0]])}${lin(id + 'beamb', [[0, C.b400, .5], [1, C.b400, 0]])}${lin(id + 'fl', [[0, '#2A1468'], [1, '#0E0428']])}${lin(id + 'ref', [[0, '#fff', .22], [1, '#fff', 0]])}
  <clipPath id="${id}c"><rect width="${f2(w)}" height="${f2(h)}"/></clipPath><mask id="${id}m"><rect x="${lx}" y="${sy - sh * 0.1}" width="${lw}" height="${sh}" fill="url(#${id}ref)"/></mask></defs><g clip-path="url(#${id}c)">`;
  s += `<rect width="${f2(w)}" height="${f2(h)}" fill="url(#${id}bg)"/><rect width="${f2(w)}" height="${f2(h)}" fill="url(#${id}glow)"/>`;
  // truss + fixtures + beams
  s += `<rect x="0" y="${f2(h * 0.035)}" width="${f2(w)}" height="${f2(h * 0.012)}" fill="#2B2147"/>`;
  for (let i = 0; i < 9; i++) { const fx = w * (0.08 + i * 0.105); s += `<rect x="${f2(fx - 5)}" y="${f2(h * 0.045)}" width="10" height="9" rx="3" fill="#3A3058"/>`; const ex = fx + (R() - 0.5) * w * 0.25; s += `<polygon points="${f2(fx - 3)},${f2(h * 0.06)} ${f2(fx + 3)},${f2(h * 0.06)} ${f2(ex + w * 0.04)},${f2(sy)} ${f2(ex - w * 0.04)},${f2(sy)}" fill="url(#${id}${i % 3 === 1 ? 'beamb' : 'beam'})" opacity="${(0.18 + R() * .2).toFixed(2)}"/>`; }
  // side IMAG screens (portrait capsules)
  const iw = w * 0.085, ih = lh * 1.05, iy = ly + (lh - ih) / 2;
  for (const ix of [w * 0.045, w - w * 0.045 - iw]) s += capsuleFrame(ix, iy, iw, ih, { photoO: { seed: 61 + Math.round(ix), crowd: false, beams: true, tone: 'violet' }, overlay: figure(iw / 2, ih * 1.02, ih * 0.62, '#12052E'), ring: '#3A3058', ringW: 1.5 });
  // LED wall
  s += `<rect x="${f2(lx - 4)}" y="${f2(ly - 4)}" width="${f2(lw + 8)}" height="${f2(lh + 8)}" rx="3" fill="#0A0418"/>`;
  s += `<g transform="translate(${f2(lx)} ${f2(ly)})">${ledArt(lw, lh, o)}</g>`;
  // stage deck + reflection + front fascia
  s += `<rect x="${f2(sx)}" y="${f2(sy - sh * 0.1)}" width="${f2(w - 2 * sx)}" height="${f2(sh)}" fill="url(#${id}fl)"/>`;
  s += `<g mask="url(#${id}m)"><g transform="translate(${f2(lx)} ${f2(sy + lh * 0.25 - sh * 0.1)}) scale(1 -0.25)">${ledArt(lw, lh, o)}</g></g>`;
  s += `<rect x="${f2(sx)}" y="${f2(sy + sh * 0.9)}" width="${f2(w - 2 * sx)}" height="${f2(h * 0.07)}" fill="#0C0424"/><rect x="${f2(sx)}" y="${f2(sy + sh * 0.9)}" width="${f2(w - 2 * sx)}" height="2.2" fill="${C.blue}"/>`;
  // lectern (vertical capsule front) + speaker
  const lcx = w * 0.74, lcw = w * 0.04, lch = h * 0.16;
  s += figure(lcx + lcw * 0.1, sy + sh * 0.2, h * 0.24, '#0A0320');
  s += `<rect x="${f2(lcx - lcw / 2)}" y="${f2(sy + sh * 0.25 - lch)}" width="${f2(lcw)}" height="${f2(lch)}" rx="${f2(lcw / 2)}" fill="${C.warm}"/>`;
  s += `<circle cx="${f2(lcx)}" cy="${f2(sy + sh * 0.25 - lch + lcw / 2)}" r="${f2(lcw * 0.32)}" fill="${C.blue}"/>`;
  // audience
  s += `<g transform="translate(0 ${f2(h * 0.62)})">${crowd(w, h * 0.38, { seed: 4, rows: 3, rim: C.b400, base: 0.35, cols: ['#1A0B45', '#100530', '#06011A'] })}</g>`;
  return s + '</g>';
}

// ------------------------------------------------------------------ foyer scene: capsule entrance arch + totems (elevation, day)
export function archScene(w, h, o = {}) {
  const id = uid('ar'); const fy = h * 0.8;  // floor line
  const aw = h * 0.5, ah = h * 0.72, ax = w * 0.5 - aw / 2, ay = fy - ah, t = aw * 0.15;
  let s = `<defs>${lin(id + 'wall', [[0, '#EFEAE1'], [1, '#E2DACC']])}${lin(id + 'floor', [[0, '#D3CABA'], [1, '#EAE4D9']])}${lin(id + 'ret', [[0, C.v950], [1, C.v800]], 1, 0)}
  ${rad(id + 'spill', [[0, C.v400, .35], [1, C.v400, 0]])}<clipPath id="${id}c"><rect width="${f2(w)}" height="${f2(h)}"/></clipPath>
  <clipPath id="${id}in"><rect x="${f2(ax + t)}" y="${f2(ay + t)}" width="${f2(aw - 2 * t)}" height="${f2(ah - t + 2)}" rx="${f2((aw - 2 * t) / 2)}"/></clipPath></defs><g clip-path="url(#${id}c)">`;
  s += `<rect width="${f2(w)}" height="${f2(fy)}" fill="url(#${id}wall)"/><rect y="${f2(fy)}" width="${f2(w)}" height="${f2(h - fy)}" fill="url(#${id}floor)"/>`;
  // wall pattern band (debossed capsules, very subtle)
  for (let i = 0; i < 18; i++) { const px = i * w / 12 - 30, pw = i % 2 ? 46 : 96; s += `<rect x="${f2(px)}" y="${f2(h * 0.08)}" width="${pw}" height="46" rx="23" fill="none" stroke="#D6CDBE" stroke-width="1.4"/>`; }
  // light spill on the floor from the hall
  s += `<ellipse cx="${f2(w / 2)}" cy="${f2(fy + 6)}" rx="${f2(aw * 1.1)}" ry="${f2((h - fy) * 0.7)}" fill="url(#${id}spill)"/>`;
  s += shadowE(w / 2 + 10, fy + 2, aw * 0.75, 10, .3);
  // hall seen through the arch
  s += `<g clip-path="url(#${id}in)"><g transform="translate(${f2(ax + t)} ${f2(ay + t)})">${photo(aw - 2 * t, ah - t, { seed: 77, label: '', rows: 3, focus: .5 })}</g>
  <rect x="${f2(ax + t)}" y="${f2(ay + t)}" width="${f2(t * 0.55)}" height="${f2(ah)}" fill="url(#${id}ret)" opacity=".85"/></g>`;
  // the arch: thick capsule ring, violet, with a warm inner edge
  s += `<path d="M${f2(ax)} ${f2(fy)}V${f2(ay + aw / 2)}A${f2(aw / 2)} ${f2(aw / 2)} 0 0 1 ${f2(ax + aw)} ${f2(ay + aw / 2)}V${f2(fy)}H${f2(ax + aw - t)}V${f2(ay + aw / 2)}A${f2(aw / 2 - t)} ${f2(aw / 2 - t)} 0 0 0 ${f2(ax + t)} ${f2(ay + aw / 2)}V${f2(fy)}Z" fill="${C.violet}"/>`;
  s += `<path d="M${f2(ax + t)} ${f2(fy)}V${f2(ay + aw / 2)}A${f2(aw / 2 - t)} ${f2(aw / 2 - t)} 0 0 1 ${f2(ax + aw - t)} ${f2(ay + aw / 2)}V${f2(fy)}" fill="none" stroke="${C.v600}" stroke-width="2"/>`;
  s += T(w / 2, ay + t * 0.66, 'WELCOME', { size: t * 0.3, fill: C.warm, anchor: 'middle', ls: 0.3, weight: 500 });
  // person walking through (circle + capsule) and a guest outside
  s += figure(w / 2 + aw * 0.06, fy - 2, ah * 0.36, '#0D0526');
  s += shadowE(w * 0.28, fy + 4, 26, 5, .35) + figure(w * 0.28, fy + 2, ah * 0.36, C.ink, { opacity: .92 });
  // totems: vertical capsules on plinths
  const tot = (cx, bg, fg, words, dir) => {
    const tw = h * 0.13, th = h * 0.5, tx = cx - tw / 2, ty = fy - th - 8; let q = shadowE(cx + 6, fy + 2, tw * 0.9, 7, .32);
    q += `<rect x="${f2(cx - tw * 0.3)}" y="${f2(fy - 10)}" width="${f2(tw * 0.6)}" height="10" rx="3" fill="#B3AA9B"/>`;
    q += `<rect x="${f2(tx)}" y="${f2(ty)}" width="${f2(tw)}" height="${f2(th)}" rx="${f2(tw / 2)}" fill="${bg}"/>`;
    q += markG(tx + tw * 0.2, ty + tw * 0.62, tw * 0.6, { color: fg, dot: C.blue });
    words.forEach((wd, i) => { q += T(tx + tw * 0.2, ty + th * 0.42 + i * tw * 0.2, wd, { size: tw * 0.15, fill: fg, weight: 500 }); });
    const p = personOf(tx, ty, tw, th, 1); q += `<circle cx="${f2(p.cx)}" cy="${f2(p.cy)}" r="${f2(p.r)}" fill="${C.blue}"/>` + arrowIn(dir)(p.cx, p.cy, p.r);
    return q;
  };
  s += tot(w * 0.13, C.warm, C.violet, ['Hall A', 'Keynote'], 0) + tot(w * 0.87, C.violet, C.warm, ['Breakouts', 'Level 1'], -90);
  return s + '</g>';
}

// ------------------------------------------------------------------ walk-in capsule pod (installation), elevation
export function podScene(w, h, o = {}) {
  const id = uid('pd'); const fy = h * 0.82; const pw = w * 0.8, ph = h * 0.5, px = (w - pw) / 2, py = fy - ph;
  let s = `<defs>${lin(id + 'bg', [[0, '#0B0322'], [1, '#1C0A4A']])}${lin(id + 'in', [[0, C.b800], [1, C.v800]], 1, 0)}<clipPath id="${id}c"><rect width="${f2(w)}" height="${f2(h)}"/></clipPath><clipPath id="${id}p"><rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" rx="${f2(ph / 2)}"/></clipPath></defs><g clip-path="url(#${id}c)">`;
  s += `<rect width="${f2(w)}" height="${f2(h)}" fill="url(#${id}bg)"/><rect y="${f2(fy)}" width="${f2(w)}" height="${f2(h - fy)}" fill="#090219"/>`;
  s += `<ellipse cx="${f2(w / 2)}" cy="${f2(fy + 4)}" rx="${f2(pw * 0.6)}" ry="${f2(h * 0.07)}" fill="${C.blue}" opacity=".22"/>`;
  s += `<g clip-path="url(#${id}p)"><rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" fill="url(#${id}in)"/>`;
  const R = rng(12); for (let i = 0; i < 40; i++) s += `<circle cx="${f2(px + R() * pw)}" cy="${f2(py + R() * ph)}" r="${f2(1 + R() * 3)}" fill="#fff" opacity="${(0.2 + R() * 0.5).toFixed(2)}"/>`;
  s += figure(px + pw * 0.34, fy, ph * 0.62, '#0A0320') + figure(px + pw * 0.5, fy, ph * 0.56, '#0A0320') + `</g>`;
  s += `<rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" rx="${f2(ph / 2)}" fill="none" stroke="${C.warm}" stroke-width="${f2(ph * 0.05)}"/>`;
  const p = personOf(px, py, pw, ph, 1, ph * 0.05); s += `<circle cx="${f2(p.cx)}" cy="${f2(p.cy)}" r="${f2(p.r)}" fill="${C.blue}"/>`;
  return s + '</g>';
}
