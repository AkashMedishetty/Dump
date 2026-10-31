// Shared kit for the 43 worlds: deterministic noise, cached textures, the PurpleHat mark in any material.
import { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, vnoise, TAU } from '/core/lib.js';
export { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, vnoise, TAU };

export const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;
export const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const h2 = (x, y) => hash(x * 12.9898 + y * 78.233);
export function vn2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v);
}
export const fbm = (x, y, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vn2(x * f, y * f); f *= 2; a *= .5; } return s; };

// ---------- canvases ----------
const CACHE = new Map();
export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function tex(key, w, h, draw) {
  const k = key + '@' + w + 'x' + h; if (CACHE.has(k)) return CACHE.get(k);
  const c = canvas(w, h); draw(c.getContext('2d'), w, h); CACHE.set(k, c); return c;
}
// paper / board / screen grain: base colour + fbm mottling + fine grain (+ fibres)
export function paper(key, w, h, base, { mottle = 10, grain = 8, fibres = 0, seed = 1, scale = 1 } = {}) {
  return tex('paper:' + key, w, h, (g) => {
    const id = g.createImageData(w, h), d = id.data, r = mulberry(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const m = (fbm(x / (180 * scale) + seed, y / (180 * scale)) - .5) * mottle, n = (r() - .5) * grain, i = (y * w + x) * 4;
      d[i] = base[0] + m + n; d[i + 1] = base[1] + m + n; d[i + 2] = base[2] + m * .9 + n; d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    if (fibres) { const rr = mulberry(seed + 9); g.lineWidth = 1;
      for (let i = 0; i < fibres; i++) { const x = rr() * w, y = rr() * h, a = rr() * TAU, l = 6 + rr() * 26; g.strokeStyle = `rgba(${rr() < .5 ? '255,255,255' : '0,0,0'},${.04 + rr() * .05})`;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
  });
}
export function grainOver(g, W, H, t, a = .06, key = 'g') {    // animated film grain from 4 cached plates
  const k = Math.floor(t * 24) % 4;
  const c = tex('grain' + key + k, 512, 512, (q, w, h) => { const id = q.createImageData(w, h), d = id.data, r = mulberry(31 + k);
    for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } q.putImageData(id, 0, 0); });
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(c, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
export function vignette(g, W, H, a = .5, inner = .35, col = '0,0,0') {
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * inner, W / 2, H / 2, Math.hypot(W, H) * .6);
  v.addColorStop(0, `rgba(${col},0)`); v.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- the mark: the PhE logo ----------
// Logo units (from logo-geom.js): 438.99 x 159.84, stroke width 24, dots r 12.75. Eight parts, in drawing order:
//   0 P · 1 h-stem · 2 h-arch · 3 E-top · 4 E-bowl · 5 dot-P · 6 dot-h · 7 dot-E      (ACC = the three dots)
// M = { x, y, R } on screen: the logo is centred on (x, y) and drawn 3.2·R wide (so ~1.14·R tall).
import LOGO from './logo-geom.js';
export { LOGO };
export const LW = LOGO.width, LH = LOGO.height, STROKE = LOGO.w;
export const PARTS = LOGO.parts.length, ACC = [5, 6, 7];
export const isAcc = (k) => k >= 5;
export const logoScale = (M) => 3.2 * M.R / LW;                      // screen px per logo unit
export const halfW = (M) => 1.6 * M.R, halfH = (M) => 1.6 * M.R * LH / LW;
let PATHS = null, LINES = null;
// filled outline of each part (use for fill / clip / isPointInPath)
export const markPaths = () => PATHS || (PATHS = LOGO.parts.map(p => new Path2D(p.fill)));
// centre line of each stroke part (use with lineWidth = STROKE for a stroked logo, or thinner for a line drawing); dots get a circle
export const markLines = () => LINES || (LINES = LOGO.parts.map(p => p.kind === 'dot' ? (() => { const q = new Path2D(); q.arc(p.cx, p.cy, p.r * .55, 0, TAU); return q; })() : new Path2D(p.line)));
// inMark: draw in logo units (0..LW, 0..LH), placed and scaled for M
export function inMark(g, M, fn) { const k = logoScale(M); g.save(); g.translate(M.x, M.y); g.scale(k, k); g.translate(-LW / 2, -LH / 2); fn(g, k); g.restore(); }
// screen <-> logo units
export const toScreen = (M, x, y) => { const k = logoScale(M); return [M.x + (x - LW / 2) * k, M.y + (y - LH / 2) * k]; };
export const toLogo = (M, sx, sy) => { const k = logoScale(M); return [(sx - M.x) / k + LW / 2, (sy - M.y) / k + LH / 2]; };
// anchor of a part on screen (its bbox centre) — use for labels, leaders, callouts
export function anchor(M, k) { const b = LOGO.parts[k].bbox; return toScreen(M, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2); }
export function partBox(M, k) { const b = LOGO.parts[k].bbox, [x0, y0] = toScreen(M, b[0], b[1]), [x1, y1] = toScreen(M, b[2], b[3]); return [x0, y0, x1, y1]; }
export function fillMark(g, M, main, acc, { only = null, shadow = null } = {}) {
  inMark(g, M, () => { const P = markPaths();
    if (shadow) { const k = logoScale(M); g.shadowColor = shadow.c; g.shadowBlur = shadow.b; g.shadowOffsetX = shadow.x || 0; g.shadowOffsetY = shadow.y || 0; }
    P.forEach((p, k) => { if (only !== null && !only.includes(k)) return; g.fillStyle = isAcc(k) ? acc : main; g.fill(p); }); });
}
// outline of every part (a line drawing of the logo's silhouette), lw in screen px
export function strokeMark(g, M, col, lw, acc = null) {
  inMark(g, M, (_, k) => { const P = markPaths(); g.lineWidth = lw / k; g.lineJoin = 'round';
    P.forEach((p, i) => { g.strokeStyle = isAcc(i) && acc ? acc : col; g.stroke(p); }); });
}
// the logo drawn as strokes along its centre lines (lw in screen px; default = the true stroke width)
export function lineMark(g, M, col, lw = null, acc = null, only = null) {
  inMark(g, M, (_, k) => { const L = markLines(); g.lineCap = 'round'; g.lineJoin = 'round';
    L.forEach((p, i) => { if (only !== null && !only.includes(i)) return; const isd = isAcc(i);
      if (isd) { const pt = LOGO.parts[i]; g.fillStyle = acc || col; const r = lw ? Math.max(lw / k, pt.r * .9) / (lw && lw / k < pt.r ? 1 : 1) : pt.r; g.beginPath(); g.arc(pt.cx, pt.cy, lw ? Math.min(pt.r, Math.max(lw / k * .9, pt.r * .6)) : pt.r, 0, TAU); g.fill(); return; }
      g.strokeStyle = col; g.lineWidth = lw ? lw / k : STROKE; g.stroke(p); }); });
}
// which part a point (in logo units) falls in: -1 none, 0..7 — raster lookup, built once
let HIT = null; const HS = 4;
function hitMap() {
  if (HIT) return HIT; const w = Math.ceil(LW * HS / 2), h = Math.ceil(LH * HS / 2), c = canvas(w, h), q = c.getContext('2d');
  q.scale(HS / 2, HS / 2); markPaths().forEach((p, k) => { q.fillStyle = `rgb(${k + 1},0,0)`; q.fill(p); });
  const d = q.getImageData(0, 0, w, h).data; HIT = { w, h, d }; return HIT;
}
export function markHit(x, y) {
  const H = hitMap(), i = Math.floor(x * HS / 2), j = Math.floor(y * HS / 2);
  if (i < 0 || j < 0 || i >= H.w || j >= H.h) return -1; const v = H.d[(j * H.w + i) * 4]; return v ? Math.min(7, Math.round(v) - 1) : -1;
}
export const markHitScreen = (M, sx, sy) => { const [x, y] = toLogo(M, sx, sy); return markHit(x, y); };
// sample the logo on a screen grid: [{x, y, k, i, j}] for cells inside it
export function markCells(M, step, jitter = 0, seed = 1) {
  const out = [], r = mulberry(seed), hw = halfW(M) * 1.04, hh = halfH(M) * 1.1, ni = Math.ceil(hw / step), nj = Math.ceil(hh / step);
  for (let j = -nj; j <= nj; j++) for (let i = -ni; i <= ni; i++) {
    const x = M.x + i * step + (r() - .5) * jitter, y = M.y + j * step + (r() - .5) * jitter, k = markHitScreen(M, x, y);
    if (k >= 0) out.push({ x, y, k, i, j });
  }
  return out;
}
// one continuous tour of the logo's centre lines in drawing order (strokes, then a small loop for each dot):
// markTourPts(M, n) -> [[x, y, k], ...] in screen px; k = part index. Use for "drawn" worlds (one line, whiteboard, pen).
let TOUR = null;
function tourLogo() {
  if (TOUR) return TOUR; const pts = [];
  for (let k = 0; k < PARTS; k++) { const p = LOGO.parts[k];
    if (p.kind === 'dot') { for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * TAU; pts.push([p.cx + Math.cos(a) * p.r * .55, p.cy + Math.sin(a) * p.r * .55, k]); } }
    else { const q = p.pts; for (let i = 0; i < q.length - 1; i++) { const n = Math.max(1, Math.ceil(Math.hypot(q[i + 1][0] - q[i][0], q[i + 1][1] - q[i][1]) / 3)); for (let s = 0; s < n; s++) pts.push([lerp(q[i][0], q[i + 1][0], s / n), lerp(q[i][1], q[i + 1][1], s / n), k]); } pts.push([...q[q.length - 1], k]); }
  }
  return TOUR = pts;
}
export function markTourPts(M, n = 0) { const T = tourLogo(), step = n ? Math.max(1, Math.floor(T.length / n)) : 1, out = []; for (let i = 0; i < T.length; i += step) { const [x, y] = toScreen(M, T[i][0], T[i][1]); out.push([x, y, T[i][2]]); } return out; }
// centre line of one part in screen px (for wobbly / crayon / brush redraws of a single part)
export function partLinePts(M, k) { const p = LOGO.parts[k]; if (p.kind === 'dot') { const o = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU; o.push(toScreen(M, p.cx + Math.cos(a) * p.r * .55, p.cy + Math.sin(a) * p.r * .55)); } return o; } return p.pts.map(([x, y]) => toScreen(M, x, y)); }

// ---------- small drawing helpers ----------
export function poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
export function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); }
// wobbly hand line (fineliner, crayon, marker): deterministic jitter by seed
export function wobble(g, pts, amp, seed, close = false) {
  const r = mulberry(seed); g.beginPath();
  const P = close ? [...pts, pts[0]] : pts;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 14));
    for (let s = 0; s <= n; s++) { const u = s / n, x = lerp(x0, x1, u) + (r() - .5) * amp, y = lerp(y0, y1, u) + (r() - .5) * amp; i === 0 && s === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
  }
}
// text with tracking
export function track(g, s, x, y, em) { const fs = parseFloat(g.font.match(/(\d+(\.\d+)?)px/)[1]); g.letterSpacing = (em * fs) + 'px'; g.fillText(s, x, y); g.letterSpacing = '0px'; }
// a stepped (posterised) value for "on twos" animation
export const twos = (t, fps = 12) => Math.floor(t * fps) / fps;
