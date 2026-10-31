// PhE hero motion v2: one dot becomes three → the violet world of people + places → the capsule switches ON →
// the camera dives through it → the mark draws itself out of its dots → lockup.
// 2.5D: one virtual camera (pan, zoom, roll, kicks) over parallax layers; liquid (metaball) joins; motion blur.
// Page contract (Lemo-Opuscar): window.DUR, window.render(t), window.EV, window.TEXTS, window.READY.
import G from './geom.js';
import { TAU, clamp, lerp, seg, emph, decel, accel, inout, bezier, bump, spring, wobble, hash } from './ease.js';

const VIO = '#2A0D6E', BLUE = '#2563EB', CREAM = '#F4F1EB', VIO2 = '#3A1D88', VIO3 = '#4A2DA0', VIO4 = '#5B3FC0';
const LAV = '#E3DCF4', SKY = '#D8E3FA', TINTS = [BLUE, VIO, '#8EA8F4', '#B6A3EA', CREAM];
const DUR = 16, FPS = 30, SUB = 5, SHUTTER = 0.55 / FPS;
const drawE = bezier(0.55, 0, 0.15, 1), dive = bezier(0.7, 0, 0.95, 0.6);
const ss = x => x * x * (3 - 2 * x);
const cv = document.getElementById('c'), out = cv.getContext('2d');
const off = document.createElement('canvas'), g = off.getContext('2d');
let W, H, V, u;
function size() { W = cv.width = off.width = innerWidth; H = cv.height = off.height = innerHeight; V = H > W; u = Math.min(W, H) / 1080; }

// ---------------------------------------------------------------- logo data
const LINES = G.parts.slice(0, 5).map(p => new Path2D(p.line)), LENS = G.parts.slice(0, 5).map(p => p.len);
const DOT = G.parts.slice(5).map(p => ({ x: p.cx, y: p.cy, r: p.r }));
const PL = G.parts.slice(0, 5).map(p => { const c = [0]; for (let i = 1; i < p.pts.length; i++) c.push(c[i - 1] + Math.hypot(p.pts[i][0] - p.pts[i - 1][0], p.pts[i][1] - p.pts[i - 1][1])); return { pts: p.pts, c }; });
function along(i, q) { const { pts, c } = PL[i], L = c[c.length - 1] * clamp(q); let k = 1; while (k < c.length - 1 && c[k] < L) k++; const f = clamp((L - c[k - 1]) / Math.max(1e-6, c[k] - c[k - 1])); return [lerp(pts[k - 1][0], pts[k][0], f), lerp(pts[k - 1][1], pts[k][1], f), Math.atan2(pts[k][1] - pts[k - 1][1], pts[k][0] - pts[k - 1][0])]; }
const END = i => G.parts[i].pts.at(-1);

// ---------------------------------------------------------------- timeline
const T = {
  pop: 0.12, look: [0.45, 1.0], split: [0.95, 1.75], chat: [1.75, 2.35], crouch: [2.25, 2.5], flood: [2.5, 3.25],
  ppIn: 3.25, label: [3.75, 4.55], merge: [4.6, 5.5], snap: 5.62, exp: [5.95, 6.75], dive: [6.55, 7.4],
  dotP: 7.5, strokes: [[7.7, 8.5], [7.95, 8.45], [8.2, 8.85], [8.35, 8.8], [8.5, 9.25]], hDrip: [8.85, 9.12], hLand: 9.32, eOut: [9.22, 9.75],
  wave: 10.5, up: [10.85, 11.7], word: 11.25, tag: 11.95, blink: 13.4, wink: 14.5,
};
const WORD = 'PurpleHat Events', TAG = 'Events for a more connected tomorrow.';

// ---------------------------------------------------------------- camera
function keys(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1, e = inout] = ks[i]; return lerp(v0, v1, e((t - t0) / (t1 - t0))); }
  return ks[ks.length - 1][1];
}
const D2R = Math.PI / 180;
function camera(t) {
  let c;
  if (t < T.dive[1]) {
    const kx = geo2().kx;
    c = {
      z: Math.exp(keys(t, [[0, Math.log(4.2)], [1.7, 0, emph], [2.45, 0], [3.25, Math.log(1.8)], [4.35, 0, emph], [5.6, Math.log(1.07)], [T.dive[0], Math.log(1.1)], [T.dive[1], Math.log(18), dive]])),
      x: keys(t, [[0, 0], [3.3, 0], [4.4, -24, emph], [5.6, 0], [T.dive[0], 0], [T.dive[1], kx, decel]]),
      y: keys(t, [[0, 0], [3.3, 0], [4.4, 10, emph], [5.6, 0]]),
      r: D2R * keys(t, [[0, -9], [1.7, 0, emph], [2.45, 0], [3.25, 6], [4.4, -2.5, emph], [6.0, 1.5], [T.dive[0], 1.5], [T.dive[1], -16, accel]]),
    };
  } else c = {
    // starts close on dot-P, then follows the pen across the mark while pulling back
    z: Math.exp(keys(t, [[T.dive[1], Math.log(2.0)], [8.3, Math.log(1.55)], [10.4, 0, inout], [DUR, Math.log(1.045)]])),
    x: keys(t, [[T.dive[1], V ? -300 : -400], [8.3, V ? -170 : -230], [9.7, 0, inout]]), y: keys(t, [[T.dive[1], V ? 80 : 110], [8.3, 40], [9.7, 0, inout]]),
    r: D2R * keys(t, [[T.dive[1], -8], [10.4, 0, inout], [DUR, 0.7]]),
  };
  // impulses: the camera reacts to the beats
  const kick = (t0, a) => wobble(t - t0, 6, 0.32) * a;
  c.x += kick(T.snap + 0.2, 9) + kick(T.hLand, 3) + kick(T.eOut[0] + 0.3, 2.5);
  c.y += kick(T.flood[0], -6) + kick(T.dotP, 3);
  c.r += D2R * (kick(T.snap + 0.2, 1.2) + kick(T.flood[0], -0.8));
  return c;
}
function view(c, p = 1) { // layer transform at parallax depth p (1 = main plane, <1 far, >1 near)
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(u, u); g.rotate(c.r * Math.min(1, p));
  const z = Math.exp(Math.log(c.z) * p); g.scale(z, z); g.translate(-c.x * p, -c.y * p);
}

// ---------------------------------------------------------------- primitives
const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); };
const pill = (x, y, w, h) => { w = Math.max(w, 0.01); h = Math.max(h, 0.01); g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) / 2); };
function blob(x, y, r, sx = 1, sy = 1, col = BLUE, rot = 0) { if (r <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy); circ(0, 0, r); g.fillStyle = col; g.fill(); g.restore(); }
function mixc(a, b, k) { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; }
// liquid bridge between two circles (metaball neck); v = neck tension, reach = how far the neck holds
function goo(x1, y1, r1, x2, y2, r2, col, v = 0.5, reach = 2.6) {
  const d = Math.hypot(x2 - x1, y2 - y1), maxD = (r1 + r2) * reach / 2 + Math.min(r1, r2);
  if (d > maxD || d <= Math.abs(r1 - r2) + 0.5 || r1 < 0.5 || r2 < 0.5) return;
  let u1 = 0, u2 = 0;
  if (d < r1 + r2) { u1 = Math.acos(clamp((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d), -1, 1)); u2 = Math.acos(clamp((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d), -1, 1)); }
  const ab = Math.atan2(y2 - y1, x2 - x1), ms = Math.acos(clamp((r1 - r2) / d, -1, 1));
  const a1 = ab + u1 + (ms - u1) * v, a2 = ab - u1 - (ms - u1) * v, a3 = ab + Math.PI - u2 - (Math.PI - u2 - ms) * v, a4 = ab - Math.PI + u2 + (Math.PI - u2 - ms) * v;
  const P = (x, y, r, a) => [x + r * Math.cos(a), y + r * Math.sin(a)];
  const p1 = P(x1, y1, r1, a1), p2 = P(x1, y1, r1, a2), p3 = P(x2, y2, r2, a3), p4 = P(x2, y2, r2, a4);
  const k = Math.min(v * 2.4, Math.hypot(p1[0] - p3[0], p1[1] - p3[1]) / (r1 + r2)) * Math.min(1, d * 2 / (r1 + r2)), h1 = r1 * k, h2 = r2 * k;
  const Hd = (p, h, a) => [p[0] + h * Math.cos(a), p[1] + h * Math.sin(a)];
  g.beginPath(); g.moveTo(...p1);
  g.bezierCurveTo(...Hd(p1, h1, a1 - Math.PI / 2), ...Hd(p3, h2, a3 + Math.PI / 2), ...p3); g.lineTo(...p4);
  g.bezierCurveTo(...Hd(p4, h2, a4 - Math.PI / 2), ...Hd(p2, h1, a2 + Math.PI / 2), ...p2); g.closePath(); g.fillStyle = col; g.fill();
}
function ring(x, y, t, t0, r0, r1, col, lw = 3, d = 0.75) {
  const p = seg(t, t0, t0 + d); if (p <= 0 || p >= 1) return;
  g.save(); g.globalAlpha = (1 - p) * 0.9; g.strokeStyle = col; g.lineWidth = lw * (1 - p * 0.6); circ(x, y, lerp(r0, r1, decel(p))); g.stroke(); g.restore();
}
function star(x, y, r, rot) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
// confetti of brand shapes (pills, sparkles, dots); s = size scale, up = fan upwards
function burst(x, y, t, t0, seed, s = 1, up = true, n = 12, life = 0.9) {
  const p = seg(t, t0, t0 + life); if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed * 31 + i), h2 = hash(seed * 17 + i * 7), h3 = hash(seed * 7 + i * 13);
    const a = up ? -Math.PI * (0.06 + 0.88 * (i + h1 * 0.7) / (n + 0.4)) : TAU * (i + h1) / n;
    const d = (60 + 90 * h2) * s * decel(p), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + 40 * s * p * p;
    const sz = (5 + 6 * h3) * s * (1 - p * 0.5);
    g.save(); g.globalAlpha = 1 - p * p; g.fillStyle = TINTS[(i + seed) % (up ? 4 : 5)];
    if (i % 4 === 0) { g.translate(px, py); g.rotate(a + p * 2); pill(0, 0, sz * 3.2, sz * 1.4); }
    else if (i % 4 === 1) star(px, py, sz * 1.3, p * 3 + h1 * 6); else circ(px, py, sz * 0.75);
    g.fill(); g.restore();
  }
}
// hop with anticipation, stretch in the air and squash on landing → [dy, sx, sy]
function hop(t, t0, d, hgt) {
  const p = seg(t, t0, t0 + d); let dy = 0, sx = 1, sy = 1;
  const pre = seg(t, t0 - 0.14, t0); if (pre > 0 && pre < 1) { const q = bump(pre) * 0.26; sx += q; sy -= q; }
  if (p > 0 && p < 1) { dy = -4 * hgt * p * (1 - p); const v = Math.abs(1 - 2 * p); sy += 0.2 * v; sx -= 0.13 * v; }
  const w = wobble(t - t0 - d, 5.5, 0.33) * 0.26; sx += w; sy -= w;
  return [dy, sx, sy];
}
// soft, pre-blurred capsule sprites for the depth layers
const SPR = {};
function sprite(col, blur) {
  const k = col + blur; if (SPR[k]) return SPR[k];
  const c = document.createElement('canvas'); c.width = 640; c.height = 320; const x = c.getContext('2d');
  x.filter = `blur(${blur}px)`; x.fillStyle = col; x.beginPath(); x.roundRect(80, 80, 480, 160, 80); x.fill(); return (SPR[k] = c);
}
function softCapsule(x, y, w, col, blur, a = 1, rot = 0) { if (w <= 0) return; const s = sprite(col, blur); g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.drawImage(s, -w * 2 / 3, -w / 3, w * 4 / 3, w * 2 / 3); g.restore(); }
const TINTC = {};
function dotGrid(col, a) {
  if (!TINTC[col]) { const c = document.createElement('canvas'); c.width = c.height = 54; const x = c.getContext('2d'); x.fillStyle = col; x.beginPath(); x.arc(27, 27, 2.4, 0, TAU); x.fill(); TINTC[col] = c; }
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = g.createPattern(TINTC[col], 'repeat'); g.fillRect(-3024, -3024, 6048, 6048); g.restore();
}

// ---------------------------------------------------------------- text (TEXTS reports screen boxes)
const FONT = (px, w = 500) => `${w} ${px}px Brand`;
let TEXTS = [];
function box(text, x0, y0, x1, y1) { const m = g.getTransform(), a = m.transformPoint(new DOMPoint(x0, y0)), b = m.transformPoint(new DOMPoint(x1, y1)); TEXTS.push({ text, x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y) }); }
function label(text, x, y, px, col, t, tin, tout, rec = true) {
  const a = decel(seg(t, tin, tin + 0.4)), b = 1 - seg(t, tout, tout + 0.2); if (a <= 0 || b <= 0) return;
  g.save(); g.font = FONT(px); g.textAlign = 'center'; g.globalAlpha = a * b; g.fillStyle = col; g.fillText(text, x, y + (1 - a) * px * 0.6);
  const w = g.measureText(text).width; if (rec && a > 0.99) box(text, x - w / 2, y - px * 0.8, x + w / 2, y + px * 0.25); g.restore();
}

// ================================================================= WORLD 1: cream, one dot becomes three
const R1 = 34, S1 = 104;
function dots1(t) {
  const sc = clamp(spring(t - T.pop, 2.3, 0.45), 0, 1.3);
  const look = Math.sin(seg(t, ...T.look) * TAU) * bump(seg(t, ...T.look));
  const sp = spring(t - T.split[0], 1.5, 0.48);
  const crouch = bump(seg(t, T.crouch[0], T.crouch[1] + 0.06)), flood = emph(seg(t, ...T.flood));
  const H3 = [];
  for (let i = 0; i < 3; i++) {
    let dy = 0, sx = 1, sy = 1;
    const sched = i === 0 ? [[T.chat[0], 0.34, 34]] : i === 2 ? [[T.chat[0] + 0.16, 0.26, 22], [T.chat[0] + 0.46, 0.26, 22]] : [[T.chat[0] + 0.3, 0.3, 28]];
    for (const [t0, d, hgt] of sched) { const [a, b, e] = hop(t, t0, d, hgt); dy += a; sx *= b; sy *= e; }
    if (i === 1) { sx *= (1 + 0.25 * crouch) * (1 + 0.08 * look * look); sy *= 1 - 0.3 * crouch; }
    H3.push({ x: look * 10 * (i === 1 ? 1 : 0.4) + (i - 1) * (S1 * sp + flood * 340), y: dy + R1 * (1 - sy), sx, sy, rr: R1 * sc * (i === 1 ? 1 : clamp(sp * 1.3, 0, 1)) });
  }
  return { H3, flood, sp };
}
function world1(t, c, A) {
  view(c, 0); const bgG = g.createRadialGradient(0, 0, 0, 0, 0, 1300); bgG.addColorStop(0, '#F8F6F1'); bgG.addColorStop(1, '#ECE7DE'); g.fillStyle = bgG; g.fillRect(-2000, -2000, 4000, 4000);
  view(c, 0.45); dotGrid(VIO, 0.09 * seg(t, 0.2, 1.2));
  view(c, 0.3); [[-700, -330, 520, LAV], [760, 300, 600, SKY], [620, -380, 300, LAV], [-640, 360, 360, SKY]].forEach(([x, y, w, col], i) => softCapsule(x + Math.sin(t * 0.5 + i) * 14, y, w * clamp(spring(t - 0.5 - i * 0.12, 1.2, 0.7)), col, 28, 0.9, i % 2 ? 0.2 : -0.15));
  view(c, 1);
  const { H3, flood } = A, col1 = t < T.crouch[0] ? BLUE : mixc(BLUE, VIO, seg(t, T.crouch[0], T.crouch[0] + 0.25));
  // liquid necks while the dot divides
  if (t > T.split[0] && t < T.split[1]) for (const j of [0, 2]) goo(H3[1].x, H3[1].y, H3[1].rr, H3[j].x, H3[j].y, H3[j].rr, BLUE, 0.55, 3.0);
  if (t >= T.flood[0]) { circ(H3[1].x, 0, R1 + 1500 * flood); g.fillStyle = VIO; g.fill(); }
  H3.forEach((d, i) => { if (!(i === 1 && t >= T.flood[0])) blob(d.x, d.y, d.rr, d.sx, d.sy, i === 1 ? col1 : BLUE); });
  ring(0, 0, t, T.pop, R1, R1 * 3, BLUE, 3); ring(-S1, R1, t, T.chat[0] + 0.34, R1 * 0.6, R1 * 2.4, '#8EA8F4', 2.5); ring(S1, R1, t, T.chat[0] + 0.72, R1 * 0.6, R1 * 2.2, '#8EA8F4', 2.5);
  burst(0, 0, t, T.split[0] + 0.25, 2, 0.8, false, 10, 0.8);
}

// ================================================================= WORLD 2: violet, people + places = experiences
const CONST = Array.from({ length: 46 }, (_, i) => ({ x: (hash(i * 3.7) - 0.5) * 3000, y: (hash(i * 9.1 + 4) - 0.5) * 1900, ph: hash(i * 1.3) * TAU, r: 3 + 4 * hash(i * 5.5) }));
function world2(t, c, A) {
  view(c, 0); const bg = g.createRadialGradient(0, 0, 0, 0, 0, 1400); bg.addColorStop(0, '#3B1A8E'); bg.addColorStop(0.6, VIO); bg.addColorStop(1, '#16063F'); g.fillStyle = bg; g.fillRect(-2000, -2000, 4000, 4000);
  // glow fields
  view(c, 0.2); for (let i = 0; i < 4; i++) { const x = Math.sin(t * 0.25 + i * 2) * 600 + (i - 1.5) * 300, y = Math.cos(t * 0.2 + i) * 300, R = 520; const gg = g.createRadialGradient(x, y, 0, x, y, R); gg.addColorStop(0, i % 2 ? 'rgba(37,99,235,.28)' : 'rgba(120,80,230,.22)'); gg.addColorStop(1, 'rgba(37,99,235,0)'); g.fillStyle = gg; g.fillRect(x - R, y - R, 2 * R, 2 * R); }
  // constellation: people connecting
  view(c, 0.4); { const app = seg(t, T.flood[0] + 0.3, T.flood[0] + 1.4); const P = CONST.map(p => [p.x + Math.sin(t * 0.6 + p.ph) * 30, p.y + Math.cos(t * 0.5 + p.ph) * 22]);
    g.lineWidth = 1.6; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < 330) { g.strokeStyle = `rgba(182,163,234,${0.22 * (1 - d / 330) * app})`; g.beginPath(); g.moveTo(...P[i]); g.lineTo(...P[j]); g.stroke(); } }
    P.forEach(([x, y], i) => { const tw = 0.5 + 0.5 * Math.sin(t * 3 + CONST[i].ph); blob(x, y, CONST[i].r * app, 1, 1, i % 7 === 0 ? `rgba(91,141,242,${0.9 * app})` : `rgba(201,191,238,${(0.35 + 0.4 * tw) * app})`); }); }
  // far blurred capsules
  view(c, 0.32); [[-820, -420, 700], [880, 430, 820], [900, -470, 480], [-900, 470, 560]].forEach(([x, y, w], i) => softCapsule(x - (t - 3) * 14 * (i % 2 ? 1 : -1), y, w, i % 2 ? '#4A2DA0' : '#3B1F95', 34, 0.8, i % 2 ? -0.12 : 0.1));
  // capsule lanes (the brand pattern) drifting in alternate directions; some are toggles flicking on and off
  view(c, 0.62); lanes(t);
  view(c, 1); main2(t, A);
  // near-camera sweepers for depth
  view(c, 1.6); [[3.35, -1, -260, 900], [5.1, 1, 320, 1100]].forEach(([t0, dir, y, w]) => { const p = seg(t, t0, t0 + 1.1); if (p > 0 && p < 1) softCapsule(dir * lerp(1500, -1500, inout(p)), y, w, VIO4, 40, 0.45 * bump(p), dir * 0.1); });
}
function lanes(t) {
  const ys = V ? [-760, -620, -480, 480, 620, 760] : [-440, -320, 320, 440], lh = V ? 78 : 70;
  ys.forEach((y, li) => {
    const dir = li % 2 ? 1 : -1, speed = 46 + 30 * hash(li * 3.3), step = lh * 3.2, n = 34, span = step * n;
    for (let j = 0; j < n; j++) {
      const sd = li * 37 + j, appear = clamp(spring(t - T.flood[0] - 0.25 - 0.025 * Math.abs(j - n / 2) - 0.05 * li, 1.5, 0.6), 0, 1.15); if (appear <= 0) continue;
      const x = (((j * step + dir * (t - 2.5) * speed) % span) + span) % span - span / 2;
      const kind = Math.floor(hash(sd * 1.3) * 4), h = lh * (0.6 + 0.3 * hash(sd * 2.1)) * appear;
      g.save(); g.fillStyle = VIO2; g.strokeStyle = VIO3; g.lineWidth = 2.5;
      if (kind === 0) { pill(x, y, h * 2.6, h); g.fill(); }
      else if (kind === 1) { circ(x - h * 0.6, y, h / 2); g.fill(); pill(x + h * 0.75, y, h * 1.5, h); g.fill(); }
      else if (kind === 2) { pill(x, y, h * 2.6, h); g.stroke(); const on = ss(clamp(0.5 + 0.9 * Math.sin(t * 1.4 + sd))); circ(x + lerp(-h * 0.8, h * 0.8, on), y, h * 0.3); g.fillStyle = mixc(VIO4, '#5B8DF2', on); g.fill(); }
      else { pill(x, y, h * 2.6, h); g.fill(); circ(x + h * 0.8, y, h * 0.3); g.fillStyle = VIO4; g.fill(); }
      g.restore();
    }
  });
}
function geo2() { const Dx = V ? 230 : 300, Rc = 84, pad = 24, Ph = 2 * (Rc + pad), Pw = V ? 400 : 470; return { Dx, Rc, pad, Ph, Pw, kx: Pw / 2 - Ph / 2 }; }
function main2(t, A) {
  const { Dx, Rc, Ph, Pw, kx } = geo2();
  const grow = clamp(spring(t - T.ppIn, 1.6, 0.48), 0, 1.25), merge = emph(seg(t, ...T.merge)), pillX = lerp(Dx, 0, merge);
  const hand = seg(t, T.ppIn - 0.05, T.ppIn + 0.2);   // hand-over from the world-1 dots
  // places: a skyline of capsules rising behind the pill
  [[-170, 120], [-95, 200], [-20, 150], [55, 240], [130, 130], [190, 180]].forEach(([dx, h], i) => {
    const up = clamp(spring(t - T.ppIn - 0.25 - i * 0.06, 1.5, 0.5), 0, 1.2) * (1 - emph(seg(t, T.merge[0] - 0.05, T.merge[0] + 0.4))); if (up <= 0) return;
    const hh = (Ph / 2 + h) * up, x = pillX + dx * (Pw / 470); pill(x, -hh / 2 + 6, 46, hh + 12); g.fillStyle = i % 3 === 1 ? '#5B8DF2' : i % 2 ? VIO4 : VIO3; g.fill();
    circ(x, -hh + 26, 9); g.fillStyle = 'rgba(244,241,235,.85)'; g.fill(); });
  // the pill (places), stretched out of the right dot; wobbles when the circle lands; switches ON
  const sw = clamp(spring(t - T.ppIn, 1.9, 0.5), 0, 1.25), land = wobble(t - T.merge[1], 3.6, 0.38) * 0.07;
  const w = lerp(68, Pw, grow) * (1 + land), h = lerp(68, Ph, sw) * (1 - land), px0 = lerp(A.H3[2].x, pillX, hand);
  const snap = clamp(spring(t - T.snap, 2.1, 0.42), 0, 1.2);
  pill(px0, 0, w, h); g.fillStyle = CREAM; g.fill();
  if (t >= T.snap) { const kxNow = pillX + lerp(-kx, kx, snap), x0 = pillX - w / 2; g.save(); pill(pillX, 0, w, h); g.clip(); pill((x0 + kxNow + Ph / 2) / 2, 0, kxNow + Ph / 2 - x0, h); g.fillStyle = BLUE; g.fill(); g.restore(); }
  // the circle (people) with its orbit of little people
  const cg = clamp(spring(t - T.ppIn, 1.7, 0.5), 0, 1.25), Rn = lerp(R1, Rc, cg), arc = bump(seg(t, ...T.merge)), roll = merge * 5.2;
  let cx = lerp(lerp(A.H3[0].x, -Dx, hand), pillX - kx, merge), cy = -arc * 170;
  if (t >= T.snap) cx = pillX + lerp(-kx, kx, snap);
  for (let i = 0; i < 6; i++) {
    const app = clamp(spring(t - T.ppIn - 0.35 - i * 0.07, 2, 0.5), 0, 1.2), absorb = emph(seg(t, T.merge[0] - 0.1 + i * 0.03, T.merge[0] + 0.45 + i * 0.03));
    if (app <= 0 || absorb >= 1) continue;
    const a = t * 1.1 + i * TAU / 6, R = lerp(150, 0, absorb), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.92, r = 12 * app * (1 - absorb * 0.6);
    if (absorb > 0) goo(cx, cy, Rn, x, y, r, CREAM, 0.5, 2.4);
    blob(x, y, r, 1, 1, CREAM);
  }
  // liquid neck as the circle drops into the pill's left end
  if (t > T.merge[0] && t < T.snap) goo(pillX - kx, 0, Ph / 2 - 2, cx, cy, Rn, CREAM, 0.45, 2.2);
  const kcol = t < T.snap ? BLUE : mixc(BLUE, CREAM, seg(t, T.snap, T.snap + 0.25));
  const st = wobble(t - T.snap - 0.18, 5, 0.35) * 0.18 + 0.25 * bump(seg(t, T.snap, T.snap + 0.2));
  blob(cx, cy, Rn, 1 + st, 1 - st, kcol);
  if (t > T.merge[0] && t < T.snap + 0.3) { g.save(); g.globalAlpha = 0.5 * bump(seg(t, T.merge[0], T.snap + 0.3)); circ(cx + Math.cos(roll) * Rn * 0.55, cy + Math.sin(roll) * Rn * 0.55, Rn * 0.14); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  ring(pillX - kx, 0, t, T.merge[1], Rn, Rn * 2, CREAM, 3);
  ring(pillX + kx, 0, t, T.snap + 0.2, Rn, Rn * 2.6, CREAM, 4, 0.9); ring(pillX + kx, 0, t, T.snap + 0.32, Rn, Rn * 3.6, '#8EA8F4', 2.5, 1.0);
  burst(pillX + kx, 0, t, T.snap + 0.2, 5, 1.4, false, 16, 1.1);
  const ly = Ph / 2 + 84, lp = 50;
  label('People', -Dx, ly, lp, CREAM, t, T.label[0], T.label[1]);
  label('+', (-Dx + Rc + Dx - Pw / 2) / 2, 18, 60, 'rgba(244,241,235,.7)', t, T.label[0] - 0.05, T.label[1], false);
  label('Places', Dx, ly, lp, CREAM, t, T.label[0] + 0.1, T.label[1]);
  label('Experiences', 0, ly, lp, CREAM, t, T.exp[0], T.exp[1]);
}

// ================================================================= WORLD 3: cream, the mark draws itself out of its dots
function logoK() { return (V ? 0.7 * W : 0.36 * W) / u / G.width; }
function world3(t, c) {
  view(c, 0); const bg = g.createRadialGradient(0, 0, 0, 0, 0, 1300); bg.addColorStop(0, '#F9F7F2'); bg.addColorStop(1, '#ECE6DC'); g.fillStyle = bg; g.fillRect(-2000, -2000, 4000, 4000);
  view(c, 0.5); dotGrid(VIO, 0.08);
  view(c, 0.28); [[-780, -360, 620, LAV, -0.18], [820, 340, 720, SKY, 0.12], [760, -420, 380, LAV, 0.25], [-760, 420, 440, SKY, -0.1], [0, 640, 520, LAV, 0]].forEach(([x, y, w, col, r], i) => softCapsule(x + Math.sin(t * 0.4 + i) * 18, y + Math.cos(t * 0.33 + i) * 12, w, col, 26, 0.95, r));
  view(c, 0.6); outlineCapsules(t);
  view(c, 1); const k0 = logoK(), up = emph(seg(t, ...T.up)), k = k0 * lerp(V ? 1 : 1.3, 1, up), oy = lerp(0, -(V ? 0.07 : 0.09) * H / u, up);
  mark(t, k, oy); wordmark(t, k0, k, oy);
  view(c, 1.7); { const p = seg(t, 8.0, 9.2); if (p > 0 && p < 1) softCapsule(lerp(-1700, 1700, inout(p)), -300, 1000, LAV, 40, 0.55 * bump(p), -0.12); }
}
function outlineCapsules(t) {
  [[-560, -250, 240], [600, 230, 280], [520, -300, 180], [-520, 300, 200]].forEach(([x, y, w], i) => {
    const a = clamp(spring(t - 7.6 - i * 0.12, 1.3, 0.6), 0, 1.1); if (a <= 0) return;
    const yy = y + Math.sin(t * 0.7 + i) * 10, on = ss(clamp(0.5 + 0.9 * Math.sin(t * 1.2 + i * 1.7)));
    g.strokeStyle = i % 2 ? '#C9BFEE' : '#B9CEFA'; g.lineWidth = 4; pill(x, yy, w * a, w * 0.4 * a); g.stroke();
    circ(x + lerp(-w * 0.3, w * 0.3, on) * a, yy, w * 0.12 * a); g.fillStyle = i % 2 ? '#B6A3EA' : '#5B8DF2'; g.fill(); });
}
function mark(t, k, oy) {
  g.save(); g.translate(-G.width / 2 * k, oy - G.height / 2 * k); g.scale(k, k);
  const r = DOT[0].r, pP = clamp(spring(t - T.dotP, 2.2, 0.45), 0, 1.3);
  T.strokes.forEach(([a, b], i) => {
    const p = drawE(seg(t, a, b)); if (p <= 0.002) return;
    g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = G.w; g.strokeStyle = VIO;
    if (p < 1) g.setLineDash([LENS[i] * p, LENS[i] * 2]); else g.setLineDash([]);
    g.stroke(LINES[i]); g.setLineDash([]);
    if (p < 1) { // pen comet with a sparkle trail
      const [hx, hy, ang] = along(i, p);
      for (let j = 1; j < 9; j++) { const q = p - j * 0.035; if (q <= 0) break; const [x, y, aa] = along(i, q), n = (hash(i * 50 + j + Math.floor(t * 12)) - 0.5) * 18; g.globalAlpha = (1 - j / 9) * 0.8; blob(x - Math.sin(aa) * n, y + Math.cos(aa) * n, 4.2 * (1 - j / 10), 1, 1, j % 3 ? '#8EA8F4' : BLUE); }
      g.globalAlpha = 1; blob(hx, hy, 8, 1.35, 0.8, BLUE, ang);
    }
  });
  // the P's stem is pulled out of dot-P like a liquid
  { const p = drawE(seg(t, ...T.strokes[0])); if (p > 0 && p < 0.5) { const [sx, sy] = along(0, Math.min(p, 0.05)); goo(DOT[0].x, DOT[0].y, r * pP, sx, sy, 12, VIO, 0.5, 2.6); } }
  const dots = [[0, DOT[0].x, DOT[0].y, r * pP, 1, 1]];
  // dot-h drips out of the h's terminal and drops straight onto the baseline
  { const [tx, ty] = END(2), d = seg(t, ...T.hDrip), f = seg(t, T.hDrip[1], T.hLand);
    if (d > 0) {
      let y, rr, sx = 1, sy = 1;
      if (f <= 0) { y = ty + lerp(2, 15, ss(d)); rr = lerp(4, r * 0.92, decel(d)); sy = 1 + 0.12 * d; sx = 1 - 0.06 * d; }
      else if (f < 1) { y = lerp(ty + 15, DOT[1].y, f * f); rr = lerp(r * 0.92, r, f); sy = 1 + 0.22 * f; sx = 1 - 0.12 * f; }
      else { y = DOT[1].y; rr = r; }
      goo(tx, ty, 12, tx, y, rr, BLUE, 0.6, 2.8);
      dots.push([1, tx, y, rr, sx, sy]);
    } }
  // dot-E squeezes out of the bar's end and rolls into place
  { const [bx, by] = END(4), p = seg(t, ...T.eOut);
    if (p > 0) { const m = clamp(spring(t - T.eOut[0], 1.8, 0.5), 0, 1.15), x = lerp(bx, DOT[2].x, m), rr = r * clamp(0.35 + 0.65 * decel(clamp(p * 1.6)));
      goo(bx, by, 12, x, by, rr, BLUE, 0.55, 2.8); dots.push([2, x, by, rr, 1 + 0.1 * bump(p), 1 - 0.1 * bump(p)]); } }
  // expressions once built: landing squash, wave, blink, wink, breathing
  for (const [i, x, y, rr, sx0, sy0] of dots) {
    let dy = 0, sx = sx0, sy = sy0;
    if (i === 1) { const w = wobble(t - T.hLand, 5.5, 0.33) * 0.3; sx += w; sy -= w; }
    { const [a, b, e] = hop(t, T.wave + i * 0.12, 0.4, 36); dy += a; sx *= b; sy *= e; }
    if (i === 2) { const [a, b, e] = hop(t, T.wink, 0.42, 30); dy += a; sx *= b; sy *= e; }
    const bl = bump(seg(t, T.blink + i * 0.1, T.blink + i * 0.1 + 0.16)); sy *= 1 - 0.75 * bl; sx *= 1 + 0.12 * bl;
    const R = rr * (1 + 0.035 * Math.sin((t - 11) * 2.2 - i * 0.9) * seg(t, 11.5, 12.5));
    blob(x, y + dy + R * (1 - sy), R, sx, sy, BLUE);
    ring(x, DOT[i].y, t, T.wave + i * 0.12 + 0.4, R, R * 2.8, '#8EA8F4', 2.2);
  }
  ring(DOT[0].x, DOT[0].y, t, T.dotP, r, r * 3.2, BLUE, 2.5);
  ring(END(2)[0], DOT[1].y, t, T.hLand, r, r * 3, BLUE, 2.5); burst(END(2)[0], DOT[1].y + r, t, T.hLand, 3, 0.9);
  ring(DOT[2].x, DOT[2].y, t, T.eOut[0] + 0.32, r, r * 3, BLUE, 2.5); burst(DOT[2].x, DOT[2].y + r, t, T.eOut[0] + 0.32, 7, 0.9);
  burst(DOT[2].x, DOT[2].y, t, T.wink + 0.42, 9, 0.6, true, 8, 0.7);
  g.restore();
}
function wordmark(t, k0, k, oy) {
  const fs = G.width * k0 * 0.098, base = oy + G.height / 2 * k + fs * 1.9;
  g.save(); g.font = FONT(fs); g.letterSpacing = `${-0.01 * fs}px`;
  const total = g.measureText(WORD).width; let x = -total / 2;
  g.save(); g.beginPath(); g.rect(-2000, base - fs * 1.0, 4000, fs * 1.3); g.clip();
  for (let i = 0; i < WORD.length; i++) {
    const w = g.measureText(WORD.slice(0, i + 1)).width - g.measureText(WORD.slice(0, i)).width, p = decel(seg(t, T.word + i * 0.03, T.word + i * 0.03 + 0.6));
    if (p > 0) { g.fillStyle = VIO; g.globalAlpha = Math.min(1, p * 1.5); g.fillText(WORD[i], x, base + (1 - p) * fs * 1.1); }
    x += w;
  }
  g.restore();
  if (t >= T.word + 0.6 + WORD.length * 0.03) box(WORD, -total / 2, base - fs * 0.75, total / 2, base + fs * 0.22);
  const ts = fs * 0.4, tb = base + fs * 1.05, p = decel(seg(t, T.tag, T.tag + 0.6));
  if (p > 0) { g.font = FONT(ts, 400); g.letterSpacing = '0px'; g.textAlign = 'center'; g.globalAlpha = p * 0.72; g.fillStyle = VIO; g.fillText(TAG, 0, tb + (1 - p) * ts * 0.8);
    const tw = g.measureText(TAG).width; if (p > 0.99) box(TAG, -tw / 2, tb - ts * 0.75, tw / 2, tb + ts * 0.22); }
  g.restore();
}

// ================================================================= frame
function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const c = camera(t);
  if (t >= T.dive[1]) return world3(t, c);
  const A = dots1(t), floodOn = t >= T.flood[0], covered = t >= T.flood[1] + 0.05;
  if (!covered) world1(t, c, A);
  if (floodOn) {
    g.save();
    if (!covered) { view(c, 1); circ(A.H3[1].x, 0, R1 + 1500 * A.flood); g.clip(); }   // the violet world seen through the flood
    world2(t, c, A);
    g.restore();
    if (t < T.ppIn) { view(c, 1); A.H3.forEach((d, i) => { if (i !== 1) blob(d.x, d.y, d.rr, d.sx, d.sy, BLUE); }); }
  }
}
function render(t) {
  if (cv.width !== innerWidth || cv.height !== innerHeight) size();
  out.setTransform(1, 0, 0, 1, 0, 0);
  let keep = [];
  for (let i = 0; i < SUB; i++) {   // motion blur: average SUB sub-frames across the shutter
    TEXTS = []; scene(Math.max(0, t + (SUB > 1 ? (i / (SUB - 1) - 0.5) * SHUTTER : 0)));
    if (i === (SUB >> 1)) keep = TEXTS;
    out.globalAlpha = 1 / (i + 1); out.drawImage(off, 0, 0);
  }
  out.globalAlpha = 1; render.texts = keep;
}

size();
window.DUR = DUR;
window.render = render;
window.TEXTS = t => { render(t); return render.texts; };
window.EV = [
  { t: T.pop, type: 'pop', i: 1 }, { t: T.look[0], type: 'look' }, { t: T.split[0] + 0.15, type: 'split' },
  { t: T.chat[0] + 0.34, type: 'hop', i: 0 }, { t: T.chat[0] + 0.42, type: 'hop', i: 2, v: 0.7 }, { t: T.chat[0] + 0.6, type: 'hop', i: 1 }, { t: T.chat[0] + 0.72, type: 'hop', i: 2, v: 0.7 },
  { t: T.crouch[0], type: 'crouch' }, { t: T.flood[0], type: 'swell' }, { t: T.ppIn, type: 'pp' }, { t: T.label[0], type: 'label' },
  { t: T.merge[0], type: 'merge' }, { t: T.merge[1], type: 'land' }, { t: T.snap, type: 'snap' }, { t: T.exp[0], type: 'label' }, { t: T.dive[0], type: 'dive', dur: T.dive[1] - T.dive[0] },
  { t: T.dotP, type: 'pop', i: 0 }, ...T.strokes.map(([a, b], i) => ({ t: a, type: 'draw', i, dur: b - a })),
  { t: T.hDrip[0], type: 'drip' }, { t: T.hLand, type: 'drop' }, { t: T.eOut[0] + 0.32, type: 'roll' },
  ...[0, 1, 2].map(i => ({ t: T.wave + i * 0.12 + 0.4, type: 'wave', i })), { t: T.word, type: 'word' }, { t: T.tag, type: 'tag' },
  { t: T.blink, type: 'blink' }, { t: T.wink + 0.42, type: 'wink' }, { t: 15.0, type: 'end' },
];
const f = new FontFace('Brand', 'url(assets/DMSans.ttf)', { weight: '100 1000' });
f.load().then(x => { document.fonts.add(x); render(0); window.READY = true; });
