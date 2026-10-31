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

// ---------- the mark ----------
// Four lenses around a ring (the PurpleHat mark): top, left, bottom, and the lit one on the right. Units: radius 100.
export const MARK_SVG = [
  'M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z',
  'M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z',
  'M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z',
  'M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z',
];
export const ARC_DIR = [-Math.PI / 2, Math.PI, Math.PI / 2, 0];   // direction of each lens from the centre (index 3 = accent)
let PATHS = null;
export const markPaths = () => PATHS || (PATHS = MARK_SVG.map(s => new Path2D(s)));
// which lens a point (in mark units) falls in: -1 none, 0..3
export function markHit(x, y) {
  for (let k = 0; k < 4; k++) {
    const a = -ARC_DIR[k], c = Math.cos(a), s = Math.sin(a), rx = x * c - y * s, ry = x * s + y * c;
    if (rx * rx + ry * ry < 10000 && (rx - 125) ** 2 + ry * ry < 7225) return k;
  }
  return -1;
}
// lens k's mid point and tangent frame (for drawing along it)
export const lensMid = (k, r = 70) => [Math.cos(ARC_DIR[k]) * r, Math.sin(ARC_DIR[k]) * r];
export function inMark(g, M, fn) { g.save(); g.translate(M.x, M.y); g.scale(M.R / 100, M.R / 100); fn(g); g.restore(); }
export function fillMark(g, M, main, acc, { only = null, shadow = null } = {}) {
  inMark(g, M, () => { const P = markPaths();
    if (shadow) { g.shadowColor = shadow.c; g.shadowBlur = shadow.b; g.shadowOffsetX = shadow.x || 0; g.shadowOffsetY = shadow.y || 0; }
    P.forEach((p, k) => { if (only !== null && !only.includes(k)) return; g.fillStyle = k === 3 ? acc : main; g.fill(p); }); });
}
export function strokeMark(g, M, col, lw, acc = null) {
  inMark(g, M, () => { const P = markPaths(); g.lineWidth = lw * 100 / M.R; g.lineJoin = 'round';
    P.forEach((p, k) => { g.strokeStyle = k === 3 && acc ? acc : col; g.stroke(p); }); });
}
// sample the mark on a grid: returns [{x,y,k}] screen positions of cells inside the mark
export function markCells(M, step, jitter = 0, seed = 1) {
  const out = [], r = mulberry(seed), n = Math.ceil(M.R * 1.05 / step);
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const x = i * step + (r() - .5) * jitter, y = j * step + (r() - .5) * jitter, k = markHit(x * 100 / M.R, y * 100 / M.R);
    if (k >= 0) out.push({ x: M.x + x, y: M.y + y, k, i, j });
  }
  return out;
}
// point on the mark outline (all four lens outlines as one closed tour), p in 0..1
export function markTour(p) {
  const k = Math.min(3, Math.floor(p * 4)), u = p * 4 - k, a = ARC_DIR[k];
  // outer arc forward (r=100, ±42.6°) then inner arc back (centre 125 along the axis, r=85)
  const half = Math.atan2(67.7, 73.6);
  let x, y;
  if (u < .5) { const w = lerp(-half, half, u * 2); x = 100 * Math.cos(w); y = 100 * Math.sin(w); }
  else { const w0 = Math.atan2(67.7, 73.6 - 125), w = lerp(w0, TAU - w0, (u - .5) * 2); x = 125 + 85 * Math.cos(w); y = 85 * Math.sin(w); }
  const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c];
}

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
// sample a Path-like polyline of the mark outline in screen space
export function markOutlinePts(M, n = 240, k = null) {
  const pts = []; for (let i = 0; i < n; i++) { const p = k === null ? i / n : (k + i / n) / 4, [x, y] = markTour(p); pts.push([M.x + x * M.R / 100, M.y + y * M.R / 100]); } return pts;
}
// text with tracking
export function track(g, s, x, y, em) { const fs = parseFloat(g.font.match(/(\d+(\.\d+)?)px/)[1]); g.letterSpacing = (em * fs) + 'px'; g.fillText(s, x, y); g.letterSpacing = '0px'; }
// a stepped (posterised) value for "on twos" animation
export const twos = (t, fps = 12) => Math.floor(t * fps) / fps;
