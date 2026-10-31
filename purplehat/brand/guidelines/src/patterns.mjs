// Full-page pattern systems (page px: 1123 × 794). Each pattern is built from the brand's three shapes:
// the round-capped stroke, the capsule (place) and the dot (person), at logo proportions.
import { C, f2, markInner, rng, W as LW, H as LH } from './lib.mjs';
import { ripple } from './print.mjs';

const PW = 1123, PH = 794;
const rect = fill => `<rect width="${PW}" height="${PH}" fill="${fill}"/>`;
const cap = (x, y, w, h, a = '') => `<rect x="${f2(x - w / 2)}" y="${f2(y - h / 2)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(Math.min(w, h) / 2)}" ${a}/>`;
const dot = (x, y, r, fill) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${fill}"/>`;
const mk = (x, y, w, o) => `<g transform="translate(${f2(x)} ${f2(y)}) scale(${(w / LW).toFixed(5)})">${markInner(o)}</g>`;

// 1 — Toggle field: a grid of capsules, each one a switch; a few people have switched on
function toggleField() {
  const R = rng(5), cw = 96, ch = 40, gx = 30, gy = 30; let s = rect(C.warm) + `<g fill="none" stroke="${C.violet}" stroke-width="2.4">`, d = '';
  for (let j = 0, y = 34; y < PH + ch; j++, y += ch + gy) for (let i = 0, x = (j % 2) * (cw + gx) / 2 - 20; x < PW + cw; i++, x += cw + gx) {
    s += cap(x, y, cw, ch); const on = R() < 0.14, kx = on ? x + cw / 2 - ch / 2 : x - cw / 2 + ch / 2;
    d += on ? dot(kx, y, ch * 0.32, C.blue) : `<circle cx="${f2(kx)}" cy="${f2(y)}" r="${f2(ch * 0.32)}" fill="none" stroke="${C.violet}" stroke-width="2.4"/>`;
  }
  return s + '</g>' + d;
}
// 2 — Ripple: one person switched on, sending rings through the room
const rippleP = () => rect(C.warm) + ripple(PW, PH, { dx: PW * 0.63, dy: PH * 0.5, n: 30, r: 38, w0: 1.1, dw: 0.07 });
// 3 — Stroke · gap · dot: the logo's own rhythm as a score
function rhythm() {
  const R = rng(9), sw = 14, gap = 18.6, rr = 7.4; let s = rect(C.violet);
  for (let y = 46; y < PH; y += 44) { let x = -20 - R() * 120;
    while (x < PW + 40) { const L = 60 + R() * 260; s += `<line x1="${f2(x)}" y1="${y}" x2="${f2(x + L)}" y2="${y}" stroke="${C.warm}" stroke-width="${sw}" stroke-linecap="round"/>`;
      s += dot(x + L + gap + rr, y, rr, R() < 0.22 ? C.blue : C.warm); x += L + gap + 2 * rr + 34 + R() * 40; } }
  return s;
}
// 4 — Constellation: people (dots) connecting through places (capsules)
function constellation() {
  const R = rng(14), P = []; let s = rect('#FFFFFF');
  for (let j = 0; j < 7; j++) for (let i = 0; i < 11; i++) P.push([(i + 0.5 + (R() - 0.5) * 0.8) * PW / 11, (j + 0.5 + (R() - 0.5) * 0.8) * PH / 7, R() < 0.12 ? 'place' : R() < 0.18 ? 'blue' : 'dot']);
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < 150) s += `<line x1="${f2(P[i][0])}" y1="${f2(P[i][1])}" x2="${f2(P[j][0])}" y2="${f2(P[j][1])}" stroke="${C.violet}" stroke-width="${(1.6 * (1 - d / 150) + 0.4).toFixed(2)}" stroke-opacity=".55"/>`; }
  for (const [x, y, k] of P) s += k === 'place' ? cap(x, y, 58, 24, `fill="#FFFFFF" stroke="${C.violet}" stroke-width="2.4"`) + dot(x + 17, y, 7, C.blue) : dot(x, y, k === 'blue' ? 9 : 5, k === 'blue' ? C.blue : C.violet);
  return s;
}
// 5 — Monogram: the PhE tiled tone-on-tone, one in full colour
function monogram() {
  const w = 190, h = w * LH / LW; let s = rect(C.violet);
  for (let j = 0, y = 30; y < PH; j++, y += h + 44) for (let i = 0, x = (j % 2) * (w + 46) / 2 - 80; x < PW; i++, x += w + 46) {
    const hero = j === 3 && i === 3; s += mk(x, y, w, hero ? { color: C.warm, dot: C.blue } : { color: C.v800, dot: C.v600 });
  }
  return s;
}
// 6 — Lanes: rows of people and places moving through the city
function lanes() {
  const R = rng(21), lh = 46; let s = rect(C.blue);
  for (let j = 0, y = 40; y < PH; j++, y += lh + 26) { let x = -R() * 140;
    while (x < PW + 60) { const k = R(); if (k < 0.45) { const L = lh * (1.6 + R() * 2.2); s += cap(x + L / 2, y, L, lh, `fill="${j % 3 === 1 ? C.warm : '#FFFFFF'}"`); x += L + 22; }
      else if (k < 0.8) { s += dot(x + lh / 2, y, lh / 2, R() < 0.3 ? C.violet : '#FFFFFF'); x += lh + 22; }
      else { const L = lh * 2.6; s += cap(x + L / 2, y, L, lh, `fill="none" stroke="#FFFFFF" stroke-width="3"`) + dot(x + L - lh / 2, y, lh * 0.3, C.violet); x += L + 22; } } }
  return s;
}
// 7 — Halftone capsule: a field of dots that swell into one great capsule, its person in blue
function halftone() {
  const st = 22, cx = PW / 2, cy = PH / 2, ch = 420, cw = 860; let s = rect(C.warm);
  const sdf = (x, y) => { const hx = Math.max(Math.abs(x - cx) - (cw - ch) / 2, 0), hy = y - cy; return Math.hypot(hx, hy) - ch / 2; };
  for (let y = st / 2; y < PH; y += st) for (let x = st / 2; x < PW; x += st) {
    const d = sdf(x, y), r = d < 0 ? Math.max(1.2, 8.6 * Math.min(1, -d / 60) * (0.55 + 0.45 * Math.cos(d / 26) ** 2)) : Math.max(0, 3.2 - d / 40);
    if (r > 0.4) s += dot(x, y, r, C.violet);
  }
  return s + dot(cx + cw / 2 - ch / 2, cy, ch * 0.3, C.blue);
}
// 8 — Supergraphic: the mark at architectural scale, cropped by the frame
const supergraphic = () => rect(C.warm) + mk(-260, -120, 1700, { color: C.blue, dot: C.violet });
// 9 — Orbit: people circling the place they are heading to
function orbit() {
  const R = rng(31), cx = PW * 0.5, cy = PH * 0.5; let s = rect(C.violet);
  for (let i = 1; i <= 11; i++) { const r = 48 + i * 46; s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.v600}" stroke-width="${i % 3 === 0 ? 2.4 : 1.2}"/>`;
    const n = 2 + Math.floor(R() * 3); for (let k = 0; k < n; k++) { const a = R() * Math.PI * 2; s += dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, i % 4 === 0 ? 9 : 6, R() < 0.3 ? C.blue : C.warm); } }
  return s + cap(cx, cy, 150, 64, `fill="${C.warm}"`) + dot(cx + 43, cy, 21, C.blue);
}

export const PATTERNS = [
  ['Toggle field', toggleField, 'Event backdrops, registration desks, lanyards. Switch on one in seven.', false],
  ['Ripple', rippleP, 'Business cards, invitations, stage screens before the show.', false],
  ['Stroke · gap · dot', rhythm, 'Ticket stubs, agenda strips, presentation dividers.', true],
  ['Constellation', constellation, 'Networking zones, delegate apps, social carousels.', false],
  ['Monogram', monogram, 'Merchandise, gift wrap, packaging, step-and-repeat walls.', true],
  ['Lanes', lanes, 'Wayfinding, floor graphics, motion backgrounds.', false],
  ['Halftone capsule', halftone, 'Posters, LED walls, large-format hoardings.', false],
  ['Supergraphic', supergraphic, 'Building wraps, stage fascia, entrance arches, website heroes.', false],
  ['Orbit', orbit, 'Opening screens, countdowns, award nights.', true],
];
export const patternPage = fn => `<svg style="position:absolute;left:0;top:0" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">${fn()}</svg>`;
