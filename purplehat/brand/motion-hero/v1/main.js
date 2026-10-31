// PhE hero motion: dots → people + places = experiences → the mark draws itself → lockup.
// Page contract (Lemo-Opuscar): window.DUR, window.render(t), window.EV, window.TEXTS, window.READY.
import G from './geom.js';
import { TAU, clamp, lerp, seg, emph, decel, inout, bezier, bump, spring, wobble, hash } from './ease.js';

const VIO = '#2A0D6E', BLUE = '#2563EB', CREAM = '#F4F1EB', VIO2 = '#3A1D88', VIO3 = '#4A2DA0';
const LAV = '#E6DFF5', SKY = '#DCE5FA', TINTS = [BLUE, VIO, '#8EA8F4', '#B6A3EA'];
const DUR = 13;
const draw = bezier(0.55, 0, 0.15, 1);
const cv = document.getElementById('c'), g = cv.getContext('2d');
let W, H, V, u;
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; V = H > W; u = Math.min(W, H) / 1080; }

const LINES = G.parts.slice(0, 5).map(p => new Path2D(p.line));
const LENS = G.parts.slice(0, 5).map(p => p.len);
const DOT = G.parts.slice(5).map(p => ({ x: p.cx, y: p.cy, r: p.r }));
// stroke draw windows: P, h-stem, h-arch, E-top, E-bowl
const STROKE_T = [[5.95, 6.75], [6.15, 6.7], [6.4, 7.05], [6.55, 7.0], [6.7, 7.45]];
const T_HDROP = 7.05, T_HLAND = 7.47, T_EOUT = 7.45, WAVE1 = 8.2, WAVE2 = 11.3;
const T_UP = [8.5, 9.3], T_WORD = 8.9, T_TAG = 9.6;
const WORD = 'PurpleHat Events', TAG = 'Events for a more connected tomorrow.';

// ---------- shapes ----------
const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); };
const pill = (x, y, w, h) => { w = Math.max(w, 0.01); h = Math.max(h, 0.01); g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) / 2); };
function blob(x, y, r, sx, sy, col, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy); circ(0, 0, r); g.fillStyle = col; g.fill(); g.restore(); }
function ring(x, y, t, t0, r0, r1, col, lw = 3) {
  const p = seg(t, t0, t0 + 0.7); if (p <= 0 || p >= 1) return;
  g.save(); g.globalAlpha = (1 - p) * 0.9; g.strokeStyle = col; g.lineWidth = lw * u * (1 - p * 0.6); circ(x, y, lerp(r0, r1, decel(p))); g.stroke(); g.restore();
}
// a burst of brand confetti (circles and little pills) flying out of a landing
function burst(x, y, t, t0, seed, s = 1, up = true) {
  const p = seg(t, t0, t0 + 0.8); if (p <= 0 || p >= 1) return;
  for (let i = 0; i < 9; i++) {
    const h1 = hash(seed * 31 + i), h2 = hash(seed * 17 + i * 7), a = up ? -Math.PI * (0.08 + 0.84 * (i + h1 * 0.6) / 9.3) : TAU * (i + h1) / 9;
    const d = (55 + 70 * h2) * u * s * decel(p), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + 30 * u * s * p * p;
    const sz = (4 + 5 * hash(seed + i * 3)) * u * s * (1 - p * 0.5);
    g.save(); g.globalAlpha = 1 - p * p; g.fillStyle = TINTS[(i + seed) % 4];
    if (i % 3 === 0) { g.translate(px, py); g.rotate(a); pill(0, 0, sz * 3.2, sz * 1.5); } else circ(px, py, sz * 0.8);
    g.fill(); g.restore();
  }
}
// squash/stretch for a dot that hops: returns [dy (px, negative = up), sx, sy]
function hop(t, t0, d, hgt) {
  const p = seg(t, t0, t0 + d); let dy = 0, sx = 1, sy = 1;
  if (p > 0 && p < 1) { dy = -4 * hgt * p * (1 - p); const v = Math.abs(1 - 2 * p); sy = 1 + 0.18 * v; sx = 1 - 0.12 * v; }
  const pre = seg(t, t0 - 0.12, t0); if (pre > 0 && pre < 1) { const q = bump(pre) * 0.22; sx += q; sy -= q; }
  const w = wobble(t - t0 - d, 5.5, 0.35) * 0.24; sx += w; sy -= w;
  return [dy, sx, sy];
}

// ---------- logo transform ----------
function logoT(t) {
  const lw = V ? 0.70 * W : 0.36 * W, k0 = lw / G.width, up = emph(seg(t, T_UP[0], T_UP[1]));
  const k = k0 * lerp(V ? 0.98 : 1.36, 1, up) * (1 + 0.05 * (1 - emph(seg(t, 5.95, 8.2))));
  const cy = lerp(H * 0.5, V ? H * 0.43 : H * 0.41, up);
  return { k, k0, cx: W / 2, cy };
}
const L2S = (T, x, y) => [T.cx + (x - G.width / 2) * T.k, T.cy + (y - G.height / 2) * T.k];

// ---------- scene A + B geometry ----------
function sceneAB(t) {
  const cx = W / 2, cy = H / 2, s = 104 * u, r = 34 * u;
  const Dx = V ? 230 * u : 300 * u, Rc = 84 * u, pad = 24 * u, Ph = 2 * (Rc + pad), Pw = V ? 400 * u : 470 * u;
  return { cx, cy, s, r, Dx, Rc, pad, Ph, Pw };
}

// background decor: violet field (scene B) and pale cream field (scene C/D)
function violetDecor(t) {
  const lanes = V ? [0.07, 0.17, 0.27, 0.73, 0.83, 0.93] : [0.1, 0.24, 0.76, 0.9], lh = (V ? 0.065 : 0.1) * H;
  lanes.forEach((fy, li) => {
    const dir = li % 2 ? 1 : -1, speed = (40 + 25 * hash(li * 3.3)) * u, y = fy * H, step = lh * 3.1, n = Math.ceil(W / step) + 3;
    for (let j = 0; j < n; j++) {
      const sd = li * 37 + j, appear = clamp(spring(t - 2.45 - 0.035 * j - 0.05 * li, 1.6, 0.6), 0, 1.15); if (appear <= 0) continue;
      const off = ((dir * (t - 2.45) * speed) % step + step) % step, x = j * step - step + off;
      const kind = Math.floor(hash(sd * 1.3) * 3), h = lh * (0.62 + 0.3 * hash(sd * 2.1)) * appear;
      g.save(); g.fillStyle = VIO2; g.strokeStyle = VIO3; g.lineWidth = 2.5 * u;
      if (kind === 0) { pill(x, y, h * 2.6, h); g.fill(); }
      else if (kind === 1) { circ(x - h * 0.6, y, h / 2); g.fill(); pill(x + h * 0.75, y, h * 1.5, h); g.fill(); }
      else { pill(x, y, h * 2.6, h); g.stroke(); circ(x - h * 0.8, y, h * 0.3); g.fillStyle = VIO3; g.fill(); }
      g.restore();
    }
  });
}
function creamDecor(t) {
  const P = V
    ? [[0.04, 0.12, 0, 1.3, LAV], [0.96, 0.9, 1, 1.5, SKY], [0.92, 0.1, 2, 0.9, LAV], [0.08, 0.86, 1, 0.8, SKY], [0.5, 0.97, 0, 1.0, LAV]]
    : [[0.06, 0.16, 0, 1.4, LAV], [0.95, 0.86, 1, 1.6, SKY], [0.9, 0.12, 2, 1.0, LAV], [0.1, 0.85, 1, 0.9, SKY], [0.72, 0.95, 0, 0.9, LAV]];
  P.forEach(([fx, fy, kind, sz, col], i) => {
    const t0 = 6.0 + 0.12 * i, sc = clamp(spring(t - t0, 1.3, 0.62), 0, 1.2); if (sc <= 0) return;
    const S = 150 * u * sz, ox = (fx < 0.5 ? -1 : 1) * (1 - Math.min(1, sc)) * 260 * u;
    const x = fx * W + ox + Math.sin(t * 0.4 + i) * 10 * u, y = fy * H + Math.cos(t * 0.35 + i * 2) * 10 * u;
    g.save(); g.fillStyle = col; g.strokeStyle = col;
    if (kind === 0) { pill(x, y, S * 2.6 * sc, S * sc); g.fill(); }
    else if (kind === 1) { circ(x, y, S * 0.6 * sc); g.fill(); }
    else { pill(x, y, S * 2.2 * sc, S * 0.9 * sc); g.lineWidth = 6 * u; g.stroke(); circ(x - S * 0.65 * sc, y, S * 0.25 * sc); g.fill(); }
    g.restore();
  });
}

// ---------- text ----------
const FONT = (px, w = 500) => `${w} ${px}px Brand`;
function label(text, x, y, px, col, t, tin, tout) {
  const a = decel(seg(t, tin, tin + 0.35)), b = 1 - seg(t, tout, tout + 0.18); if (a <= 0 || b <= 0) return null;
  g.save(); g.font = FONT(px); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = a * b; g.fillStyle = col;
  g.fillText(text, x, y + (1 - a) * px * 0.5); g.restore();
  g.font = FONT(px); const w = g.measureText(text).width; return { text, x0: x - w / 2, y0: y - px * 0.8, x1: x + w / 2, y1: y + px * 0.25 };
}
function wordmark(t, T) {
  const lw = G.width * T.k0, fs = lw * 0.098, base = T.cy + G.height / 2 * T.k + fs * 1.9, out = [];
  g.save(); g.font = FONT(fs); g.textBaseline = 'alphabetic'; g.letterSpacing = `${-0.01 * fs}px`;
  const total = g.measureText(WORD).width; let x = W / 2 - total / 2;
  g.save(); g.beginPath(); g.rect(0, base - fs * 1.0, W, fs * 1.3); g.clip();
  for (let i = 0; i < WORD.length; i++) {
    const ch = WORD[i], w = g.measureText(WORD.slice(0, i + 1)).width - g.measureText(WORD.slice(0, i)).width;
    const p = decel(seg(t, T_WORD + i * 0.028, T_WORD + i * 0.028 + 0.55));
    if (p > 0) { g.fillStyle = VIO; g.globalAlpha = Math.min(1, p * 1.5); g.fillText(ch, x, base + (1 - p) * fs * 1.05); }
    x += w;
  }
  g.restore();
  if (t >= T_WORD) out.push({ text: WORD, x0: W / 2 - total / 2, y0: base - fs * 0.75, x1: W / 2 + total / 2, y1: base + fs * 0.22 });
  const ts = fs * 0.4, tb = base + fs * 1.05, p = decel(seg(t, T_TAG, T_TAG + 0.6));
  if (p > 0) {
    g.font = FONT(ts, 400); g.letterSpacing = '0px'; g.textAlign = 'center'; g.globalAlpha = p * 0.72; g.fillStyle = VIO;
    g.fillText(TAG, W / 2, tb + (1 - p) * ts * 0.8); const tw = g.measureText(TAG).width;
    out.push({ text: TAG, x0: W / 2 - tw / 2, y0: tb - ts * 0.75, x1: W / 2 + tw / 2, y1: tb + ts * 0.22 });
  }
  g.restore(); return out;
}

// ---------- the mark ----------
function mark(t, T) {
  const k = T.k;
  g.save(); g.translate(T.cx - G.width / 2 * k, T.cy - G.height / 2 * k); g.scale(k, k);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = G.w; g.strokeStyle = VIO;
  STROKE_T.forEach(([a, b], i) => {
    const p = draw(seg(t, a, b)); if (p <= 0.002) return;
    if (p >= 1) { g.setLineDash([]); } else { g.setLineDash([LENS[i] * p, LENS[i] * 2]); g.lineDashOffset = 0; }
    g.stroke(LINES[i]);
  });
  g.setLineDash([]); g.restore();
  // dots (screen space so squash reads the same at any size)
  const r = DOT[0].r * k, out = [];
  // dot-P: held by the people circle until 6.0, then sits on the baseline
  if (t >= 6.0) out.push([0, ...L2S(T, DOT[0].x, DOT[0].y), 1]);
  // dot-h pops out of the arch's terminal, hops up and drops straight down onto the baseline
  if (t >= T_HDROP) {
    const p = seg(t, T_HDROP, T_HLAND), [x0, y0] = L2S(T, ...G.parts[2].pts.at(-1)), [x1, y1] = L2S(T, DOT[1].x, DOT[1].y);
    if (p < 1) { const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - 4 * 26 * k * p * (1 - p), sc = 0.55 + 0.45 * decel(clamp(p * 2.2));
      blob(x, y, r * sc, 1 - 0.1 * Math.abs(1 - 2 * p), 1 + 0.16 * Math.abs(1 - 2 * p), BLUE); }
    else out.push([1, x1, y1, 1]);
  }
  // dot-E leaves the bowl's tip and rolls out to the end of the bar
  if (t >= T_EOUT) {
    const p = clamp(spring(t - T_EOUT, 1.9, 0.55), 0, 1.15), [x0, y0] = L2S(T, ...G.parts[4].pts.at(-1)), [x1] = L2S(T, DOT[2].x, DOT[2].y);
    out.push([2, lerp(x0, x1, p), y0, clamp(0.5 + 0.5 * p / 1.0, 0.5, 1)]);
  }
  for (const [i, x, y, sc] of out) {
    let dy = 0, sx = 1, sy = 1;
    if (i === 1) { const w = wobble(t - T_HLAND, 5.5, 0.35) * 0.26; sx += w; sy -= w; }
    for (const [w0, hgt] of [[WAVE1, 34], [WAVE2, 26]]) { const [d, a, b] = hop(t, w0 + i * 0.11, 0.38, hgt * k); dy += d; sx *= a; sy *= b; }
    const breathe = 1 + 0.03 * Math.sin((t - 9) * 2.4 - i * 0.9) * seg(t, 9.6, 10.4);
    // anchor squash at the dot's bottom so it presses into the baseline
    const R = r * sc * breathe; blob(x, y + dy + R * (1 - sy), R, sx, sy, BLUE);
  }
}

// ---------- render ----------
function render(t) {
  if (cv.width !== innerWidth || cv.height !== innerHeight) size();
  const A = sceneAB(t), T = logoT(t), texts = [];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  // slow camera push over the lockup
  const cam = 1 + 0.025 * inout(seg(t, 8.5, DUR));
  g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(cam, cam); g.translate(-W / 2, -H / 2);

  if (t < 6.05) {
    // ---- A: three dots pop, hop twice; the middle one floods the screen violet ----
    const grow = emph(seg(t, 1.9, 2.65)), Rcov = Math.hypot(W, H) / 2 + 20;
    const midR = A.r * (1 - 0.25 * bump(seg(t, 1.62, 1.92))) + (Rcov - A.r) * grow;
    if (t >= 1.9) { circ(A.cx, A.cy, midR); g.fillStyle = VIO; g.fill(); }
    if (t >= 2.4) violetDecor(t);
    for (let i = 0; i < 3; i++) {
      const x0 = A.cx + (i - 1) * A.s, sc = clamp(spring(t - (0.15 + i * 0.1), 2.4, 0.5), 0, 1.3);
      if (sc <= 0) continue;
      let [dy, sx, sy] = hop(t, 0.8 + i * 0.1, 0.36, 40 * u); const [d2, a2, b2] = hop(t, 1.3 + i * 0.1, 0.32, 28 * u); dy += d2; sx *= a2; sy *= b2;
      ring(x0, A.cy, t, 0.15 + i * 0.1, A.r, A.r * 2.6, i === 1 ? VIO : BLUE, 2.5);
      ring(x0, A.cy + A.r, t, 0.8 + i * 0.1 + 0.36, A.r * 0.6, A.r * 2.2, '#8EA8F4', 2);
      if (i === 1) { if (t < 1.9) blob(x0, A.cy + dy + A.r * (1 - sy), A.r * sc, sx, sy, VIO); continue; }
      // outer dots: ride outward on the violet swell and become People (circle) and Places (pill)
      const side = i === 0 ? -1 : 1, mv = emph(seg(t, 1.92, 2.75)), merge = emph(seg(t, 3.95, 4.75));
      const pillCx = lerp(A.cx + A.Dx, A.cx, merge), pillCxEnd = A.cx;
      const grow2 = clamp(spring(t - 2.45, 1.7, 0.5), 0, 1.25);
      if (i === 0) {
        // People: drawn on top of the pill further down once it starts to grow
        if (t < 2.45) blob(lerp(x0, A.cx - A.Dx, mv), A.cy + dy + A.r * (1 - sy), A.r * sc, sx, sy, BLUE);
      } else {
        // Places: cream pill stretched out of the right dot; then it slides to centre and wraps the circle; then opens into the cream world
        const xB = lerp(x0, A.cx + A.Dx, mv), x = lerp(xB, pillCxEnd, merge), y = A.cy + dy;
        let w = lerp(2 * A.r, A.Pw, grow2), h = lerp(2 * A.r, A.Ph, clamp(spring(t - 2.5, 1.9, 0.55), 0, 1.2));
        const ln = wobble(t - 4.72, 3.5, 0.4) * 0.08; w *= 1 + ln; h *= 1 - ln;
        const col = t < 2.45 ? BLUE : CREAM;
        const wp = emph(seg(t, 5.3, 6.0));
        const cxw = lerp(x, W / 2, wp), cyw = lerp(y, H / 2, wp), ww = lerp(w, W * 1.6, wp), hh = lerp(h, H * 1.6, wp);
        if (t < 2.45) blob(x, y + A.r * (1 - sy), A.r * sc, sx, sy, BLUE);
        else { g.save(); g.globalAlpha = 1; pill(cxw, cyw, ww, hh); g.fillStyle = col; g.fill(); g.restore(); }
        if (t >= 2.45 && t < 2.8) { const q = seg(t, 2.45, 2.8); circ(x, y, A.r * (1 - q)); g.fillStyle = BLUE; g.fill(); }
      }
    }
    // the people circle has to sit on top of the pill: redraw it after the pill
    if (t >= 2.45) {
      const merge = emph(seg(t, 3.95, 4.75)), pillCx = lerp(A.cx + A.Dx, A.cx, merge);
      const grow2 = clamp(spring(t - 2.45, 1.7, 0.5), 0, 1.25), arc = bump(seg(t, 3.95, 4.75));
      let x = lerp(A.cx - A.Dx, pillCx - A.Pw / 2 + A.Ph / 2, merge), y = A.cy - arc * 160 * u, R = lerp(A.r, A.Rc, grow2);
      const wp = emph(seg(t, 5.3, 6.0)), [px, py] = L2S(T, DOT[0].x, DOT[0].y);
      x = lerp(x, px, wp); y = lerp(y, py, wp); R = lerp(R, DOT[0].r * T.k, wp);
      let sx = 1, sy = 1; if (t >= 4.75) { const w = wobble(t - 4.75, 4, 0.4) * 0.14; sx += w; sy -= w; }
      blob(x, y, R, sx, sy, BLUE);
      if (t >= 4.7) ring(x, y, t, 4.75, R, R * 1.9, BLUE, 3);
      // labels
      const ly = A.cy + A.Ph / 2 + 80 * u, px2 = 50 * u;
      let b = label('People', A.cx - A.Dx, ly, px2, CREAM, t, 2.95, 3.85); if (b) texts.push(b);
      b = label('Places', A.cx + A.Dx, ly, px2, CREAM, t, 3.05, 3.85); if (b) texts.push(b);
      label('+', (A.cx - A.Dx + A.Rc + A.cx + A.Dx - A.Pw / 2) / 2, A.cy + 18 * u, 56 * u, 'rgba(244,241,235,.7)', t, 2.9, 3.8);
      b = label('Experiences', A.cx, ly, px2, CREAM, t, 4.62, 5.25); if (b) texts.push(b);
    }
  }
  if (t >= 5.9) {
    if (t >= 6.05) creamDecor(t); else { g.save(); creamDecor(t); g.restore(); }
    mark(t, T);
    // landings: rings + confetti
    const [hx, hy] = L2S(T, DOT[1].x, DOT[1].y + DOT[1].r), [ex, ey] = L2S(T, DOT[2].x, DOT[2].y + DOT[2].r), [qx, qy] = L2S(T, DOT[0].x, DOT[0].y + DOT[0].r);
    const rr = DOT[0].r * T.k;
    ring(hx, hy - rr, t, T_HLAND, rr, rr * 3, BLUE); burst(hx, hy, t, T_HLAND, 3, T.k / 1.5);
    ring(ex, ey - rr, t, T_EOUT + 0.32, rr, rr * 3, BLUE); burst(ex, ey, t, T_EOUT + 0.32, 7, T.k / 1.5);
    [[qx, qy], [hx, hy], [ex, ey]].forEach(([x, y], i) => {
      ring(x, y - rr, t, WAVE1 + i * 0.11 + 0.38, rr, rr * 2.6, '#8EA8F4', 2.5); burst(x, y, t, WAVE1 + i * 0.11 + 0.38, 11 + i, T.k / 2.2);
      ring(x, y - rr, t, WAVE2 + i * 0.11 + 0.38, rr, rr * 2.4, '#8EA8F4', 2);
    });
    for (const b of wordmark(t, T)) texts.push(b);
  }
  render.texts = texts;
}

size();
window.DUR = DUR;
window.render = render;
window.TEXTS = t => { render(t); return render.texts; };
window.EV = [
  ...[0.15, 0.25, 0.35].map((t, i) => ({ t, type: 'pop', i })),
  ...[0, 1, 2].map(i => ({ t: 0.8 + i * 0.1 + 0.36, type: 'hop', i })), ...[0, 1, 2].map(i => ({ t: 1.3 + i * 0.1 + 0.32, type: 'hop', i, v: 0.7 })),
  { t: 1.9, type: 'swell' }, { t: 2.45, type: 'split' }, { t: 2.95, type: 'label' }, { t: 3.95, type: 'merge' }, { t: 4.75, type: 'land' },
  { t: 4.62, type: 'label' }, { t: 5.3, type: 'wipe' },
  ...STROKE_T.map(([a, b], i) => ({ t: a, type: 'draw', i, dur: b - a })),
  { t: T_HLAND, type: 'drop' }, { t: T_EOUT + 0.32, type: 'roll' },
  ...[0, 1, 2].map(i => ({ t: WAVE1 + i * 0.11 + 0.38, type: 'wave', i })), { t: T_WORD, type: 'word' }, { t: T_TAG, type: 'tag' },
  ...[0, 1, 2].map(i => ({ t: WAVE2 + i * 0.11 + 0.38, type: 'wave', i, v: 0.6 })), { t: 12.2, type: 'end' },
];
const f = new FontFace('Brand', 'url(assets/DMSans.ttf)', { weight: '100 1000' });
f.load().then(x => { document.fonts.add(x); render(0); window.READY = true; });
